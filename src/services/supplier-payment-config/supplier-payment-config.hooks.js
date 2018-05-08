
var rp = require('request-promise');
let errors = require('@feathersjs/errors') ;
let axios = require("axios");

let _ = require('lodash');
let r = require('rethinkdb');
const config = require("config");
let config1 = require('../../customConfig.js');
let domainKey = process.env.domainKey;
let baseUrl = "http://api."+domainKey;


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

  beforePatch = async hook =>{
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
              console.log("data.online_payment[gateway][rowIndex] if",data.online_payment[gateway])
              data.online_payment[gateway][hook.data.rowIndex] = hook.data.online_payment[gateway]
              console.log("-------------------",data.online_payment[gateway])
              delete hook.data.rowIndex;
              
              if(hook.data.rowIndex){
                hook.data.online_payment[gateway] = [hook.data.online_payment[gateway]]
              }else{
                hook.data.online_payment[gateway]= data.online_payment[gateway]
              }
               //;
              
              console.log("hook.data.online_payment[gateway] if",hook.data.online_payment[gateway])
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
      
              console.log("data.online_payment.gateway else",data.online_payment[gateway])
              console.log("hook.data.online_payment[gateway] else" , hook.data.online_payment[gateway])
              data.online_payment[gateway].forEach(function(alldata) {
                // console.log("alldata",alldata);
                alldata.isDefault = false;
              })
              // console.log("-------------------",data.online_payment[gateway])
              // console.log("hook.data.online_payment[gateway]",hook.data.online_payment[gateway])
              //data.online_payment[gateway].push(hook.data.online_payment[gateway]);
              hook.data.online_payment[gateway] = hook.data.online_payment[gateway]
              // console.log("======================",hook.data.online_payment);
            }
            else {
              // console.log("hookarr[0]",hookarr[0])
              console.log("++++++++++++++++",hook.data.online_payment[hookarr[0]]);
              if(hook.data.rowIndex){
                
                hook.data.online_payment[hookarr[0]] = [ hook.data.online_payment[hookarr[0] ]]	
              }else{
                hook.data.online_payment[gateway]= data.online_payment[gateway]
              }
             	
              console.log("--------------",hook.data.online_payment[hookarr[0]])				
            }
          // }
        }
      }
      else {
        hook.data.online_payment[hookarr[0]] = [ hook.data.online_payment[hookarr[0]] ]		
      }
    }
    // if(res.code == 401){
    //   throw new errors.NotAuthenticated('Invalid token');
    // }else{
    //   hook.data.updatedAt = new Date();
    //   hook.data.updatedBy = res.data.data.email
    // }
  }


async function afterCreate(hook){
  console.log(")))))))))))))))))))))) ",hook.result)  
  if(hook.result.responseData != undefined){
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
        url: baseUrl + "/supplier-payment-config/" + hook.result.responseData[0].id,
        data: hook.result.responseData[0]
      })  
      .then(function (response) {
        //console.log(response)
      }).catch(function (error) {
        //console.log(error)
      })
  }
  
 
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

function getData (data) {
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
              .filter({id : data.id }).run(connection , function(error , cursor){
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


