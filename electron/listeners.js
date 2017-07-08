// Electron Imports
const {app, BrowserWindow, ipcMain} = require('electron')

// Node Imports
const path = require('path')
const url = require('url')
const fs = require('fs')
const https = require('https')

// Other Imports
const _ = require('lodash')
const toMarkdown = require('to-markdown')


function getURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const { statusCode } = res
      const contentType = res.headers['content-type']
      let error
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n'+`Status: ${statusCode}`)
      }
      if (error) {
        reject(error)
        res.resume()
        return
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        resolve(rawData)
      })
    })
  })
}



module.exports = function (win) {

  var dataMod = require('./data.js')
  var obj = dataMod.init()
  var {data, index, File, Project} = obj

  function sendDataUpdate() {
    win.webContents.send('data-update', data)
  }

  ipcMain.on('get_data', event => {
    event.returnValue = data
  })
  ipcMain.on('set_data', (event, inData) => {
    data.setData(inData)
  })
  ipcMain.on('set_data_prop', (event, inData) => {
    data = _.set(data, inData.prop, inData.val)
    data.write()
  })

  ipcMain.on('add_page', (event, url) => {
    getURL(url).then(data => {
      let out = toMarkdown(data)
      event.sender.send('add_page', out)
    })
  })
  ipcMain.on('add_project', (event, projectName) => {
    Project.addNew(projectName).then(() => {
      sendDataUpdate()
    })
  })
  ipcMain.on('search', (event, term, projects) => {
    debugger
    index.search(term).then(results => {
      results.forEach(res => {
        res.file = data.files[res.ref]
      })
      event.sender.send('search', results)
    })
  })
}
