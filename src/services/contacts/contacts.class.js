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

 if (config.credentials.privateKeyPath && !config.credentials.privateKey) 
 config.credentials.privateKey = fs.readFileSync(config.credentials.privateKeyPath);
 
const xeroClient = new xero.PrivateApplication(config.credentials);

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    let schemaName = schema.get ;
    this.validateSchema(params.query, schemaName)
    let response = await obj.getAllContacts(params.query , xeroClient);
    return(response);
  }

  get (id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  async create (data, params) {
    let schemaName = schema.create ;
    this.validateSchema(data , schemaName);
    let response = await obj.createNewContact(data , xeroClient);
    return Promise.resolve(response);
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
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
