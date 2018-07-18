var rp = require('request-promise');
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let config = require('config')
var r = require('rethinkdbdash')
let errors = require('@feathersjs/errors') ;
let axios = require('axios')
let serviceUrl = 'http://' + config.host + ':' + config.port

let config1 = require('../../customConfig.js');



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

function getCrmCaseOldData(hook){
  return new Promise((resolve , reject) => {
      var data = hook.app.service('crm-case').get(hook.id).then(res => {
        resolve (res.data)
      }).catch(err => {
        console.log("------------------>>>>>>>",err.message, err.name)
        // err.message = "RethinkDB service unavailable"
        if(err.name == 'ReqlDriverError'){
          console.log("@@@@@@@@@@@@@@", err.message)
          //throw err
          resolve ({error: err.name, message:'RethinkDB service unavailable'})

          // throw new  errors.GeneralError("RethinkDB service unavailable");
        } else {
          resolve (err)
          } 
      })
  /* var data = await (axios.get(serviceUrl + '/crm-case/' + hook.id).then(res => {
  }).catch(err=>{
  })) */
  })
}

// var postToHistory = async( function(data) {
//   var res = await (axios.post(serviceUrl + '/crm-history', data))
//   return res.data
// })

async function beforeUpdate(hook){
  console.log("inside before upload")
  let res = await validateUser(hook);
  res = JSON.parse(res);
   if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    var oldData = await getCrmCaseOldData(hook)
  // var postHistory = await (postToHistory(oldData))
  console.log('oldData', oldData)
  console.log('hook.data..........', hook.data, hook.id)
  if(oldData.error != 'ReqlDriverError'){
    if(hook.data.fileupload != undefined){
      var indexforUrl = hook.data.fileupload.length
      var urlforCloudinary = hook.data.fileupload[indexforUrl-1].url
      var res1 = await app.service('cloudinaryupload').create({file :hook.data.fileupload[indexforUrl-1], folder:"crm/relationship/"+res.data.email})   
      console.log('res1-------->',res1.url)    
      var fileobj = {
        "filename":hook.data.fileupload[indexforUrl-1].filename,
        "url":res1.secure_url,
        "public_id":res1.public_id
      };
      console.log('res1-------->',res1.url)
      hook.data.fileupload[indexforUrl-1] = fileobj;
      
    }
    if(hook.data.filename != undefined){
      console.log('hook.data.filename',hook.data.filename)
      oldData.fileupload.forEach((item,index) => {
        if(item.url == hook.data.url){
          oldData.fileupload.splice(index, 1);
        }
      })
      console.log('___________________________',oldData)
      var res1 = await(hook.app.service("/crm-case").update(hook.id,oldData))
      console.log("res.....",res1)
      hook.result = res1;
    }
  }else{
    console.log("Error.......___________Dweepp",oldData)
  }
  }
}



beforecreate = async hook => {
  let res = await validateUser(hook);

  res = JSON.parse(res);

  var fileurl = []
  //let response = await checkDefaultConfig(hook , res)
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    console.log('res-------------->',res.data.email)
    if(hook.data.fileupload != undefined){
      var res1 = await app.service('cloudinaryupload').create({file : hook.data.fileupload[0], folder:"crm/relationship/"+res.data.email})
      console.log('res1-------->',res1.url)
      var fileobj = {
        "filename": hook.data.fileupload[0].filename,
        "url": res1.secure_url,
        "public_id":res1.public_id
      };
      console.log('fileobj--->',hook.data.fileupload[0])
      hook.data.fileupload[0] = fileobj;
    }
    
    hook.data.createdAt = new Date();
    hook.data.userId = res.data._id;
    hook.data.user = res.data.email;
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
    
     axios({
        method : 'GET',
        url : config1.default.userDetailURL,
        strictSSL: false,
        headers: {
            "Authorization" : apiHeaders.authorization
        }
     })
     .then(function (response) {
      //  console.log("11111111111111111111111",response.data)
          resolve(response)
      })
      .catch(function (error) {
        console.log("%%%%%%%%%%%%",error)
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


