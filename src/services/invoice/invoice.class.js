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

let baseUrl = process.env.baseUrl;

var moment = require("moment");

//For quickbook
var TokenProvider = require('refresh-token');
var request = require('request')

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
      
      let configdata = await this.getConfig(params.query);
       console.log("response----------->",configdata);
      let response =  await this.getInvoice(configdata.data,params);
      return(response);
    // }
  }

  async get (id, params) {
    console.log("id",id)
    let configdata = await this.getConfig(params.query);
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
     }
    return(response1);
  }

  async create (data, params) {

    let configdata = await this.getConfig(data);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>> " , configdata)
    console.log("Domain name",configdata.data[0].domain);
    let schema = require("./methods/"+configdata.data[0].domain+"/schema.js")
    let class1 = require("./methods/"+configdata.data[0].domain+"/class.js")
    let obj = new class1();

    let schemaName = schema.create ;
    this.validateSchema(data, schemaName)

    let response = await obj.createInvoice(configdata.data[0],data);

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

  // validateUser (){
  //     var options = {
  //       uri: process.env.userDetailApi,
  //       headers: {
  //         Authorization : apiHeaders.authorization
  //       }
  //   };
  //   return new Promise((resolve , reject) =>{
  //     rp(options)
  //     .then(function (parsedBody) {
  //         resolve(parsedBody)
  //     })
  //     .catch(function (err) {
  //       resolve({"code" : 401 })
  //     });
  //   })
  // }

  //to get config from settings
  async getConfig(data) {
    var resp;
    
    await axios.get(baseUrl+"settings?isActive=true", {
      params: {
        id : data.settingId,
        user : data.user
      }
      // headers: {
      //   Authorization : apiHeaders.authorization
      // }
    })
    .then(function (response) {
      resp = response;

    })
    .catch(function (error) {
      console.log("error",error);
    });

    return resp.data;
  }

  async getInvoice(configdata,params) {
    let response;
    let response1 = [];
    let obj;
    if (params.query.chart || params.query.stats) {
      console.log("configdata[0].domain",configdata[0].domain);
      let schema = require("./methods/"+configdata[0].domain+"/schema.js")
      let class1 = require("./methods/"+configdata[0].domain+"/class.js")
      obj = new class1();

      let schemaName = schema.find ;
      this.validateSchema(params.query, schemaName)
    }
    if (params.query.chart == 'bar' || params.query.chart == 'line') {
      response = await obj.invoiceStatistics(configdata[0],params.query);
      response1.push(
        {"configName": configdata[0].configName,
        "configId": configdata[0].id,
        "data":response}
      );
    }
    else if (params.query.chart == 'pie') {
      response = await obj.invoiceStatisticsPieData(configdata[0],params.query);
      // console.log("pie data",response);
      response1.push(
        {"configName": configdata[0].configName,
        "configId": configdata[0].id,
        "data":response}
      );
    }
    else if (params.query.chart == 'cashflow') {
      response = await obj.invoiceStatisticsCashflow(configdata[0],params.query);
      response1.push(
        {"configName": configdata[0].configName,
        "configId": configdata[0].id,
        "data":response}
      );
    }
    else if (params.query.stats) {
      response = await obj.invoiceStats(configdata[0],params.query);
      response1.push(
        {"configName": configdata[0].configName,
        "configId": configdata[0].id,
        "data":response}
      );
    }
    else {
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
          response = await obj.invoiceStatistics(config,params.query);
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
    }
    // var final_resp;
    // var chart_arr = [];
    // var chart_data = [
    //   {
    //     name : "Paid Amount",
    //     data : [ ]
    //   },
    //   {
    //     name : "Unpaid Amount",
    //     data : [ ]
    //   },
    //   {
    //     name : "Draft Amount",
    //     data : [ ]
    //   }
    // ];
    // if (params.query.chart || params.query.stats) {
      // console.log("response1.length",response1.length);
      // console.log("response1[0].data.length",response1[0].data.length);
      // console.log("response1[0].data[0].data.length",response1[0].data[0].data.length);
      // var y;
      // var label;

    // for (let [index, response] of response1.entries()) {
    //   console.log("response",response.data[0].data);
    //   y = 0;
    //   label = '';
    //   console.log("label1",label);
    //   for (let [ind, resp] of response.data[0].data.entries()) {
    //     y += resp.y;
    //     label = resp.label;
    //     chart_data[0].data.push({"label" : label, "y" : y})
    //   }
    //   console.log("label1",label);
    //
    //   y = 0;
    //   label = '';
    //   console.log("label2",label);
    //   for (let [ind, resp] of response.data[1].data.entries()) {
    //     y += resp.y;
    //     label = resp.label;
    //     chart_data[1].data.push({"label" : label, "y" : y})
    //   }
    //   console.log("label2",label);
    //
    //   y = 0;
    //   label = '';
    //   console.log("label3",label);
    //   for (let [ind, resp] of response.data[2].data.entries()) {
    //     y += resp.y;
    //     label = resp.label;
    //     chart_data[2].data.push({"label" : label, "y" : y})
    //   }
    //   console.log("label3",label);
    // }

    // response1.forEach(function(response) {
        //   response.data.forEach(function(resp) {
        //     if (resp.name == 'Paid Amount') {
        //
        //     }
        //     else {
        //       chart_arr.push(resp.name);
        //     }
        //     console.log("$$$$$$$$$$$",chart_arr);
        //   })
        // })
      // }
      // else {
      //    final_resp = response1;
      // }
    return(response1);
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
