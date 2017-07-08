const path = require('path')
const paths = require('./paths')
const fs = require('fs')

var syntaxThemes = fs.readdirSync(paths.themesPath)

module.exports = {
  syntaxThemes
}
