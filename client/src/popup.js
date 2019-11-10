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
  el: '#app',
  vuetify,
  data: {},
  render: h => h(AppComponent)
})

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  chrome.tabs.sendMessage(tabs[0].id, { activate: true });
});
