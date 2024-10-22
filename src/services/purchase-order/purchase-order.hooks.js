const Validation  = require('./purchase-order-validation').validateObj;
const  POSettingValidation  = require('./purchase-order-validation').checkPOSettingValidationObj;
const  POEmail  = require('./purchase-order-validation').poEmailSentObj;
const  PoGenerateCal  = require('./purchase-order-validation').poGenerateCalObj;
const  POUpdateInMyOrder  = require('./purchase-order-validation').POUpdateInMyOrderObj;

module.exports = {
  before: {
    all: [],
    find:[
      hook => beforeFind(hook)
    ],
    get:[],
    create:[ hook=>Validation(hook),hook=>PoGenerateCal(hook),hook=>POSettingValidation(hook)],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [hook=>POUpdateInMyOrder(hook)],
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

function beforeFind(hook) {
  // if(hook.params.query.websiteId == undefined) {
  //   hook.result = {status:400, message: "Please pass websiteId"}
  // }
}