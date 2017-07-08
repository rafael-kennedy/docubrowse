<template lang="pug">
.display
  .supercontent(v-html="outHTML")
</template>
<script>
var hljs = require('highlight.js')
var md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>'
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

export default {
  name: 'display',
  data () {
    return {}
  },
  computed: {
    outHTML () {
      return md.render(this.inText)
    }
  },
  props: ['inText']
}

</script>
<style lang="sass" scoped>
  @import "../../node_modules/highlight.js/styles/obsidian.css"

</style>
