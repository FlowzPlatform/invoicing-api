var rp = require('request-promise');
let errors = require('@feathersjs/errors') ;
let axios = require("axios")
module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeFind(hook)
    ],
    get: [
      hook => beforeGet(hook)
    ],
    create: [
      hook => beforecreate(hook)
    ],
    update: [],
    patch: [
      hook => beforepatch(hook)
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
    get: [
      hook => errorGet(hook)
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

async function  beforecreate (hook) {
  let res = await validateUser(hook);

  let response = await alreadyAvailable(hook , res)
  console.log(response)
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    //hook.result = "created"

    if(hook.data.domain == 'custom' && response > 0){
      hook.result = "Custom Config is already available for this user"
    }else{
      hook.data.createdAt = new Date();
      hook.data.userId = res.data.data._id;
      hook.data.user = res.data.data.email;

    }

  }
}

 async function beforeGet(hook){
  //hook.result = "any data"
}

async function errorGet(hook) {

}


// beforeFind =async hook =>{
//   // console.log(hook.params.query)
//   // let res = await validateUser(hook);
//   // if(res.code == 401){
//   //   throw new errors.NotAuthenticated('Invalid token');
//   // }else{


//    //################## COmmented : check user with token
//     // hook.params.query.userId = JSON.parse(res).data._id;
//      //#################### COmmented : check user with token

//     if( hook.params.query.user == undefined){
//       throw new errors.NotAcceptable("please provide user email")
//     }

//     hook.params.query.isDeleated = false;
//     if(hook.params.query.isActive == "true")
//     {
//       hook.params.query.isActive = true;
//      // hook.params.query.id =
//     }
//     if(hook.params.query.configId){
//       hook.params.query.id ={$in : hook.params.query.configId}
//     }

//     console.log(hook.params.query);



//  // }
// }


 async function beforeFind(hook){
  console.log(hook.params.query)
  let res = await validateUser(hook);
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
   //  let getMultipleDataRes = await getMultipleData(hook);
    // console.log(">>>>>>>>>>>>>>>> "  , res)
    hook.params.query.userId = res.data.data._id;
    hook.params.query.isDeleated = false;
    if(hook.params.query.isActive == "true")
    {
      hook.params.query.isActive = true;
     // hook.params.query.id =
    }
    if(hook.params.query.configId){
      hook.params.query.id ={$in : hook.params.query.configId}
    }

    console.log(hook.params.query);
  }
}


beforepatch = async hook =>{
  //console.log(hook)
  let res = await validateUser(hook);
  // console.log(res)
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    hook.data.updatedAt = new Date();
    hook.data.updatedBy = res.data.data.email
  }
}

// validateUser =data =>{
async function validateUser(data) {

    var options = {
      uri: process.env.userDetailURL,
      headers: {
        Authorization : apiHeaders.authorization
      }
  };
  return new Promise((resolve , reject) =>{

    // rp(options)
    // .then(function (parsedBody) {
    //     console.log(parsedBody)
    //     resolve(parsedBody)
    // })
    // .catch(function (err) {
    //   console.log(err)
    //   resolve({"code" : 401 })
    // });
    axios.get(process.env.userDetailURL, {
              strictSSL: false,
              headers: {
                "Authorization" : apiHeaders.authorization
              }
            })
            .then(function (response) {
             // console.log(response)
                resolve(response)
            })
            .catch(function (error) {
              console.log("%%%%%%%%%%%%",error)
                resolve({"code" : 401 })
            });
  })
}


function alreadyAvailable(hook , res) {
  return new Promise((resolve , reject) =>{
    app.service('settings').find({query: {userId : res.data.data._id, domain:"custom"}}).then(settings => {
          // console.log(">>>>>>>>>>>>>>>>> " , settings.data.length)
          resolve(settings.data.length)
    })
  })


} 

