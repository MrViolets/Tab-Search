'use strict'

/* global chrome */

import * as ch from './promisify.js'
import * as inject from './scripts/inject.js'

chrome.runtime.onInstalled.addListener(onInstalled)
chrome.runtime.onStartup.addListener(onStartup)

async function onInstalled () {
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
