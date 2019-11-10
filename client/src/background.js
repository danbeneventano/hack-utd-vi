global.browser = require('webextension-polyfill')

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.browserAction.setBadgeText({ text: '' })
});

chrome.tabs.onCreated.addListener(function(tab) {
    chrome.browserAction.setBadgeText({ text: '' })
});
