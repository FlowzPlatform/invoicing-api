const Ajv = require('ajv');
const ajv = new Ajv();

const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    let response;

    let schema1 = require("../schema.js");
    let schemaName1 = schema1.find;
    this.validateSchema(params.query, schemaName1);

    console.log("Domain name",params.query.domain);
    let schema = require("./methods/"+params.query.domain+"/schema.js")
    let class1 = require("./methods/"+params.query.domain+"/class.js")
    let obj = new class1();

    let schemaName = schema.find ;
    this.validateSchema(params.query, schemaName)

    response = await obj.getPayment(this);
    return response;
  }

  get (id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  async create (data, params) {
    console.log("Domain name",data.domain);
    let schema = require("./methods/"+data.domain+"/schema.js")
    let class1 = require("./methods/"+data.domain+"/class.js")
    let obj = new class1();

    let response;

    let schemaName = schema.createPayment ;
    this.validateSchema(data, schemaName)

    response = await obj.createPayment(data);
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
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
