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

chrome.storage.local.get(['primaryLight', 'primaryDark', 'secondaryLight', 'secondaryDark', 'darkMode'], result => {
  let vuetify = new Vuetify({
    theme: {
      options: {
        customProperties: true,
      },
      dark: result.darkMode === undefined ? false : result.darkMode,
      themes: {
        light: {
          primary: result.primaryLight === undefined ? default_theme.primaryLight : result.primaryLight,
          secondary: result.secondaryLight === undefined ? default_theme.secondaryLight : result.secondaryLight,
          accent: '#B388FF',
          error: '#F44336',
          warning: '#FF9800',
          info: '#607D8B',
          success: '#4CAF50'
        },
        dark: {
          primary: result.primaryDark === undefined ? default_theme.primaryDark : result.primaryDark,
          secondary: result.secondaryDark === undefined ? default_theme.secondaryDark : result.secondaryDark,
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
})


