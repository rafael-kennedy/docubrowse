<template lang="pug">
  #sidebar(:class="{active:active}")
    h1.iconbar: i(class="fa fa-bars", aria-hidden="true", @click="toggleActive", :class="{active:active}")
    #sidebar-content(:class="{active}")
      h2 Options
      ul
        li THEME
        select(v-model="currentTheme")
          option(v-for="option in themeOptions") {{option}}
      add-page(:projects="projects")
</template>

<script>
import {ipcRenderer} from 'electron'
import lodash from 'lodash'

import themes from '../themes'


export default {
  name: 'sidebar',
  data () {
    return {
      active: false,
      themeOptions: Object.keys(themes),
      currentTheme: this.theme
    }
  },
  props: ['theme', 'projects'],
  watch: {
    currentTheme (val) {
      this.eventHub.$emit('set-theme', val)
    }
  },
  methods: {
    toggleActive () {
      this.active = !this.active
    }
  }

}
</script>

<style lang="sass" scoped>
  @import "../partials/transition"
  @import "../partials/colors"
  @import "../partials/settings"

  .iconbar
    margin-top: 0
  #sidebar
    box-sizing: border-box
    font-family: Hack, monospace
    height: 100vh
    margin-right: .1em
    background-color: white
    width: 4em
    padding-top: 0.5em
    padding-right: 1em
    transition: default-trans(background-color, width)
    &.active
      color: $white
      width: 95vw
      background-color: $grey-blue
  #sidebar-content
    position: fixed
    width: 0
    overflow-x: hidden
    transition: default-trans(width)
    &.active
      width: 90vw
  h1
    text-align: right
  i
    transition: transform 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55), color 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)
    color: $grey-blue
    &.active
      transform: rotate(90deg)
      color: white
</style>
