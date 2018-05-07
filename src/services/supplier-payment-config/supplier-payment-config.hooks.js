
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
    find: [],
    get: [],
    create: [
      hook => beforeCreate (hook)
    ],
    update: [],
    patch: [
      hook => beforePatch (hook)
    ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => afterCreate (hook)
    ],
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

async function beforeCreate (hook) {
  let response = await alreadyAvailable(hook)
  if(response.length > 0) {
    hook.result = hook.data;
    hook.result.responseData = response
     
  }
}

async function beforePatch (hook) {
  let result = await getData(hook)
  let FinalData = await updateData (result, hook.data)  
}

async function afterCreate(hook){
 // console.log(hook.result)  
  let responseDataKey = Object.keys(hook.result.responseData[0].online_payment)
  let responseDataKeyFromUser = Object.keys(hook.result.online_payment)

  console.log("responseDataKey ",responseDataKey);
  console.log("responseDataKeyFromUser ", responseDataKeyFromUser)  
     let isInArray = responseDataKey.includes(responseDataKeyFromUser[0])
    console.log("?????????? " , isInArray)
   // console.log("?????????? " , hook.result.responseData[0].id)
    
      if(isInArray){
        console.log("hook.resultresultresult >>>",hook.result.responseData[0].online_payment[responseDataKeyFromUser]);  
            let result  = await checkAccountName (hook.result.responseData[0].online_payment[responseDataKeyFromUser], hook.result.online_payment[responseDataKeyFromUser][0], responseDataKeyFromUser[0])
            console.log("*********************************", result)
         hook.result.responseData[0].online_payment[responseDataKeyFromUser].push(hook.result.online_payment[responseDataKeyFromUser][0])
      }else{
        console.log("")
        hook.result.responseData[0].online_payment[responseDataKeyFromUser] = [hook.result.online_payment[responseDataKeyFromUser][0]]
        console.log(">>>>>>>>>>>>>> " , hook.result.responseData[0])
      }
      
      axios({
        method: 'PATCH',
        url: "http://localhost:3037/supplier-payment-config/"+hook.result.responseData[0].id,
        data: hook.result.responseData[0]
      })  
      .then(function (response) {
        //console.log(response)
      }).catch(function (error) {
        //console.log(error)
      })
 
}


function alreadyAvailable(hook) {
  return new Promise((resolve , reject) =>{
   
    r.connect({
      host: config.get('rdb_host'),
      port: config.get("rdb_port"),
      db: 'invoicing_api'
    }, function(err, conn) {
        if (err) {
          console.log("err", err)
          reject (err);
        }else{
          connection = conn;
          r.table('supplierPaymentConfig')
              .filter({supplier_id : hook.data.supplier_id }).run(connection , function(error , cursor){
                if (error){
                  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>> " , error)
                  reject(error);
                }else{
                  cursor.toArray(function(err, results) {
                    if (err) throw err;

                  console.log("<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>> "  , results)
                    resolve(results)
                  });
                }
          
              })
        };
      
    })
  })
} 

function getData (hook) {
  return new Promise((resolve , reject) =>{
   
    r.connect({
      host: config.get('rdb_host'),
      port: config.get("rdb_port"),
      db: 'invoicing_api'
    }, function(err, conn) {
        if (err) {
          console.log("err", err)
          reject (err);
        }else{
          connection = conn;
          r.table('supplierPaymentConfig')
              .filter({id : hook.data.id }).run(connection , function(error , cursor){
                if (error){
                  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>> " , error)
                  reject(error);
                }else{
                  cursor.toArray(function(err, results) {
                    if (err) throw err;

                  console.log("<<<<<<<<<< getdata "  , results)
                    resolve(results[0])
                  });
                }
          
              })
        };
      
    })
  })
}

function alreadyAvailableGateway (hook) {
  return new Promise((resolve , reject) =>{
   
    r.connect({
      host: config.get('rdb_host'),
      port: config.get("rdb_port"),
      db: 'invoicing_api'
    }, function(err, conn) {
       if (err) {
         console.log("err", err)
         reject (err);
       }else{
         connection = conn;
         r.table('supplierPaymentConfig')
        .filter({supplier_id : hook.data.online_payment }).run(connection , function(error , cursor){
         if (error){
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>> " , error)
            reject(error);
         }else{
             cursor.toArray(function(err, results) {
                if (err) throw err;

                 // console.log("<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>> "  , results)
            resolve(results.length)
        });
         }
        
    })
       };
      
    })
  }) 
}

function updateData (oldData, newData) {
  let oldDatakey = Object.keys(oldData.online_payment)
  console.log("--------oldData----------", oldData,   '*********',  oldDatakey)
  let newDatakey = Object.keys(newData.online_payment)
  console.log("--------newData----------", newData , '////////**********', newDatakey)  
  let isInArray = oldDatakey.includes(newDatakey)
  // if (isArray) {

  // } else {

  // }
}

function checkAccountName (responseData, data, gateway) {
  console.log("responseDataresponseDataresponseData", responseData, gateway)
  console.log(",,,,,,,,,,,,,", data.Account_Name)
  let resultArr = [];
  responseData.forEach(element => {
      console.log("Element Account_Name", element.Account_Name)
      if(element.Account_Name === data.Account_Name){
          resultArr.push(element)
      }
  });
  console.log("@@@@@@@@@@@", resultArr)
  if(resultArr.length > 0){
    console.log("Inside If")

    throw new errors.GeneralError('This Account Name already exits in ' + gateway + '. Please try another one. ')
  }else {
    console.log("#####################", responseData)
    responseData.forEach(element => {
        console.log("Element Account_Name", element.isDefault)
        element.isDefault = false
    });
    console.log("#########$$$$$$$$$$$$$$$$$$", responseData)    
    return responseData
  }
}


