'use strict'

/* global chrome */

import * as ch from './promisify.js'
import * as inject from './scripts/inject.js'

chrome.runtime.onInstalled.addListener(onInstalled)
chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onMessage.addListener(onMessageReceived)

async function onInstalled (info) {
  await setActionTitle()
  await inject.injectScriptsIfNeeded()
}

async function onStartup () {
  await inject.injectScriptsIfNeeded()
}

async function setActionTitle () {
  const platformInfo = await ch.getPlatformInfo()
  let actionTitle

  if (platformInfo.os === 'mac') {
    actionTitle = `${chrome.i18n.getMessage('EXT_NAME_SHORT')} (${chrome.i18n.getMessage('ACCELERATOR_SEARCH_MAC')})`
  } else {
    actionTitle = `${chrome.i18n.getMessage('EXT_NAME_SHORT')} (${chrome.i18n.getMessage('ACCELERATOR_SEARCH')})`
  }

  await ch.actionSetTitle({ title: actionTitle })
}

async function onMessageReceived (message, sender, sendResponse) {
  if (message.context === 'background') {
    try {
      await ch.tabsUpdate(message.tabId, { active: true })
      await ch.sendMessageToTab(message.tabId, { context: 'highlight', searchQuery: message.searchQuery })
    } catch (error) {
      console.error(error)
    }
  }
}
