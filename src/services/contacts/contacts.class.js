/* eslint-disable no-unused-vars */

const xero = require('xero-node');
// const config = require("../config");
const Ajv = require('ajv');
const ajv = new Ajv();
// const fs = require("fs");
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;
const axios = require('axios');
let baseUrl = process.env.baseUrl;

//for validating schema before find and get
// let schema1 = require("./methods/schema.js")
// let Xero1 = require("./methods/class.js")
// let obj1 = new Xero1();

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

        let response1 =[];
        let configdata = [];

        configdata.push(await this.getConfig(params.query));
        // console.log("response----------->",configdata);
        // for (let [index, config] of configdata.entries()) {
            let schema = require("./methods/"+configdata[0].domain+"/schema.js")
            let class1 = require("./methods/"+configdata[0].domain+"/class.js")
            let obj = new class1();

            let schemaName = schema.find ;
            this.validateSchema(params.query, schemaName)

            let response = await obj.getAllContacts(configdata[0] , params.query);
            response1.push({
                "configName": configdata[0].configName,
                "configId": configdata[0].id,
                "data": response
            })
        // }
        return (response1)
    }

    get (id, params) {
        return Promise.resolve({
            id, text: `A new message with ID: ${id}!`
        });
    }

    async create (data, params) {

        let schemaName1 = schema1.findGetCreate ;
        this.validateSchema(data, schemaName1)
        
        let configdata = [];
        configdata.push(await this.getConfig(data));
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>> " , configdata)
        
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

    async getConfig(data) {
        var resp;
        await app.service("settings").get(data.settingId)
            .then(response => {
                resp = response;
                // console.log('users:', response);
            }).catch(err => {
                console.log("error in getconfig contact",err)
                throw new errors.NotFound(err)
            });

        return resp;
    }


}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;