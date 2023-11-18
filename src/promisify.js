'use strict'

/* global chrome */

export const tabsQuery = promisifyChromeMethod(chrome.tabs.query.bind(chrome.tabs))
export const tabsUpdate = promisifyChromeMethod(chrome.tabs.update.bind(chrome.tabs))
export const executeScript = promisifyChromeMethod(chrome.scripting.executeScript.bind(chrome.scripting))
export const sendMessage = promisifyChromeMethod(chrome.runtime.sendMessage.bind(chrome.runtime))
export const sendMessageToTab = promisifyChromeMethod(chrome.tabs.sendMessage.bind(chrome.tabs))
export const tabsReload = promisifyChromeMethod(chrome.tabs.reload.bind(chrome.tabs))
export const getPlatformInfo = promisifyChromeMethod(chrome.runtime.getPlatformInfo.bind(chrome.runtime))
export const actionSetTitle = promisifyChromeMethod(chrome.action.setTitle.bind(chrome.action))

function promisifyChromeMethod (method) {
  return (...args) =>
    new Promise((resolve, reject) => {
      method(...args, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || JSON.stringify(chrome.runtime.lastError)))
        } else {
          resolve(result)
        }
      })
    })
}
