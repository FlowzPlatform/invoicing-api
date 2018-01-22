/* eslint-disable no-unused-vars */

const xero = require('xero-node');
const config = require("../config");
const Ajv = require('ajv');
const ajv = new Ajv();
const fs = require("fs");
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;
let schema = require("./methods/schema.js")
let Xero1 = require("./methods/class.js")
let obj = new Xero1();
const axios = require('axios');
let baseUrl = process.env.baseUrl;


 if (config.credentials.privateKeyPath && !config.credentials.privateKey) 
 config.credentials.privateKey = fs.readFileSync(config.credentials.privateKeyPath);
 
const xeroClient = new xero.PrivateApplication(config.credentials);

class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup(app){
    this.app = app;
  }

  async find (params) {
    // let res = await validateUser();
    // if(res.code == 401){
    //   throw new errors.NotAuthenticated('Invalid token');
    // }
    // else 
    // {
      
    let response1 =[];
    let configdata = [];
    configdata.push(await this.getConfig(params.query));
    console.log("response----------->",configdata);
    for (let [index, config] of configdata.entries()) {
      let schema = require("./methods/"+config.domain+"/schema.js")
      let class1 = require("./methods/"+config.domain+"/class.js")
      let obj = new class1();

      let schemaName = schema.find ;
      //this.validateSchema(params.query, schemaName)
      let response = await obj.getAllContacts(config , params.query);
      response1.push({
        "configName": config.configName,
        "configId": config.id,
        "data":response
      })
    }
    return (response1)
    // }
  }

  get (id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  async create (data, params) {
    // let res = await validateUser();
    // let response1 =[];
    // if(res.code == 401){
    //   throw new errors.NotAuthenticated('Invalid token');
    // }
    // else 
    // {
      // console.log("@@@@@@@@@@@@@@@@@@@@",data)
      let configdata = [];
      configdata.push(await this.getConfig(data));
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>> " , configdata)
      
      let schema = require("./methods/"+configdata[0].domain+"/schema.js")
      let class1 = require("./methods/"+configdata[0].domain+"/class.js")
      let obj = new class1();
  
      let schemaName = schema.create ;
      this.validateSchema(data, schemaName)
  
      let response = await obj.createContact(configdata[0],data);
      console.log("@@@@@@@@@@@@@@@ " , response)
      return({
        "configName": configdata[0].configName,
        "configId": configdata[0].id,
        "data":response
      });
    // }
    
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

  validateSchema(data, schemaName) {
    
      let validateSc = ajv.compile(schemaName);
      let valid = validateSc(data);

      if (!valid) {
          throw new errors.NotAcceptable('user input not valid', validateSc.errors);
      }
  }

  validateUser (){
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

  async getConfig(data) {
    var resp;

    await this.app.service("settings").get(data.settingId)
      .then(response => {
        resp = response;
       // console.log('users:', response);
      }).catch(err => {
          console.log(err)
      });
    
    // await axios.get(baseUrl+"settings?isActive=true", {
    //   params: {
    //     id : data.settingId,
    //     user : data.user
    //   }
    //   // headers: {
    //   //   Authorization : apiHeaders.authorization
    //   // }
    // })
    // .then(function (response) {
    //   resp = response;

    // })
    // .catch(function (error) {
    //   console.log("error",error);
    // });

    return resp;
  }

}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;