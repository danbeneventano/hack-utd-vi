import Vue from 'vue'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import AppComponent from "./components/AppComponent"
import Vuetify, {VList, VFlex, VSheet, VIcon, VBtn, VSpacer, VSlider} from 'vuetify/lib'
import default_theme from "./default_theme"

Vue.use(Vuetify, {
    components: {VList, VFlex, VSheet, VIcon, VBtn, VSpacer, VSlider}
})

Vue.config.productionTip = false

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

let vuetify = new Vuetify({
    theme: {
        options: {
            customProperties: true,
        },
        dark: false,
        themes: {
            light: {
                primary: default_theme.primaryLight,
                secondary: default_theme.secondaryLight,
                accent: '#B388FF',
                error: '#F44336',
                warning: '#FF9800',
                info: '#607D8B',
                success: '#4CAF50'
            },
            dark: {
                primary: default_theme.primaryDark,
                secondary: default_theme.secondaryDark,
                accent: '#B388FF',
                error: '#F44336',
                warning: '#FF9800',
                info: '#607D8B',
                success: '#4CAF50'
            },
        },
    },
    icons: {
        iconfont: 'mdi',
    },
})

const vm = new Vue({
    vuetify,
    data() {
        return {
          emotionScore: 0,
            description: '',
            highlighted: false,
            disabled: false,
            highlightCount: 0
        }
    },
    render: h => h(AppComponent),
    el: "#app"
})

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    if (!tabs[0].url.startsWith("http")) {
        vm.disabled = true
        return
    }
    chrome.tabs.sendMessage(tabs[0].id, {type: "analyzePage"});
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch (request.type) {
        case "emotionScore":
            const { emotionScore, color, description, highlighted, highlightCount } = request
            const text = `${emotionScore}%`
            chrome.browserAction.setBadgeBackgroundColor({color})
            chrome.browserAction.setBadgeText({text})
            setTimeout(() => {
                vm.emotionScore = emotionScore
                vm.description = description
                vm.highlighted = highlighted
                vm.highlightCount = highlightCount
            }, 25)
            break
        default:
            break
    }
})
