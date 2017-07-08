<template lang="pug">
.display
  .supercontent(v-if="inText", v-html="outHTML")
</template>
<script>
// Actual default values
var hljs = require('highlight.js'); // https://highlightjs.org/

// Actual default values
var md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' + hljs.highlight(lang, str, true).value + '</code></pre>';
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

export default {
  name: 'display',
  data () {
    return {}
  },
  computed: {
    outHTML() {
      return md.render(this.inText)
    }
  },
  props: ['inText']
}
</script>
<style lang="sass">
  @import "../partials/transition"
  @import "../partials/colors"
  @import "../../node_modules/highlight.js/styles/atom-one-light.css"
  .display, .content
    background-color: darken($grey-blue, 15%)
    color: $white
    padding-left: 1em
</style>
