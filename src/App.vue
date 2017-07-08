<template>
  <div id="app">
    <div id="sidebar-container">
      <sidebar :theme='theme' :themeOptions='themeOptions' :projects='projects'></sidebar>
    </div>
    <div class="content" v-if="!status.msg">
      <search-filter :projects="projects"></search-filter>
      <search-results :theme="theme"></search-results>
      <p>
      </p>
    </div>
    <div v-if="status.msg">
      <h1>{{status.msg}}</h1>
    </div>
  </div>
</template>

<script>
import com from './com.js'
import {ipcRenderer} from 'electron'

export default {
  name: 'app',
  data () {
    return {
      status: {msg: 'Loading...'},
      projects: [],
      files: [],
      theme: 'default'
    }
  },
  created () {
    var _that = this
    this.updateData()
    this.clearStatus()
    this.eventHub.$on('set-theme', (val) => {
      debugger
      _that.theme = val
    })
    ipcRenderer.on('data-update', (inData) => {
      _that.updateData()
    })
  },
  methods: {
    updateData() {
      let newData = com.getData()
      let fArray = ["projects", "files", "theme", "themeOptions"]
      fArray.forEach(f => {
        this[f] = newData[f]
      })
    },
    clearStatus () {
      this.status = {}
    }
  }
}
</script>

<style lang="scss">
@import 'assets/css/hack-extended.css';
body {
  margin: 0;
  overflow-x: hidden;
}
#app {
  display: flex;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.content {
  box-sizing: border-box;
  min-width: calc(100vw - 4em)
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
