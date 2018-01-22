
var rp = require('request-promise');
let errors = require('@feathersjs/errors') ;
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

beforecreate = async hook => {
  let res = await validateUser(hook);
  let response = await checkDefaultConfig(hook , res)
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    hook.data.createdAt = new Date();
     hook.data.userId = JSON.parse(res).data._id;
     hook.data.user = JSON.parse(res).data.email;
  }
}

beforeGet =async  hook => {
  //hook.result = "any data"
}

errorGet = async hook=>{
  
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
   // console.log(">>>>>>>>>>>>>>>> "  , getMultipleDataRes)
    hook.params.query.userId = JSON.parse(res).data._id;
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
  console.log(res)
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    hook.data.updatedAt = new Date();
    hook.data.updatedBy = JSON.parse(res).data.email
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

checkDefaultConfig = (data , res) => {
  console.log(res)
  
  let findUser = JSON.parse(res).data._id;
  console.log(app.service('settings'))
  // app.service('settings').find({userId : findUser}).then(settings => {
  //   console.log(settings)
  // })
  return true;
}
