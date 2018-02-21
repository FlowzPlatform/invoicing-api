var rp = require('request-promise');
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let config = require('config')
var r = require('rethinkdbdash')
let errors = require('@feathersjs/errors') ;
let axios = require('axios')
let serviceUrl = 'http://' + config.host + ':' + config.port
var cloudinary = require('cloudinary');
let config1 = require('../../customConfig.js');

cloudinary.config({ 
      cloud_name: config1.default.cloudinary_cloud_name,
      api_key: config1.default.cloudinary_api_key, 
      api_secret: config1.default.cloudinary_api_secret 
    });

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
	// hook => beforeUpdate(hook)
	],
    patch: [
    hook => beforeUpdate(hook)
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

var getCrmCaseOldData = async( function(id) {
  console.log(serviceUrl, id)
  var data = await (axios.get(serviceUrl + '/crm-case/' + id))
  return data.data
})

// var postToHistory = async( function(data) {
//   var res = await (axios.post(serviceUrl + '/crm-history', data))
//   return res.data
// })

var beforeUpdate = async hook => {
  console.log('inside beforeUpdate')
  var oldData = await (getCrmCaseOldData(hook.id))
  // var postHistory = await (postToHistory(oldData))
  console.log('oldData', oldData)
  var indexforUrl = hook.data.fileupload.length
  var urlforCloudinary = hook.data.fileupload[indexforUrl-1].url
  await cloudinary.v2.uploader.upload(urlforCloudinary,
      { resource_type: "raw",folder: "crm/images"},
      function(error, result) {
        if(error){
          console.log('&&&&&&&&&&',error)
        }else{       
          console.log(result);
          var fileobj = {
            "filename":hook.data.fileupload[indexforUrl-1].filename,
            "url":result.url
          };
          hook.data.fileupload[indexforUrl-1] = fileobj;
        }
      });
  console.log('hook.data..........', hook.data, hook.id)
}


beforecreate = async hook => {
  let res = await validateUser(hook);
  var fileurl = []
  //let response = await checkDefaultConfig(hook , res)
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    if(hook.data.fileupload != undefined){
      await cloudinary.v2.uploader.upload(hook.data.fileupload[0].url,
      { resource_type: "raw",folder: "crm/images"},
      function(error, result) {
        if(error){
          console.log('&&&&&&&&&&',error)
        }else{       
          console.log(result);
          var fileobj = {
            "filename":hook.data.fileupload[0].filename,
            "url":result.url
          }
          fileurl.push(fileobj)
          hook.data.fileupload = fileurl;
        }
      });
    }
    
    hook.data.createdAt = new Date();
    hook.data.userId = JSON.parse(res).data._id;
    hook.data.user = JSON.parse(res).data.email;
  }
}

validateUser =data =>{
    var options = {
      uri: config1.default.userDetailURL,
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
  
  // app.service('settings').find({userId : findUser}).then(settings => {
  //   console.log(settings)
  // })
  return true;
}