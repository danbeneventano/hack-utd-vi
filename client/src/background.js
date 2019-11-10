import axios from 'axios'
import {API_URL} from "./api-url";

global.browser = require('webextension-polyfill')

chrome.contextMenus.create({
    title: "Analyze Objectivity",
    contexts: ["selection"],
    onclick: async (info, tab) => {
        let text = info.selectionText
        text = text.replace(/(\r\n|\n|\r)/gm,"")
        let {data} = await axios.post(`${API_URL}/analyzeEntities`, { text })
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { data });
        });
    }
})
