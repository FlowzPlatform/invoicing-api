var rp = require('request-promise');
let errors = require('@feathersjs/errors') ;
let axios = require("axios");

let _ = require('lodash');
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
  //console.log(hook)
  console.log(hook.params)
  console.log("someone called me get")
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
  console.log("---------------",hook.params.query)
  let res = await validateUser(hook);
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
   //  let getMultipleDataRes = await getMultipleData(hook);
    // console.log(">>>>>>>>>>>>>>>> "  , res)
    
    console.log("apiHeaders " , apiHeaders)
    
    //hook.params.query.userId = res.data.data._id;
   hook.params.query.subscriptionId = apiHeaders.subscriptionid
    
    
    
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
  console.log("hook.data",hook.data);
	if (hook.data.online_payment) {
		let data = await getData(hook.data);
		// console.log("response of get data",data);
    let hookarr = Object.keys(hook.data.online_payment);
    console.log("hookarr",hookarr)
		if (data.online_payment) {
			let gateway;
			let arr = Object.keys(data.online_payment);
			console.log("----------arr",arr);
			console.log("hook.data.rowIndex",hook.data.rowIndex)
			if (hook.data.rowIndex != null) {
				// console.log("---------------inside if")
				for (i in arr) {
					if (arr[i] == hookarr[0]) {
						// console.log("inside if");
						gateway = hookarr[0];
						console.log("gateway",gateway);
						console.log("hook.data.online_payment[gateway].isDefault",hook.data.online_payment[gateway])
						if (hook.data.online_payment[gateway].isDefault == true) {
							console.log("data.online_payment.gateway",data.online_payment[gateway])
							data.online_payment[gateway].forEach(function(alldata) {
								console.log("alldata",alldata);
								alldata.isDefault = false;
							})
						}
						console.log("data.online_payment[gateway][rowIndex]",data.online_payment[gateway])
						data.online_payment[gateway][hook.data.rowIndex] = hook.data.online_payment[gateway]
						console.log("-------------------",data.online_payment[gateway])
						//delete hook.data.rowIndex;
						// // data.online_payment[gateway].push(hook.data.online_payment[gateway][0]);
            hook.data.online_payment[gateway] = data.online_payment[gateway]
            console.log("hook.data.online_payment[gateway]",hook.data.online_payment[gateway])
					}
				}
			}
			else {
				// console.log("++++++++++inside else")
				let findIndex = _.indexOf(arr, hookarr[0]);
				// for (i in arr) {
					if (findIndex >= 0) {
						gateway = hookarr[0];
						// console.log("inside if");
		
						console.log("data.online_payment.gateway",data.online_payment[gateway])
						data.online_payment[gateway].forEach(function(alldata) {
							// console.log("alldata",alldata);
							alldata.isDefault = false;
						})
						// console.log("-------------------",data.online_payment[gateway])
						// console.log("hook.data.online_payment[gateway]",hook.data.online_payment[gateway])
						data.online_payment[gateway].push(hook.data.online_payment[gateway]);
						hook.data.online_payment[gateway] = data.online_payment[gateway]
						// console.log("======================",hook.data.online_payment);
					}
					else {
						// console.log("hookarr[0]",hookarr[0])
						console.log("++++++++++++++++",hook.data.online_payment[hookarr[0]]);
            hook.data.online_payment[hookarr[0]] = [ hook.data.online_payment[hookarr[0]] ]		
            console.log("--------------",hook.data.online_payment[hookarr[0]])				
					}
				// }
			}
		}
		else {
      hook.data.online_payment[hookarr[0]] = [ hook.data.online_payment[hookarr[0]] ]		
		}
	}
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    hook.data.updatedAt = new Date();
    hook.data.updatedBy = res.data.data.email
  }
}

// validateUser =data =>{
async function validateUser(data) {

  console.log("config1.default.userDetailURL",config1.default.userDetailURL)

    var options = {
      uri: config1.default.userDetailURL,
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
    axios.get(config1.default.userDetailURL, {
              strictSSL: false,
              headers: {
                "Authorization" : apiHeaders.authorization
              }
            })
            .then(function (response) {

              console.log("response " , response)

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

    r.table('settings')
    .filter({userId : res.data.data._id, domain:"custom"}).run(connection , function(error , cursor){
        if (error) throw error;
        cursor.toArray(function(err, results) {
          if (err) throw err;

          // console.log("<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>> "  , results)
          resolve(results.length)
      });
    })
    // app.service('settings').find({query: {userId : res.data.data._id, domain:"custom"}}).then(settings => {
    //       console.log(">>>>>>>>>>>>>>>>> " , settings)

    //       resolve(settings.data.length)
    // })
  })


} 

function getData(data) {
  return new Promise((resolve , reject) =>{
    console.log("------------data",data)
    r.table('settings')
    .filter({id : data.id}).run(connection , function(error , cursor){
        if (error) throw error;
        cursor.toArray(function(err, results) {
          if (err) throw err;
          console.log("<<<<<<<<<<getData "  , results)
          resolve(results[0])
        });
    })
    // app.service('settings').find({query: {id : data.id}}).then(settings => {
		// // console.log(">>>>>>>>>>>>>>>>> " , settings.data)
		//   resolve(settings.data[0])
    // })
  })
}
