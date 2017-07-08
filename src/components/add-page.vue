<template lang="pug">
  #add-page
    h2
      | Add Projects:
    p URL #[input(v-model="projName", placeholder="project name...")]
    button(v-if="projName" @click="addProject", :class="{thinking}") Add

    h2 Add Pages:
    p URL #[input(v-model="addUrl", placeholder="url...")]
    button(@click="addPage", :class="{thinking}") Add
    #preview PREVIEW
    p {{preview}}

    #msg(v-if="processing.msg")
      i.fa.fa-spinner
      #proc-msg {{processing.msg}}
</template>

<script>
import {ipcRenderer} from 'electron'
import lodash from 'lodash'

const com = require('../com.js')

export default {
  name: 'add-page',
  data () {
    return {
      projName: "",
      currentProject: "",
      addUrl: "",
      thinking: false,
      preview: "",
      processing: {msg: ""}
    }
  },
  props: ['projects'],
  watch: {
  },
  methods: {
    addPage () {
      com.addPage(this.addUrl, this)
      this.addUrl = ""
      this.thinking = true
    },
    addProject () {
      com.addProject(this.projName,this)
      this.eventHub.$emit('update-data')
    }
  }

}
</script>

<style lang="sass" scoped>
  @import "../partials/transition"
  @import "../partials/colors"
  @import "../partials/settings"

</style>
