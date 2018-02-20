var rp = require('request-promise');
// let errors = require('@feathersjs/errors') ;

const r = require('rethinkdbdash')({
  db: 'invoicing_api'
});

const Ajv = require('ajv');
const ajv = new Ajv();
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;
let config = require('../../customConfig.js');


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

module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeFind(hook)
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

async function beforeFind(hook){

  let schemaName1 = schema1.findGetCreate ;
  this.validateSchema(hook.params.query, schemaName1)

  if (hook.params.query.Name) {
    let name = hook.params.query.Name;
    hook.params.query = {}
    hook.params.query['paymentAccounting.Contact.Name'] = name;
  }
  if (hook.params.query.InvoiceID || hook.params.query.Id) {
    let id = hook.params.query.InvoiceID == undefined ?  hook.params.query.Id : hook.params.query.InvoiceID;
    hook.params.query = {}
    hook.params.query['paymentAccounting.Invoice.InvoiceID'] = id;
  }
  if (hook.params.query.InvoiceNumber) {
    let invNum = hook.params.query.InvoiceNumber;
    hook.params.query = {}
    hook.params.query['paymentAccounting.Invoice.InvoiceNumber'] = invNum;
  }
  console.log(">>>>>>>> ", hook.params.query)

  // let Amount1 = hook.params.query.Amount
 // hook.params ={ query :{ paymentAccounting : {Amount: parseInt(hook.params.query.Amount)}}}
  // hook.params.query.paymentAccounting={Amount : 500}
//  hook.app.service('transaction').filter({paymentAccounting : {Amount: 50}}).then(function(result){


  //  if(hook.params.query.paymentAccounting.Amount){
  //   hook.params.query['paymentAccounting.Amount'] = 50;
  //  }

  // hook.params = {
  //   query : filter(('paymentAccounting')('Contact')('Name').eq(hook.params.query.Name))
  // }
//   })

  //   console.log(result)

  // }).catch(function(err){
  //   console.log(">> " , err)
  // });
// async function beforeFind(hook) {
  // console.log("transaction params",hook.params.query)
  // console.log("rrrrrrrrrrrrrrrrrrrr",r.row('paymentAccounting')('Contact')('Name').eq(hook.params.query.Name))
  // if (hook.params.query.Name) {
  //   hook.params = r.row('paymentAccounting')('Contact')('Name').eq(hook.params.query.Name)
  // }
  // let res = await validateUser(hook);
  // if(res.code == 401){
  //   throw new errors.NotAuthenticated('Invalid token');
  // }else{

    // console.log("userdetail api response",res);
    // hook.params.query.user = JSON.parse(res).data.email
    // hook.params.query.userId = JSON.parse(res).data._id;
    // hook.params.query.isDeleated = false;
    // if(hook.params.query.isActive == "true")
    // {
    //   hook.params.query.isActive = true;
    //  // hook.params.query.id =
    // }
    // if(hook.params.query.configId){
    //   hook.params.query.id ={$in : hook.params.query.configId}
    // }

    // console.log(hook.params.query);
  // }
}

validateUser =data =>{
    var options = {
      uri: config.default.userDetailURL,
      headers: {
        Authorization : apiHeaders.authorization
      }
  };
  return new Promise((resolve , reject) =>{
    rp(options)
    .then(function (parsedBody) {
        resolve(parsedBody)
    })
    .catch(function (err) {
      resolve({"code" : 401 })
    });
  })
}

validateSchema = (data,schemaName) => {
    let validateSc = ajv.compile(schemaName);
    let valid = validateSc(data);

    if (!valid) {
        throw new errors.NotAcceptable('user input not valid', validateSc.errors);
    }
}
