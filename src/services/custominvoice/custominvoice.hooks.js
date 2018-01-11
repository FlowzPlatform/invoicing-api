let _ = require('lodash');
let moment = require('moment');
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => beforeCreateInvoice(hook)
    ],
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


async function beforeCreateInvoice(hook){
  
  let invoiceCount =await hook.app.service("custominvoice").find({"settingId" : hook.data.settingId}).then(function(result){
    console.log("console.log(invoiceCount) ", result.total)
    return result.total
  })

  console.log("#DueDate " ,  moment(hook.data.DueDate).format('DD/MM/YYYY'))
  let incr = invoiceCount+1
  
  if(hook.data.Products.length > 0){
    let maximum = _.map(hook.data.Products, function(o) { return o.qty * o.amount; });
    let Total = maximum.reduce(function(maximum, b) { return maximum + b; }, 0);
    hook.data.DueDate = moment(hook.data.DueDate).format('DD/MM/YYYY');
    hook.data.Total = Total.toFixed(2);
    hook.data.Paid = 0;
    hook.data.Due = Total.toFixed(2);
    hook.data.Status = 'AUTHORISED';
    hook.data.Invoice_No = "CINV-00"+incr
  }else{
    hook.data.Total = 0
    hook.data.Paid = 0;
    hook.data.Due = 0;
    hook.data.Status = 'AUTHORISED';
    hook.data.Invoice_No = "CINV-00"+incr
  }
}