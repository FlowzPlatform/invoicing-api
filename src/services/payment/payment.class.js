const Ajv = require('ajv');
const ajv = new Ajv();

const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

var rp = require('request-promise');
const axios = require('axios');


const config = require("config");
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

/* eslint-disable no-unused-vars */
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

        let response;
        let response1  = [];
        let configdata = [];
        configdata.push(await this.getConfig(params.query));
        // console.log("response config----------->",configdata);

        for (let [index, config] of configdata.entries()) {
            console.log("Domain name",config.domain);
            let schema = require("./methods/"+config.domain+"/schema.js")
            let class1 = require("./methods/"+config.domain+"/class.js")
            let obj = new class1();

            let schemaName = schema.find ;
            this.validateSchema(params.query, schemaName)

            response = await obj.getPayment(config,params);
            response1.push({
                "configName": config.configName,
                "configId": config.id,
                "data":response
            });
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
        let schemaName1 = schema1.findGetCreate ;
        this.validateSchema(data, schemaName1)

        let response;
        let configdata = [];
        configdata.push(await this.getConfig(data));
        console.log("#######configdata inside create",configdata)

        console.log("Domain name",configdata[0].domain);
        let schema = require("./methods/"+configdata[0].domain+"/schema.js")
        let class1 = require("./methods/"+configdata[0].domain+"/class.js")
        let obj = new class1();

        let schemaName = schema.createPayment ;
        this.validateSchema(data, schemaName)

        response = await obj.createPayment(configdata[0],data);
        
        // console.log("response in payment",response);

        app.service("transaction").create(response.paymemntPostObj).then(function(result){
            console.log("parsedBody---------------->",result)
        }).catch(function(err){
            console.log(">>>>>>>>>>>>>>> err in storing transaction----" , err)
            throw new errors.NotAcceptable(err);
        })

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
        // await app.service("settings").get(data.settingId)
        //     .then(response => {
        //         resp = response;
        //         // console.log('users:', response);
        //     }).catch(err => {
        //         console.log(err)
        //         throw new errors.NotFound(err)
        //     });

        await r.table('settings')
        .get(data.settingId).run(connection , function(error , cursor){
            //if (error) throw error;
    
            console.log(cursor)
            resp = cursor
            
        })

        return resp;
    }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
