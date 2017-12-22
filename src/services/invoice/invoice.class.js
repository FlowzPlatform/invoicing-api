/* eslint-disable no-unused-vars */

const xero = require('xero-node');
const config = require("../config.js");
const Ajv = require('ajv');
const ajv = new Ajv();
const fs = require("fs");
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;
var rp = require('request-promise');
const axios = require('axios');

var moment = require("moment");
var resp;

//For quickbook
var TokenProvider = require('refresh-token');
var request = require('request')

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    let res = await validateUser();
    if(res.code == 401){
      throw new errors.NotAuthenticated('Invalid token');
    }
    else {
      let configdata = await this.getConfig(params);
      // console.log("response----------->",configdata);
      let response =  await this.getInvoice(configdata.data,params);
      return(response);
    }
  }

  async get (id, params) {
    console.log("id",id)
    // if (config.privateKeyPath && !config.privateKey)
    // config.privateKey = fs.readFileSync(config.privateKeyPath);
    // const xeroClient = new xero.PrivateApplication(config);
    let configdata = await this.getConfig(params);
    let response;
    let response1 = [];
    for (let [index, config] of configdata.data.entries()) {
       console.log("config.domain",config.domain);
       let schema = require("./methods/"+config.domain+"/schema.js")
       let class1 = require("./methods/"+config.domain+"/class.js")
       let obj = new class1();
       response = await obj.getInvoiceById(config, id);
      //  console.log("response by id",response);
      response1.push(response);
      //  if (response)
     }


    return(response1);
  }

  async create (data, params) {
    console.log("Domain name",data.domain);
    let schema = require("./methods/"+data.domain+"/schema.js")
    let class1 = require("./methods/"+data.domain+"/class.js")
    let obj = new class1();

    let schemaName = schema.create ;
    this.validateSchema(data, schemaName)

    let response = await obj.createInvoice(data);

    return(response);
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

  //to validate schema
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

  //to get config from settings
  async getConfig(params) {
    await axios.get("http://localhost:3037/settings", {
      params: {
        settingId : params.settingId
      },
      headers: {
        Authorization : apiHeaders.authorization
      }
    })
    .then(function (response) {
      resp = response;
      // console.log();
    })
    .catch(function (error) {
      console.log("error",error);
    });

    return resp.data;
    // var options = {
    //   uri: 'http://172.16.160.229:3037/settings'+'?isActive=true',
    //   headers: {
    //     Authorization : apiHeaders.authorization
    //   }
    // };
    // return new Promise((resolve , reject) =>{
    //   rp(options)
    //   .then(function (parsedBody) {
    //       resolve(parsedBody)
    //   })
    //   .catch(function (err) {
    //     resolve({"code" : 401 })
    //   });
    // })
  }

  async getInvoice(configdata,params) {
    let response;
    let response1 = [];
    // return new Promise(function(resolve, reject) {
      // configdata.forEach(async function(config) {
      for (let [index, config] of configdata.entries()) {
         console.log("config.domain",config.domain);
         let schema = require("./methods/"+config.domain+"/schema.js")
         let class1 = require("./methods/"+config.domain+"/class.js")
         let obj = new class1();

         let schemaName = schema.find ;
         this.validateSchema(params.query, schemaName)

         if (params.query.Invoiceid) {
           response =  obj.getInvoiceById(config,params.query.Invoiceid);
         }
         else if (params.query.chart == 'bar' || params.query.chart == 'line') {
           response = obj.invoiceStatistics(config,params.query);
         }
         else if (params.query.chart == 'pie') {
           response = obj.invoiceStatisticsPieData(config,params.query);
         }
         else if (params.query.chart == 'cashflow') {
           response = obj.invoiceStatisticsCashflow(config,params.query);
         }
         else if (params.query.stats) {
           response = obj.invoiceStats(config,params.query);
         }
         else {
           // response = obj.getAllInvoice(params.query);
           response = await obj.getInvoicesByFilter(config,params.query);
         }
        response1.push(
          {"configName": config.configName,
          "configId": config.id,
        "data":response}
      );
      }
      // console.log("response1",response1);
      return(response1);
    // })
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
