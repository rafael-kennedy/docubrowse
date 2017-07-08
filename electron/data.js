// Electron Imports
const {app, BrowserWindow, ipcMain, dialog} = require('electron')

// Node Imports
const path = require('path')
const url = require('url')
const fs = require('fs')

// Other Imports
const _ = require('lodash')
const paths = require('./paths')
const {syntaxThemes} = require('./themes')
const lunr = require('lunr')
const recursiveReaddir = require('recursive-readdir')

var scanDirs = function (pathArray) {
  var count = pathArray.length
  var readmes = []
  return new Promise((resolve, reject) => {
    pathArray.forEach(filePath => {
      recursiveReaddir(filePath, (err, files) => {
        if (err) {
          reject(err)
        }
        var out = files.filter(file => path.basename(file).toUpperCase() === 'README.MD')
        readmes = readmes.concat(out)
        count--
        if (!count) {
          resolve(readmes)
        }
      })
    })
  })
}


// Returns function that can easily be chained into a promise
function grabFile(file) {
  return function() {
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}

class Project {
  constructor (projName, inPath) {
    if (Array.isArray(inPath)) {
      this.paths = inPath
    } else {
      this.paths = [inPath]
    }

    this.name = projName
    this.ready = this.scan()
  }

  static addNew (projName) {
    var openDirPromise = function (obj) {
      if (!obj) {
        obj = {
          title: 'Open Files',
          properties: [
            'openDirectory',
            'multiSelections'
          ]
        }
      }
      return new Promise((resolve, reject) => {
        try {
          dialog.showOpenDialog(obj, function (pathArray) {
            resolve(pathArray)
          })
        } catch (e) {
          reject(e)
        }
      })
    }

    var newProject
    return openDirPromise().then(paths => {
      newProject = new Project(projName, paths)
      return newProject.ready
    }).then(v => {
      data.projects.push(newProject)
      data.write()
    })
  }

  addFile (path) {
    var proj = this
    if (data.files[path]) {
      data.files[path].addProject(proj)
      data.files[path].updateText()
    } else {
      data.files[path] = new File({projects: proj, path})
    }
  }

  scan () {
    return new Promise((resolve, reject) => {
      scanDirs(this.paths)
      .then(paths => {
        this.scanned = new Date()
        paths.forEach(this.addFile, this)
        resolve(this)
      })
    }).then(() => {
      index.build().then(() => {
        index.write()
      })
    })
  }
}

class File {
  constructor ({projects, path: inPath, notes, tags}) {
    if (!Array.isArray(projects)) {
      projects = [projects]
    }
    this.projects = projects || ['global']
    this.path = inPath
    this.pathArray = path.dirname(inPath).split(path.sep)
    this.name = this.pathArray[this.pathArray.length - 1]
    this.tags = tags || []
    this.notes = notes || []
    this.ready = this.updateText()
  }

  updateText () {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, 'utf8', (err, data) => {
        if (err) {
          console.log(err)
          this.text = 'scanning error'
          reject(this)
        } else {
          this.text = data
          resolve(this)
        }
      })
    })
  }

  hasTag (tagText) {
    return this.tags.indexOf(tagText) > -1
  }
  addTag (tagText) {
    if (this.hasTag(tagText)) {
      this.tags = this.tags.push(tagText)
    }
  }
  removeTag (tagText) {
    let pos = this.tags.indexOf(tagText)
    if (!pos === -1) {
      this.tags = this.tags.splice(pos, 1)
    }
  }

  hasProject (project) {
    return this.projects.indexOf(project) > -1
  }
  addProject (project) {
    if (this.hasProject(project)) {
      this.projects = this.projects.push(project)
    }
  }
  removeProject (project) {
    let pos = this.projects.indexOf(project)
    if (!pos === -1) {
      this.projects = this.projects.splice(pos, 1)
    }
  }
}

var data
var index

module.exports = {

  init () {
    index = {
      build () {
        return data.allReady().then(() => {
          this.idx = lunr(function () {
            this.ref('path', {boost: 50})
            this.field('text')
            this.field('tags', {boost: 25})
            this.field('notes')
            Object.values(data.files).forEach(v => {
              this.add(v)
            })
          })
        })
      },
      search (term) {
        return data.allReady().then(v => {
          if (!this.idx) {
            return this.build().then(() => {
              return this.idx.search(term)
            })
          } else {
            return Promise.resolve(this.idx.search(term))
          }
        })
      },
      loadOrBuild (filePath = paths.indexFile) {
        debugger
        return data.allReady().then(grabFile(filePath)).then(data => {
          return JSON.parse(data)
        }).then(data => {
          index.idx = lunr.Index.load(data)
        }).catch(err => {
          console.log(err)
          index.build().then(() => {
            index.write()
          })
        })
      },
      write (filePath = paths.indexFile) {
        return new Promise((resolve, reject) => {
          fs.writeFile(filePath, JSON.stringify(index.idx), (err, data) => {
            if (err) {
              reject(err)
            } else {
              resolve(data)
            }
          })
        })
      }
    }

    try {
      data = fs.readFileSync(paths.dataFile, 'utf8')
      data = JSON.parse(data)
    } catch (e) {
      console.log('Data File is corrupted or missing. Rewriting default.')
      data = {
        theme: 'default',
        projects: [],
        files: {}
      }
    }
    data.themeOptions = syntaxThemes
    data.write = function (path = paths.dataFile) {
      outData = {
        theme: data.theme,
        projects: data.projects.map(proj => {
          return {
            name: proj.name,
            paths: proj.paths
          }
        }),
        files: _.mapValues(data.files, file => {
          return {
            path: file.path,
            projects: file.projects.map(proj => proj ? proj.name : null),
            notes: file.notes,
            tags: file.tags
          }
        })
      }
      return new Promise((resolve, reject) => {
        fs.writeFile(paths.dataFile, JSON.stringify(outData), (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
      }).then(() => {
        index.write()
      })
    }
    data.allReady = function () {
      return Promise.all(Object.values(data.files).map(v => v.ready))
    }
    if (data.projects.length) {
      data.projects = data.projects.filter(p => p).map(proj => new Project(proj.name, proj.paths))
    } else {
      data.projects = []
    }
    debugger
    Object.keys(data.files).forEach(path => {
      data.files[path] = new File(data.files[path])
    })
    data.allReady()
      .then(vals => {
        return data.write()
      }).then(() => {
        return index.loadOrBuild()
      })
      .catch(errs => {
        console.log('file failure:' + errs)
      })

    return {data, index, File, Project}
  },

  getData () {
    return data
  }
}
