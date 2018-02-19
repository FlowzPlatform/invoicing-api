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
const config = require("config");


var moment = require("moment");


let r = require('rethinkdb')
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
        // console.log("invoice id inside params",params)
        let schemaName1 = schema1.findGetCreate ;
        this.validateSchema(params.query, schemaName1)

        let configdata = [];
        configdata.push(await this.getConfig(params.query));
        // console.log("setting response inside invoice find----------->",configdata);

        let response =  await this.getInvoice(configdata,params);
        return(response);
    }

    async get (id, params) {
        //  console.log("invoice id inside get",id)
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

        let response = await obj.createInvoice(configdata[0],data,contactResponse);
        // console.log("create Invoice ", response)
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

    //to get config from settings
    async getConfig(data) {
        var resp;
        // console.log("LLLLLLLLLLLLLLLLLLLLLLLLL "  , data)
       

        // await axios.get('http://localhost:3037/settings/'+data.settingId , {
        //     headers: {
        //         subscriptionId : '8b539be4-f7c2-47f0-9ae8-6677a5537bc4'
        //     }
        //   })
        //   .then(function (response) {
        //     console.log(response);
        //     resp = response
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //     throw new errors.NotFound(error)
        //   });
        
        //     await app.service("settings").get(data.settingId,  {  headers: { 
        //         subscriptionid: '10ca1102-c78d-4f43-b93f-ceb59d909fb2' ,
        //         authorization : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YTU4NmE5MjQ1MGEzMTAwMTI0Y2U3Y2YiLCJpYXQiOjE1MTg0MjIxODIsImV4cCI6MTUxODUwODYxMiwiYXVkIjoiaHR0cHM6Ly95b3VyZG9tYWluLmNvbSIsImlzcyI6ImZlYXRoZXJzIiwic3ViIjoiYW5vbnltb3VzIn0.rk2im5arpBxbUHzgp7gYndn-txZR2DFyFe70Atjo2xI' }
        //   } 
        //        )
        //         .then(response => {
        //             resp = response;
        //              console.log('settings: >>>>>>>>>>>>>>>@@@@@@@@@@@>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', response);
        //         }).catch(err => {
        //             console.log(">>>>>>>>> ()()()()()()()()()()()()()()()()" , err)
        //             throw new errors.NotFound(err)
        //         });

        await r.table('settings')
        .get(data.settingId).run(connection , function(error , cursor){
            if (error) throw error;

            // console.log(cursor)
            resp = cursor
            
        })
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
                console.log("parsedBody contact post---------------->",response.data)
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
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
