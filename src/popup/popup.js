'use strict'

/* global chrome */

import * as ch from '../promisify.js'
import * as inject from '../scripts/inject.js'
import * as navigation from './navigation.js'

document.addEventListener('DOMContentLoaded', init)

async function init () {
  await insertStrings()
  registerListeners()
  navigation.init()

  const searchInputEl = document.getElementById('search')
  searchInputEl.focus()

  let isIndexingComplete = false

  const updatePlaceholderAfterDelay = () => {
    setTimeout(() => {
      if (!isIndexingComplete) {
        searchInputEl.placeholder = chrome.i18n.getMessage('PLACEHOLDER_INDEXING')
      }
    }, 100)
  }

  updatePlaceholderAfterDelay()

  await inject.injectScriptsIfNeeded()

  isIndexingComplete = true
  searchInputEl.placeholder = chrome.i18n.getMessage('PLACEHOLDER_SEARCH')
}

async function insertStrings () {
  const accelerators = document.querySelectorAll('[data-accelerator]')

  const platformInfo = await ch.getPlatformInfo().catch((error) => {
    console.error(error)
  })

  if (accelerators) {
    for (const a of accelerators) {
      if (platformInfo.os === 'mac') {
        a.innerText = chrome.i18n.getMessage(`ACCELERATOR_${a.dataset.accelerator}_MAC`)
      } else {
        a.innerText = chrome.i18n.getMessage(`ACCELERATOR_${a.dataset.accelerator}`)
      }
    }
  }
}

function registerListeners () {
  document.getElementById('search').addEventListener('input', onSearchInput, false)
  document.getElementById('results').addEventListener('click', onResultsClicked, false)
}

async function onSearchInput () {
  const query = this.value
  const searchBarEl = document.querySelector('.search-bar')
  const resultsContainerEl = document.getElementById('results')
  const acceleratorEl = document.querySelector('.accelerator')

  if (query.length === 0) {
    acceleratorEl.classList.remove('hidden')
    searchBarEl.classList.remove('shadow')
    resultsContainerEl.innerHTML = ''
    return
  }

  const allTabs = await ch.tabsQuery({ url: ['*://*/*'] })
  const searchPromises = allTabs.map((tab) =>
    ch
      .sendMessageToTab(tab.id, { context: 'search', searchQuery: query })
      .then((response) =>
        response.matchFoundAnywhere
          ? {
              id: tab.id,
              url: tab.url,
              hostname: new URL(tab.url).hostname,
              title: tab.title,
              searchQuery: query,
              results: response.results
            }
          : null
      )
      .catch((error) => {
        console.error('Cannot send message to', tab.url, error)
        return null
      })
  )

  const results = (await Promise.allSettled(searchPromises)).filter((result) => result.status === 'fulfilled' && result.value !== null).map((result) => result.value)

  resultsContainerEl.innerHTML = ''
  acceleratorEl.classList.add('hidden')
  searchBarEl.classList.add('shadow')

  for (const result of results) {
    if (result) {
      renderSearchResult(result, resultsContainerEl)
    }
  }

  if (results.length > 0) {
    navigation.selectFirstOption()
  }
}

function renderSearchResult (searchResult, parent) {
  const resultEl = document.createElement('div')
  resultEl.dataset.id = searchResult.id
  resultEl.classList.add('result', 'nav-index')

  const mainContainer = document.createElement('div')
  mainContainer.classList.add('tab-details')

  const faviconContainer = document.createElement('div')
  faviconContainer.classList.add('favicon-container')

  const faviconEl = document.createElement('img')
  const extensionId = chrome.runtime.id
  const faviconUrl = `chrome-extension://${extensionId}/_favicon/?pageUrl=${encodeURIComponent(searchResult.url)}&size=32`
  faviconEl.setAttribute('src', faviconUrl)
  faviconEl.setAttribute('width', '32')
  faviconEl.setAttribute('height', '32')
  faviconEl.classList.add('favicon')

  faviconContainer.appendChild(faviconEl)

  mainContainer.appendChild(faviconContainer)

  const titleUrlContainer = document.createElement('div')
  titleUrlContainer.classList.add('title-url-container')

  const tabTitle = document.createElement('div')
  tabTitle.innerHTML = highlightText(searchResult.title, searchResult.searchQuery)
  tabTitle.classList.add('title')

  const tabUrl = document.createElement('div')
  tabUrl.innerText = searchResult.hostname
  tabUrl.classList.add('url')

  titleUrlContainer.appendChild(tabTitle)
  titleUrlContainer.appendChild(tabUrl)

  mainContainer.appendChild(titleUrlContainer)

  resultEl.appendChild(mainContainer)

  const maxResultsToShow = 3
  for (let i = 0; i < Math.min(searchResult.results.length, maxResultsToShow); i++) {
    const result = searchResult.results[i]
    if (typeof result === 'string') {
      const highlightedResult = highlightText(result, searchResult.searchQuery)

      const individualResult = document.createElement('div')
      individualResult.innerHTML = highlightedResult
      individualResult.classList.add('result-line')
      resultEl.appendChild(individualResult)
    }
  }

  parent.appendChild(resultEl)
}

function highlightText (text, query) {
  const escapedQuery = escapeRegExp(query)
  return text.replace(new RegExp(escapedQuery, 'gi'), (match) => `<mark>${match}</mark>`)
}

function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function onResultsClicked (e) {
  if (e.target.classList.contains('result')) {
    const tabId = parseInt(e.target.dataset.id)
    const searchQuery = document.getElementById('search').value

    try {
      // await ch.tabsUpdate(tabId, { active: true })
      await ch.sendMessage({ context: 'background', tabId, searchQuery })
    } catch (error) {
      console.error(error)
    }
  }
}
