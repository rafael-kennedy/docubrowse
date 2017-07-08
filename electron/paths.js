const path = require('path')

const rootPath = path.join(__dirname, '..')
const dataPath = path.join(rootPath, 'data')
const dataFile = path.join(dataPath, 'data.json')
const indexFile = path.join(dataPath, 'index.json')
const dataFilesPath = path.join(dataPath, 'files')
const themesPath = path.join(rootPath, "node_modules", "highlight.js", "styles")

module.exports = {rootPath, dataPath, dataFile, dataFilesPath, indexFile, themesPath}
