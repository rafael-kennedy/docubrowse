const {ipcRenderer} = require('electron')
const {dialog} = require('electron').remote
const _ = require('lodash')

const path = require('path');
const fs = require('fs');

function setData(data) {
  return ipcRenderer.send('set_data', data)
}
var debSetData = _.debounce(setData, 2000)

function setProp(prop, val) {
  return ipcRenderer.send('set_data_prop', {prop, val})
}
var debSetProp = _.debounce(setProp, 2000)

var getData = function(){
  return ipcRenderer.sendSync('get_data')
  debugger
}

var addPage = function (url, vueInstance) {
  ipcRenderer.send('add_page', url)
  ipcRenderer.once('add_page', function(event, data){
    vueInstance.preview = data
    vueInstance.thinking = false
  })
}

var addProject = function (projectName, vueInstance) {
  if(!projectName) {
    vueInstance.processing = {msg: "Please select a project Name"}
  }
    ipcRenderer.send('add_project', projectName)
    ipcRenderer.once('add_project', function(){
      vueInstance.processing = {}
    })
}

var search = function (term, projects) {

  return new Promise((resolve, reject)=>{
    ipcRenderer.once('search', function(event, data){
      resolve(data)
    })
    ipcRenderer.send('search', term, projects)
  })
}


module.exports = {
  debSetData,
  debSetProp,
  getData,
  addPage,
  addProject,
  search
}
