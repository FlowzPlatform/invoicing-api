const Ajv = require('ajv');
const ajv = new Ajv();

const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

var rp = require('request-promise');
const axios = require('axios');

//For quickbook
var TokenProvider = require('refresh-token');
var request = require('request')

/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    // let res = await validateUser();
    // if(res.code == 401){
    //   throw new errors.NotAuthenticated('Invalid token');
    // }
    // else {
    let response;
    let response1  = [];
      let configdata = await this.getConfig(params.query);
      console.log("response config----------->",configdata);

      for (let [index, config] of configdata.data.entries()) {
        console.log("Domain name",config.domain);
        let schema = require("./methods/"+config.domain+"/schema.js")
        let class1 = require("./methods/"+config.domain+"/class.js")
        let obj = new class1();

        let schemaName = schema.find ;
        this.validateSchema(params.query, schemaName)

        response = await obj.getPayment(config,params);
        response1.push({"configName": config.configName,
          "configId": config.id,
          "data":response});
      }
    // }
    return response1;
  }

  get (id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  async create (data, params) {
    // let res = await validateUser();
    // if(res.code == 401){
    //   throw new errors.NotAuthenticated('Invalid token');
    // }
    // else {
    let response;
      let configdata = await this.getConfig(data);
      console.log("#######configdata inside create",configdata)

      console.log("Domain name",configdata.data[0].domain);
      let schema = require("./methods/"+configdata.data[0].domain+"/schema.js")
      let class1 = require("./methods/"+configdata.data[0].domain+"/class.js")
      let obj = new class1();

      let schemaName = schema.createPayment ;
      this.validateSchema(data, schemaName)

      response = await obj.createPayment(configdata.data[0],data);
    // }
    console.log("response in payment",response);
    return response;
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

  //to validate schema
  validateSchema(data, schemaName) {

      let validateSc = ajv.compile(schemaName);
      let valid = validateSc(data);

      if (!valid) {
          throw new errors.NotAcceptable('user input not valid', validateSc.errors);
      }
  }
  
  //to get config from settings
  async getConfig(data) {

    var resp;
    await axios.get(process.env.baseUrl+"settings?isActive=true", {
      params: {
        id : data.settingId,
        user : data.user
      }
    })
    .then(function (response) {
      resp = response;
    })
    .catch(function (error) {
      console.log("error",error);
    });
    return resp.data;
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
