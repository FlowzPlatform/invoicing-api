let async = require('asyncawait/async');
let await = require('asyncawait/await');
let config = require('config')
var r = require('rethinkdbdash')

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


var beforeUpdate = async ( function(hook) {
  console.log('hook.data..........', hook.data)
})
