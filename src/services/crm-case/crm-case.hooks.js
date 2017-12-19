
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let config = require('config')
var r = require('rethinkdbdash')
let axios = require('axios')
let serviceUrl = 'http://' + config.host + ':' + config.port
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [
	hook => beforeUpdate(hook)
	],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

var getCrmCaseOldData = async( function(id) {
  console.log(serviceUrl, id)
  var data = await (axios.get(serviceUrl + '/crm-case/' + id))
  return data.data
})
var postToHistory = async( function(data) {
  var res = await (axios.post(serviceUrl + '/crm-history', data))
  return res.data
})
var beforeUpdate = async ( function(hook) {
  var oldData = await (getCrmCaseOldData(hook.id))
  var postHistory = await (postToHistory(oldData))
  console.log('oldData', oldData, postHistory)
  console.log('hook.data..........', hook.data, hook.id)
})
