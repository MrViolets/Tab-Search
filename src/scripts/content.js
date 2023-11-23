'use strict'

/* global chrome */

chrome.runtime.onMessage.addListener(onMessageReceived)

function onMessageReceived (message, sender, sendResponse) {
  if (message.context === 'search') {
    const searchQuery = message.searchQuery.toLowerCase()

    // Search in URL and Title
    const urlMatch = document.location.href.toLowerCase().includes(searchQuery)
    const titleMatch = document.title.toLowerCase().includes(searchQuery)

    // Prepare page text for search
    const pageText = document.body.innerText.replace(/\s+/g, ' ').toLowerCase()

    const results = []
    const foundInUrlOrTitle = urlMatch || titleMatch
    let matchFoundAnywhere = foundInUrlOrTitle // Flag for match anywhere
    let startIndex = 0
    let index

    // Search in Page Text
    while ((index = pageText.indexOf(searchQuery, startIndex)) !== -1 && results.length < 3) {
      matchFoundAnywhere = true

      let snippetStart = Math.max(index - 20, 0)
      let snippetEnd = Math.min(index + searchQuery.length + 30, pageText.length)

      snippetStart = findWordBoundary(pageText, snippetStart, true)
      snippetEnd = findWordBoundary(pageText, snippetEnd, false)

      const snippet = pageText.substring(snippetStart, snippetEnd)

      results.push(snippet)

      startIndex = index + searchQuery.length
    }

    sendResponse({ results, matchFoundAnywhere })
  } else if (message.context === 'highlight') {
    findInPage(message.searchQuery)
    sendResponse()
  } else if (message.context === 'checkScriptStatus') {
    sendResponse()
  }
}

function findWordBoundary (text, initialIndex, searchBackward) {
  if (searchBackward) {
    const leftPart = text.substring(0, initialIndex)
    const lastSpace = leftPart.lastIndexOf(' ')
    return lastSpace === -1 ? 0 : lastSpace
  } else {
    const rightPart = text.substring(initialIndex)
    const firstSpace = rightPart.indexOf(' ')
    return firstSpace === -1 ? text.length : initialIndex + firstSpace
  }
}

function findInPage (query, caseSensitive = false) {
  if (window.getSelection) {
    if (window.getSelection().empty) {
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    document.selection.empty();
  }

  window.find(query, caseSensitive)
}
