<template lang="pug">
.root
  h1#iconbar
    i.fa.fa-filter( :class="{active: active === 'filter'}", @click="activateFilter")
    input(v-model="searchTerm", :class="{active: active === 'search'}", @blur="close" @keyup.enter="close", placeholder="Search Term")
    |
    |
    i.fa.fa-search( :class="{active: active === 'search'}", @click="activateSearch")
  #box(v-if="active == 'filter'")
    ul
      li
        button(@click="currentFilters = []") Clear
      li(v-for="project in projects")
        input(type="checkbox" @click="toggleFilter(project)", :checked="currentFilters.indexOf(project) > -1")
        span {{project.name}}
</template>

<script>
import lodash from 'lodash'
import path from 'path'

import com from '../com.js'


export default {
  name: 'search-filter',
  data () {
    return {
      active: "",
      currentFilters: [],
      searchTerm: ""
    }
  },
  props: ['projects'],
  watch: {
    searchTerm: _.debounce(function(val) {
      var list
      if (this.currentFilters.length) {
        list = this.currentFilters
      } else {
        list = this.projects
      }
      var results
      com.search(val, list.map(v => v.name))
      .then(results => {
        debugger
        this.eventHub.$emit('search-update', results)
      })
    }, 500)
  },
  methods: {
    activateFilter () {
      if(!(this.active == "filter")) {
        this.active = "filter"
      } else {
        this.active = ""
      }
    },
    activateSearch (el) {
      if(!(this.active == "search")) {
        el.currentTarget.previousElementSibling.focus()
        this.active = "search"
      } else {
        this.active = ""
      }
    },
    toggleFilter (project) {

      var cfRef = this.currentFilters.findIndex(v => v == project)
      if (cfRef !== -1) {
        this.currentFilters.splice(cfRef, 1)
      } else {
        this.currentFilters.push(project)
      }
      console.log(this.currentFilters)
    },
    close () {
      this.active = ''
    }
  }
}
</script>

<style lang="sass" scoped>
  @import "../partials/transition"
  @import "../partials/colors"
  // @import "../partials/settings"

  #iconbar
    position: relative
    margin-top: 0.25em
    z-index: 10
    input
      box-sizing: border-box
      vertical-align: middle
      width: 0
      font-size: 65%
      overflow-x: hidden
      transition: default-trans(width, border-color)
      border-style: none
      border-radius: 9px
      padding-top: 6px
      padding-bottom: 6px
      &.active
        border-style: solid
        border-color: $grey-blue
        width: 20em
        padding-left: 6px
      &:focus
        outline: none

  h1
    padding-left: 3px
    text-align: left
  i
    margin-right: 0.5em
    color: $grey-blue
    transition: default-trans(transform, color)
    &.fa-filter
      &.active
        transform: rotate(90deg)
    &.fa-search
      &.active
        transform: rotate(450deg)

  #box
    position: fixed
    top: 4em
    left: 2em
    border-style: solid
    border-color: $grey-blue
    border-radius: 9px
    background-color: white
    z-index: 11
    ul
      li
        display: block

  #modal
    position: fixed
    top: 0
    right: 0
    z-index: 0
    height: 100vh
    width: 100vw

</style>
