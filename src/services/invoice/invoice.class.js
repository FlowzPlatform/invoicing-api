/* eslint-disable no-unused-vars */

const xero = require('xero-node');
const config = require("../config.js");
const Ajv = require('ajv');
const ajv = new Ajv();
const fs = require("fs");
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

// let schema = require("./methods/Xero/schema.js")
// let Xero1 = require("./methods/Xero/class.js")
// let obj = new Xero1();
//
// let schemaQB = require("./methods/QB/schema.js")
// let QB1 = require("./methods/QB/class.js")
// let objQB = new QB1();

var moment = require("moment");

//For quickbook
var TokenProvider = require('refresh-token');
var request = require('request')

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    let response;
    let schema1 = require("../schema.js")
    let schemaName1 = schema1.find ;
    this.validateSchema(params.query, schemaName1)

    console.log("Domain name",params.query.domain);
    let schema = require("./methods/"+params.query.domain+"/schema.js")
    let class1 = require("./methods/"+params.query.domain+"/class.js")
    let obj = new class1();

    let schemaName = schema.find ;
    this.validateSchema(params.query, schemaName)

    if (params.query.Invoiceid) {
      response = await obj.getInvoiceById(params.query.Invoiceid);
    }
    else {
      // response = obj.getAllInvoice(params.query);
      response = obj.getInvoicesByFilter(params.query);
    }

    // if (params.query.InvoiceID) {
    //   response = await obj.getInvoiceById(params.query.InvoiceID, xeroClient);
    // }
    // else if (params.query.chart == 'bar' || params.query.chart == 'line') {
    //   // console.log("inside bar call",params.query);
    //   // response = await obj.getBarChart(params.query, xeroClient);
    //   var date1 = moment(params.query.date1,'YYYY,MM,DD')
    //   var date2 = moment(params.query.date2,'YYYY,MM,DD')
    //   var month_len = (date2.diff(date1, 'month')) + 1;
    //
    //   var monthNames = ["January", "February", "March", "April", "May", "June",
    //   "July", "August", "September", "October", "November", "December"];
    //
    //   var amt_data = [
    //     {
    //       name : "Paid Amount",
    //       data : [ ]
    //     },
    //     {
    //       name : "Unpaid Amount",
    //       data : [ ]
    //     },
    //     {
    //       name : "Draft Amount",
    //       data : [ ]
    //     }
    //   ];
    //
    //   var filter = '';
    //   for (var i=month_len-1; i >= 0; i--) {
    //     var invoice_arr = [];
    //     if ( i == (month_len-1)) {
    //       var mnth = moment(date2).format('MM')
    //       var year = moment(date2).format('YYYY')
    //       var dategt = year+','+ mnth + ',1'
    //       var datelt = moment(date2).format('YYYY,MM,DD')
    //       var mnth_name =  monthNames[mnth - 1];
    //       filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
    //       console.log("Filter####",filter);
    //       var arr = await obj.invoiceStatistics(filter, xeroClient)
    //       invoice_arr.push(arr);
    //     }
    //     else if (i == 0) {
    //       var mnth = moment(date1).format('MM')
    //       var year = moment(date1).format('YYYY')
    //       var day = this.daysInMonth(mnth, year)
    //       dategt = moment(date1).format('YYYY,MM,DD')
    //       datelt = year+','+ mnth + ',' + day
    //       var mnth_name =  monthNames[mnth - 1];
    //       filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
    //       console.log("Filter####",filter);
    //       var arr = await obj.invoiceStatistics(filter, xeroClient)
    //       invoice_arr.push(arr);
    //     }
    //     else {
    //       var mnth = parseInt(moment(date1).format('MM')) + i
    //       var year = moment(date1).format('YYYY')
    //       var day = this.daysInMonth(mnth, year)
    //       dategt = year+','+ mnth + ',1'
    //       datelt = year+','+ mnth + ',' + day
    //       var mnth_name =  monthNames[mnth - 1];
    //       filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
    //       console.log("Filter####",filter);
    //       var arr = await obj.invoiceStatistics(filter, xeroClient)
    //       invoice_arr.push(arr);
    //     }
    //
    //     var draft_amt = 0;
    //     var authorize_amt = 0;
    //     var paid_amt = 0;
    //     // console.log("arr",arr[5]);
    //     console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
    //     invoice_arr.forEach(function(invoice) {
    //       // console.log("@@@@@@@@@@@@@@arr",invoice[0]._obj.Status);
    //       invoice.forEach(function(inv) {
    //         // console.log("inv status",inv.Status);
    //         // console.log("amount",inv.Total);
    //         if (inv.Status == "PAID") {
    //           // console.log("Paid invoice");
    //           paid_amt += inv.Total;
    //         }
    //         else if (inv.Status == "AUTHORISED") {
    //           // console.log("Unpaid invoice");
    //           authorize_amt += inv.Total;
    //         }
    //         else {
    //           // console.log("Draft or Void invoice");
    //           draft_amt += inv.Total;
    //         }
    //       })
    //     })
    //     console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
    //     var amt = [paid_amt, authorize_amt, draft_amt]
    //     for (var j=0; j<3; j++) {
    //       amt_data[j].data.push({"label" : mnth_name +'-2017', y : amt[j]})
    //     }
    //   }
    //   response = amt_data;
    // }
    // else if (params.query.chart == 'pie') {
    //   var date1 = moment(params.query.date1).format('YYYY,MM,DD')
    //   var date2 = moment(params.query.date2).format('YYYY,MM,DD')
    //   var filter = "";
    //   var paid_amt = 0;
    //   var unpaid_amt = 0;
    //   var draft_amt= 0;
    //   var arr_invoice;
    //   filter = ' Date >= DateTime(' + date1 + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + date2 + ',00,00,00)'
    //   console.log("#######filter",filter);
    //   arr_invoice = await obj.invoiceStatistics(filter, xeroClient)
    //   arr_invoice.forEach(function(invoice) {
    //     // console.log("@@@@@#############invoice",invoice);
    //       if(invoice.Status == 'AUTHORISED') {
    //         unpaid_amt += invoice.Total;
    //       }
    //       else if(invoice.Status == 'DRAFT') {
    //         draft_amt += invoice.Total;
    //       }
    //       else {
    //         paid_amt += invoice.Total;
    //       }
    //   });
    //   var pie_data = [
    //     {name: "Paid Amount", value: paid_amt},
    //     {name:"Unpaid Amount", value: unpaid_amt},
    //     {name: "Draft Amount", value: draft_amt}
    //   ];
    //   response = pie_data
    // }
    // else if (params.query.chart == 'cashflow') {
    //   var date1 = moment(params.query.date1,'YYYY,MM,DD')
    //   var date2 = moment(params.query.date2,'YYYY,MM,DD')
    //   var month_len = (date2.diff(date1, 'month')) + 1;
    //
    //   var monthNames = ["January", "February", "March", "April", "May", "June",
    //   "July", "August", "September", "October", "November", "December"];
    //
    //   var filter = '';
    //   var cashflow_arr = [];
    //   for (var i=month_len-1; i >= 0; i--) {
    //     var invoice_arr = [];
    //     if ( i == (month_len-1)) {
    //       var mnth = moment(date2).format('MM')
    //       var year = moment(date2).format('YYYY')
    //       var dategt = year+','+ mnth + ',1'
    //       var datelt = moment(date2).format('YYYY,MM,DD')
    //       var mnth_name =  monthNames[mnth - 1];
    //       filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
    //       console.log("Filter####",filter);
    //       var arr = await obj.invoiceStatistics(filter, xeroClient)
    //       invoice_arr.push(arr);
    //     }
    //     else if (i == 0) {
    //       var mnth = moment(date1).format('MM')
    //       var year = moment(date1).format('YYYY')
    //       var day = this.daysInMonth(mnth, year)
    //       dategt = moment(date1).format('YYYY,MM,DD')
    //       datelt = year+','+ mnth + ',' + day
    //       var mnth_name =  monthNames[mnth - 1];
    //       filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
    //       console.log("Filter####",filter);
    //       var arr = await obj.invoiceStatistics(filter, xeroClient)
    //       invoice_arr.push(arr);
    //     }
    //     else {
    //       var mnth = parseInt(moment(date1).format('MM')) + i
    //       var year = moment(date1).format('YYYY')
    //       var day = this.daysInMonth(mnth, year)
    //       dategt = year+','+ mnth + ',1'
    //       datelt = year+','+ mnth + ',' + day
    //       var mnth_name =  monthNames[mnth - 1];
    //       filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
    //       console.log("Filter####",filter);
    //       var arr = await obj.invoiceStatistics(filter, xeroClient)
    //       invoice_arr.push(arr);
    //     }
    //
    //     var status_amt = 0;
    //     invoice_arr.forEach(function(invoice) {
    //       invoice.forEach(function(inv) {
    //         if (params.query.status) {
    //           if((inv.Status).toLowerCase() == params.query.status.toLowerCase()) {
    //             status_amt += inv.Total               ///need to use status according field
    //           }
    //         }
    //         else {
    //           status_amt += inv.Total
    //         }
    //       })
    //       cashflow_arr.push({"label":mnth_name, "y" : status_amt})
    //     })
    //   }
    //   response = cashflow_arr;
    // }
    // else if (params.query.stats) {
    //   var date1 = moment(params.query.date1).format('YYYY,MM,DD')
    //   var date2 = moment(params.query.date2).format('YYYY,MM,DD')
    //   var filter = "";
    //   var paid_amt = 0;
    //   var unpaid_amt = 0;
    //   var draft_amt= 0;
    //   var total_amt = 0;
    //   var arr_invoice;
    //   var arr_block;
    //   filter = ' Date >= DateTime(' + date1 + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + date2 + ',00,00,00)'
    //   console.log("#######filter",filter);
    //   arr_invoice = await obj.invoiceStatistics(filter, xeroClient);
    //   arr_invoice.forEach(function(invoice) {
    //     // console.log("@@@@@#############invoice",invoice);
    //       if(invoice.Status == 'AUTHORISED') {
    //         unpaid_amt += invoice.Total;
    //       }
    //       else if(invoice.Status == 'DRAFT') {
    //         draft_amt += invoice.Total;
    //       }
    //       else {
    //         paid_amt += invoice.Total;
    //       }
    //   });
    //   total_amt = unpaid_amt + draft_amt + paid_amt;
    //   arr_block = [
    //     {name: "Total Amount", value: total_amt},
    //     {name: "Paid Amount", value: paid_amt},
    //     {name:"Unpaid Amount", value: unpaid_amt},
    //     {name: "Draft Amount", value: draft_amt}
    //   ];
    //   response = arr_block;
    // }
    // else if (params.query.qb) {
    //   // var token = await this.getToken();
    //   if (params.query.id) {
    //     response = await objQB.getInvoiceById(params.query.id,this);
    //   }
    //   else if (params.query.value) {
    //     response = await objQB.getInvoiceByName(params.query.value,this);
    //   }
    //   else {
    //     response = await objQB.getInvoice(this);
    //   }
    // }
    // else {
    //   response = await obj.getInvoicesByFilter(params.query, xeroClient);
    // }
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
    console.log("Domain name",data.domain);
    let schema = require("./methods/"+data.domain+"/schema.js")
    let class1 = require("./methods/"+data.domain+"/class.js")
    let obj = new class1();

    let schemaName = schema.create ;
    this.validateSchema(data, schemaName)

    let response = await obj.createInvoice(data);

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

  //to count days in one month
  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  //Qb functions
  getToken() {
    var tokenProvider = new TokenProvider(config.qbcredentials.tokenUrl, {
      refresh_token: config.qbcredentials.refresh_token,
      client_id:     config.qbcredentials.client_id,
      client_secret: config.qbcredentials.client_secret
    });
    return new Promise(function(resolve, reject) {
      tokenProvider.getToken(function (err, newToken) {
        resolve(newToken)
      });
    })
  }

  getRequestObj(url, token) {
    var getReqObj = {
      url: url,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    }
    return getReqObj;
  }

  postRequestObj(url, body, token) {
    var postReqObj = {
      url: url,
      method: 'POST',
      body: body,
      headers: {
        'Authorization': 'Bearer ' + token ,
        'Accept': 'application/json',
        'Content-Type' : 'application/json'
      }
    }
    return postReqObj;
  }

  make_api_call(requestObj) {
    return new Promise(function (resolve, reject) {
      console.log("INSIDE API CALL")
      request(requestObj, function (err, response) {
          // console.log("Response",response.body)
          resolve(response);
        }, function (err) {
          // console.log("Error",err);
          resolve({isError:true, err:err});
      })
    })
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
