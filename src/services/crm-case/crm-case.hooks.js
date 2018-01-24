var rp = require('request-promise');
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let config = require('config')
var r = require('rethinkdbdash')
let errors = require('@feathersjs/errors') ;
let axios = require('axios')
let serviceUrl = 'http://' + config.host + ':' + config.port
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


beforecreate = async hook => {
  let res = await validateUser(hook);
  //let response = await checkDefaultConfig(hook , res)
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    hook.data.createdAt = new Date();
     hook.data.userId = JSON.parse(res).data._id;
     hook.data.user = JSON.parse(res).data.email;
  }
}

validateUser =data =>{
    var options = {
      uri: process.env.userDetailApi,
      headers: {
        Authorization : apiHeaders.authorization
      }
  };
  return new Promise((resolve , reject) =>{
    rp(options)
    .then(function (parsedBody) {
        resolve(parsedBody)
    })
    .catch(function (err) {
      resolve({"code" : 401 })
    });
  })
}

beforeFind =async hook =>{
  console.log(hook.params.query)
  let res = await validateUser(hook);
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
   //  let getMultipleDataRes = await getMultipleData(hook);
   // console.log(">>>>>>>>>>>>>>>> "  , getMultipleDataRes)
    hook.params.query.userId = JSON.parse(res).data._id;
    
    

    console.log(hook.params.query);
  }
}

checkDefaultConfig = (data , res) => {
  console.log(res)
  
  let findUser = JSON.parse(res).data._id;
  console.log(app.service('settings'))
  // app.service('settings').find({userId : findUser}).then(settings => {
  //   console.log(settings)
  // })
  return true;
}