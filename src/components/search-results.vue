<template lang="pug">
.root
  #search-results
    ul(v-if="showList")
      li(v-for="file in list", @click="showFile(file)")
        span(:title="file.file.path") {{file.file.name}}
    a(v-if='! showList', @click='showList = true') Show Results
    #display()
      component(:is="theme", :inText="outText")
</template>

<script>
import {ipcRenderer} from 'electron'
import lodash from 'lodash'

import com from '../com.js'

import themes from '../themes'



export default {
  name: 'search-results',
  data () {
    return {
      list: [],
      showList: true,
      displayItem: ''
    }
  },
  props: ['theme'],
  computed: {
    outText () {
      if (this.displayItem) {
        return this.displayItem.file.text
      } else {
        return ''
      }
    }
  },
  watch: {
  },
  components: themes,
  methods: {
    showFile (file) {
      this.displayItem = file
      this.showList = false
    }
  },
  created() {
    var _that = this
    this.eventHub.$on('search-update', function(files){

      _that.list = files
      _that.showList = true
    })
  }
}
</script>

<style lang="sass" scoped>
  @import "../partials/transition"
  @import "../partials/colors"
  @import "../partials/settings"

  #display
    text-align: left


</style>
