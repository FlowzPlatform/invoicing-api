let errors = require('@feathersjs/errors') ;
let axios = require("axios");

// let _ = require('lodash');
let r = require('rethinkdb');
const config = require("config");
let config1 = require('../../customConfig.js');

let connection;
let response;
r.connect({
  host: config.get('rdb_host'),
  port: config.get("rdb_port"),
  db: 'invoicing_api'
}, function(err, conn) {
  if (err) throw err;
  connection = conn
})

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

async function beforeFind(hook){
	console.log("---------------",hook.params.query)
	// let res = await validateUser(hook);
	// if(res.code == 401){
	// 	throw new errors.NotAuthenticated('Invalid token');
	// }else{
	
	// hook.params.query.subscriptionId = apiHeaders.subscr/iptionid
    
    // hook.params.query.isDeleated = false;
    // if(hook.params.query.isActive == "true")
    // {
    //   hook.params.query.isActive = true;
    //  // hook.params.query.id =
    // }
    // if(hook.params.query.configId){
    //   hook.params.query.id ={$in : hook.params.query.configId}
    // }

    console.log("PO before find query",hook.params.query);
//   }
}

async function  beforecreate (hook) {
	let res = await validateUser(hook);

	// console.log(response)
	if(res.code == 401){
		throw new errors.NotAuthenticated('Invalid token');
	}else{
		//hook.result = "created"
		hook.data.createdAt = new Date();

	}
}

async function validateUser(data) {

	console.log("config1.default.userDetailURL",config1.default.userDetailURL)

	var options = {
		uri: config1.default.userDetailURL,
		headers: {
			Authorization : apiHeaders.authorization
		}
	};
	return new Promise((resolve , reject) =>{

		axios.get(config1.default.userDetailURL, {
			strictSSL: false,
			headers: {
				"Authorization" : apiHeaders.authorization
			}
		})
		.then(function (response) {
			resolve(response)
		})
		.catch(function (error) {
			console.log("%%%%%%%%%%%%",error)
			resolve({"code" : 401 })
		});
	})
}