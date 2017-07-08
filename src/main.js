import Vue from 'vue'
import App from './App.vue'
require("font-awesome-webpack")

const eventHub = new Vue() // Single event hub

// Distribute to components using global mixin
Vue.mixin({
    data: function () {
        return {
            eventHub: eventHub
        }
    }
})

Vue.component('sidebar', require('./components/sidebar.vue'))
Vue.component('search-results', require('./components/search-results.vue'))
Vue.component('add-page', require('./components/add-page.vue'))
Vue.component('search-filter', require('./components/search-filter.vue'))


new Vue({
  el: '#app',
  render: h => h(App)
})
