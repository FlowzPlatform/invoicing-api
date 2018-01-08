var rp = require('request-promise');
let errors = require('@feathersjs/errors') ;

module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeFind(hook)
    ],
    get: [],
    create: [],
    update: [],
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

beforeFind =async hook =>{
  // console.log(hook.params.query)
  // let res = await validateUser(hook);
  // if(res.code == 401){
  //   throw new errors.NotAuthenticated('Invalid token');
  // }else{

    // console.log("userdetail api response",res);
    // hook.params.query.user = JSON.parse(res).data.email
    // hook.params.query.userId = JSON.parse(res).data._id;
    // hook.params.query.isDeleated = false;
    // if(hook.params.query.isActive == "true")
    // {
    //   hook.params.query.isActive = true;
    //  // hook.params.query.id = 
    // }
    // if(hook.params.query.configId){
    //   hook.params.query.id ={$in : hook.params.query.configId} 
    // }

    // console.log(hook.params.query);
  // }
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