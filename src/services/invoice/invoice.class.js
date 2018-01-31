/* eslint-disable no-unused-vars */

// const xero = require('xero-node');
// const config = require("../config.js");
const Ajv = require('ajv');
const ajv = new Ajv();
// const fs = require("fs");
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;
var rp = require('request-promise');
const axios = require('axios');

let baseUrl = process.env.baseUrl;
let _ = require('lodash');

var moment = require("moment");

let schema1 = {
    findGetCreate : {
        "properties" : {
            "settingId" : {
                "description" : "Id of configuration"
            }
        },
        "required" : ["settingId"],
        "additionalProperties": true
    }
};

//For quickbook
// var TokenProvider = require('refresh-token');
// var request = require('request')

class Service {
    constructor (options) {
        this.options = options || {};
    }

    setup(app){
        this.app = app;
    }

    async find (params) {

        let schemaName1 = schema1.findGetCreate ;
        this.validateSchema(params.query, schemaName1)

        let configdata = [];
        configdata.push(await this.getConfig(params.query));
        // console.log("setting response inside invoice find----------->",configdata);

        let response =  await this.getInvoice(configdata,params);
        return(response);
    }

    async get (id, params) {
        // console.log("invoice id inside get",id)
        let schemaName1 = schema1.findGetCreate ;
        this.validateSchema(params.query, schemaName1)

        let response;
        let response1 =[];
        let configdata = [];
        configdata.push(await this.getConfig(params.query));

        console.log("config.domain",configdata[0].domain);
        let schema = require("./methods/"+configdata[0].domain+"/schema.js")
        let class1 = require("./methods/"+configdata[0].domain+"/class.js")
        let obj = new class1();

        let schemaName = schema.get ;
        this.validateSchema(params.query, schemaName)

        response = await obj.getInvoiceById(configdata[0], id);
        //  console.log("response by id",response);
        response1.push({
            "configName": configdata[0].configName,
            "configId": configdata[0].id,
            "data": response
        })
        return(response1);
    }

    async create (data, params) {
        // console.log("data@@@@@@@@@@",data);
        // console.log("params@@@@@@@@@",params);
        let schemaName1 = schema1.findGetCreate ;
        this.validateSchema(data, schemaName1)

        let configdata = [];
        configdata.push(await this.getConfig(data));
    
        let schema = require("./methods/"+configdata[0].domain+"/schema.js")
        let class1 = require("./methods/"+configdata[0].domain+"/class.js")
        let obj = new class1();

        let schemaName = schema.create ;
        this.validateSchema(data, schemaName)

        let contactResponse = await this.getContact(configdata[0],data);
        // console.log("contact response",contactResponse);

        let invoiceResponse = await obj.createInvoice(configdata[0],data,contactResponse);
        // console.log("create Invoice ", response)

        let userTrack = await this.userTrackRecord(configdata[0],contactResponse,invoiceResponse);
        return(invoiceResponse);
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

    //to get config from settings
    async getConfig(data) {
        var resp;

        await app.service("settings").get(data.settingId)
            .then(response => {
                resp = response;
                // console.log('settings:', response);
            }).catch(err => {
                console.log(">>>>>>>>> " , err)
                throw new errors.NotFound(err)
            });
            
        return resp;
    }

    async getContact(configdata, data) {
        let resp;

        console.log("Inside invoice data",data);

        await app.service("contacts").find({query:data}).then(function(result){
            // console.log("parsedBody contact find---------------->",result[0])
            resp = result[0];
        }).catch(function(err){
            console.log(">>>>>>>>>>>>>>> " , err)
            throw new errors.NotFound(err)
        })

        // console.log("############contact resp",resp);
        // console.log("############contact resp",resp.length);

        if (resp.data.length == 0) {

            await app.service("contacts").create(data).then(function(response){
                // console.log("parsedBody contact post---------------->",response.data)
                resp = response;
            }).catch(function(err){
                console.log(">>>>>>>>>>>>>>> err in post contact" , err)
                throw new errors.NotAcceptable(err)
            })
        }

        return resp;
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

            let schemaName = schema.findChart ;
            this.validateSchema(params.query, schemaName)
        }
        else {
            console.log("configdata[0].domain",configdata[0].domain);
            let schema = require("./methods/"+configdata[0].domain+"/schema.js")
            let class1 = require("./methods/"+configdata[0].domain+"/class.js")
            obj = new class1();

            let schemaName = schema.find ;
            this.validateSchema(params.query, schemaName)
        }
        if (params.query.chart == 'bar' || params.query.chart == 'line') {
            response = await obj.invoiceStatistics(configdata[0],params.query);
            response1.push({
                "configName": configdata[0].configName,
                "configId": configdata[0].id,
                "data":response
            });
        }
        else if (params.query.chart == 'pie') {
            response = await obj.invoiceStatisticsPieData(configdata[0],params.query);
            // console.log("pie data",response);
            response1.push({
                "configName": configdata[0].configName,
                "configId": configdata[0].id,
                "data":response
            });
        }
        else if (params.query.chart == 'cashflow') {
            response = await obj.invoiceStatisticsCashflow(configdata[0],params.query);
            response1.push({
                "configName": configdata[0].configName,
                "configId": configdata[0].id,
                "data":response
            });
        }
        else if (params.query.stats) {
            response = await obj.invoiceStats(configdata[0],params.query);
            response1.push({
                "configName": configdata[0].configName,
                "configId": configdata[0].id,
                "data":response
            });
        }
        else {
            if (params.query.InvoiceID) {
                response = await obj.getInvoiceById(configdata[0],params.query.InvoiceID);
            }
            else {
                // response = obj.getAllInvoice(params.query);
                response = await obj.getInvoicesByFilter(configdata[0],params.query);
            }
            response1.push({
                "configName": configdata[0].configName,
                "configId": configdata[0].id,
                "data":response
            });
        }
        return(response1);
    }

