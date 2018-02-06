/* eslint-disable no-unused-vars */
let axios = require("axios");
const Ajv = require('ajv');
const ajv = new Ajv();
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

let domainKey = process.env.domainKey;
let baseUrl = "http://api."+domainKey;

let schemaName = {
  "properties": {
      "email": {
          "type": "string"
          
      },
      "subscriptionId": {
          "description": "subscriptionId"
      },
      "role": {
          "type" : 'object',
          "description": "role"
      }
  },
  "required": ["email" ,  "subscriptionId" , "role"],
   "additionalProperties": true
}

class Service {
  constructor (options) {
    this.options = options || {};
  }

  find (params) {
    return Promise.resolve([]);
  }

  get (id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  create (data, params) {
    
    let previous_packages ;
    let userId;
    let module = data.module;
    let subscriptionId = data.subscriptionId;
    let Role1 = data.role;
    this.validateSchema(data, schemaName)
    let self = this;
    return new Promise(function(resolve , reject ){
      axios.post(baseUrl+'/auth/api/userdetailsbyemail', {
          "email": data.email
      })
      .then(async (res) => {
          userId = res.data.data[0]._id;
          previous_packages = res.data.data[0].package
          if(previous_packages == undefined || previous_packages.length == 0){
            previous_packages = {
               [subscriptionId] : {
                    "subscriptionId": subscriptionId,
                    "role": Role1
              
            }
          }
          }else{
            previous_packages[subscriptionId] = {
                "subscriptionId": subscriptionId,
                "role": Role1
            }
            
          }
          axios.put(baseUrl+'/user/updateuserdetails/' + userId, {
                      package: previous_packages
                }, {
                    headers: {
                        'Authorization': apiHeaders.authorization
                    }
                })
                .then(async (result) => {
                  self.sendEmail(data , res);
                  resolve(result.data)
                }).catch(function (err){
                  let errorObj = {};
                  if(apiHeaders.authorization == undefined){
                    errorObj.statusText = "missing Authorization header";
                    errorObj.status = 404;
                    errorObj.data = "'Auth token is required in header'";
                    resolve (errorObj)
                  }else{
                    
                    errorObj.statusText = err.response.statusText;
                    errorObj.status = err.response.status;
                    errorObj.data = err.response.data;
  
                    resolve (errorObj)
                  }
                  
                })
          
          
          // userId = res.data.data[0]._id;
          // previous_packages = res.data.data[0].package
      }).catch(function(err){
        let errorObj = {};
        errorObj.statusText = "Not Found";
        errorObj.status = 404;
        errorObj.data = "No data found with this email ID";
        resolve(errorObj)
      })
    })

    
  }

  sendEmail(data , res){
    axios({
        method: 'post',
        url: baseUrl+'/auth/api/userdetails',
        headers: {'Authorization': apiHeaders.authorization}
    })
    .then(async (result) => {
      console.log("receiveEmail Data " , res.data.data[0].email)
      console.log("sendEmail Data " , result.data.data.email)
      axios({
          method: 'post',
          url: baseUrl+'/vmailmicro/sendEmail',
          headers: {'Authorization': apiHeaders.authorization},
          data : {"to":result.data.data.email,"from":res.data.data[0].email,"subject":"Invitation from Flowz","body":"Dear "+ res.data.data[0].username+", You have been invited by "+ result.data.data.email +"to Flowz"}
      }).then(async (result) => {
        return true;
      }).catch(function(err){
        console.log("err.response")
        console.log(err.response)
      })
      
    }).catch(function(err){
     
      console.log(err.response)
    })

    
  }

  validateSchema(data, schemaName) {
    
      let validateSc = ajv.compile(schemaName);
      let valid = validateSc(data);

      if (!valid) {
          throw new errors.NotAcceptable('user input not valid', validateSc.errors);
      }
  }

  update (id, data, params) {
    return Promise.resolve(data);
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
