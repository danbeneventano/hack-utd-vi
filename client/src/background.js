global.browser = require('webextension-polyfill')

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.browserAction.setBadgeText({ text: '' })
});

chrome.tabs.onCreated.addListener(function(tab) {
    chrome.browserAction.setBadgeText({ text: '' })
});

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.browserAction.setBadgeText({ text: '' })
    if (tabMap.has(activeInfo.tabId)) {
        const { text, color } = tabMap.get(activeInfo.tabId)
        chrome.browserAction.setBadgeText({ text })
        chrome.browserAction.setBadgeBackgroundColor({ color })
    }
})

const tabMap = new Map()

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch (request.type) {
        case "emotionScore":
            const { emotionScore, color } = request
            const text = `${emotionScore}%`
            tabMap.set(sender.tab.id, { text, color })
            break
        default:
            break
    }
})