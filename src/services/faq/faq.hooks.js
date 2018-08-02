let errors = require('@feathersjs/errors') ;

let _ = require('lodash');
let r = require('rethinkdb');
const config = require("config");

module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeFind(hook)
    ],
    get: [],
    create: [
      hook => beforecreate(hook)
    ],
    update: [],
    patch: [
      hook => beforePatch(hook)
    ],
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

function beforeFind(hook) {
  console.log('hook.params before find',hook.params)
  // if (hook.params.websiteId == undefined) {
  //   throw new errors.GeneralError('WebsiteId is required');
  // }
}

async function beforecreate(hook) {
  console.log('hook inside before create',hook.data);
}

async function beforePatch(hook) {
  console.log(hook.data); 
  if (hook.data.patchFaq) {
    let oldData = await app.service('faq').find({query: {websiteId: hook.data.websiteId}})
    console.log('oldData',oldData);
    let oldFaq = oldData.data[0].faq;
    oldFaq = oldFaq.map(function(item) { return item.queId == hook.data.patchFaq.queId ? hook.data.patchFaq : item; });
    console.log('final faq', oldFaq);
    hook.data['faq'] = oldFaq;
    delete hook.data.patchFaq;
  }
  if (hook.data.deleteFaq) {
    let oldData = await app.service('faq').find({query: {websiteId: hook.data.websiteId}})
    console.log('oldData',oldData);
    let oldFaq = oldData.data[0].faq;
    oldFaq = oldFaq.filter(function(item) { return item.queId != hook.data.deleteFaq.queId });
    console.log('final faq', oldFaq);
    hook.data['faq'] = oldFaq;
    delete hook.data.deleteFaq;
  }
}