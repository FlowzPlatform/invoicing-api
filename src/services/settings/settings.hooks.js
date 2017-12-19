
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

beforecreate = async hook => {
  let res = await validateUser(hook);
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    hook.data.createdAt = new Date();
     hook.data.userId = JSON.parse(res).data._id;
     hook.data.user = JSON.parse(res).data.email;
  }
}

beforeGet =async  hook => {
  hook.result = "any data"
}

beforeFind =async hook =>{
  let res = await validateUser(hook);
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    hook.params.query.userId = JSON.parse(res).data._id
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
