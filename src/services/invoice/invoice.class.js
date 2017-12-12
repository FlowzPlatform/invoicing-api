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

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    let schemaName = schema.find ;
    this.validateSchema(params.query, schemaName)
    if (config.privateKeyPath && !config.privateKey)
    config.privateKey = fs.readFileSync(config.privateKeyPath);
    const xeroClient = new xero.PrivateApplication(config);
    let response;
    if (params.query.InvoiceID) {
      response = await obj.getInvoiceById(params.query.InvoiceID, xeroClient);
    }
    else {
      response = await obj.getInvoicesByFilter(params.query, xeroClient);
    }
    return(response);
  }

  async get (id, params) {
    console.log("id",id)
    if (config.privateKeyPath && !config.privateKey)
    config.privateKey = fs.readFileSync(config.privateKeyPath);
    const xeroClient = new xero.PrivateApplication(config);
    let response = await obj.getInvoiceById(id, xeroClient);
    return(response);
  }

  async create (data, params) {
    if (config.privateKeyPath && !config.privateKey)
    config.privateKey = fs.readFileSync(config.privateKeyPath);
    const xeroClient = new xero.PrivateApplication(config);
    let response = await obj.createInvoice(data, xeroClient);
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