    async userTrackRecord(config,contactResponse,invoiceResponse) {
        console.log("configId",config.id);
        // console.log("contactResponse",contactResponse.data[0])
        // console.log("contactresponse name & email",contactResponse.data[0].Name,contactResponse.data[0].EmailAddress)
        // console.log("Invoice Id",invoiceResponse.InvoiceID);
        
        let invoiceId = invoiceResponse.InvoiceID || invoiceResponse.Id;
        let customerName = contactResponse.data[0].Name
        let customerEmail = contactResponse.data[0].EmailAddress
        let queryBuild = { 'customerName' : customerName }
        console.log("================queryBuild",queryBuild);
        app.service('trackusersettings').find({query:queryBuild})
        .then(function(response) {
            console.log("-------------",response)
            if (response.total == 0) {
                let userObj = {
                    customerName : customerName,
                    customerEmail : customerEmail,
                    settingId : [],
                    invoiceId : []
                };
                userObj.settingId.push(config.id);
                userObj.invoiceId.push(invoiceId);
                app.service('trackusersettings').create(userObj)
                .then(function(resp) {
                    console.log("object create response",resp)
                })
                .catch(function(err) {

                })
            }
            else {
                let idArray = response.data[0].settingId;
                let flag = _.findIndex(idArray, function(o) { return o == config; });
                console.log("****************flag value",flag)
                if (flag >= 0) {
                    let invoiceIdArray = response.data[0].invoiceId
                    invoiceIdArray.push(invoiceId)
                    app.service('trackusersettings').patch(response.data[0].id ,{'invoiceId' : invoiceIdArray})
                    .then(function(result) {
                        console.log("++++++++++++++++++++++++settingId patch result insie if",result);
                    })
                    .catch(function(err) {

                    })
                }
                else {
                    let settingIdArray = response.data[0].settingId
                    settingIdArray.push(config.id);
                    let invoiceIdArray = response.data[0].invoiceId
                    invoiceIdArray.push(invoiceId)
                    app.service('trackusersettings').patch(response.data[0].id ,{'settingId' : settingIdArray, 'invoiceId' : invoiceIdArray})
                    .then(function(result) {
                        console.log("++++++++++++++++++++++++settingId patch result inside else",result);
                    })
                    .catch(function(err) {

                    })
                }
            }
        })
        .catch(function(err) {
            console.log("!!!!!!!!!!!!!!!!!!!!!",err)
        })
    }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
