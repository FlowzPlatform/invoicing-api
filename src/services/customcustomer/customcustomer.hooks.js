
let Ajv = require('ajv');
let feathersErrors = require('feathers-errors');
let errors = feathersErrors.errors;

let schema = {
  "properties": {
      "settingId": {
          "type": "string",
          "description": "settingId in String is requred",
      }
  },
  "required": ["settingId" ]
 // "additionalProperties": false
};
module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeHook(hook)
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};


function beforeHook(hook){
  
  validateSchema(hook.params.query, schema)
}

function validateSchema(data, schema) {
          let ajv = new Ajv(); 
          let validateSc = ajv.compile(schema);
          let valid = validateSc(data);
  
          if (!valid) {
              throw new errors.NotAcceptable('user input not valid', validateSc.errors);
          }
      }