
const paymentConfig = require("../../../payment-plugin.js");

const xero = require('xero-node');
var rp = require('request-promise');
const _ = require('lodash');
var moment = require("moment");

const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

class custom {
    /**
     * constructor
     * @param {*} options
     */
    constructor() {
        console.log("inside constr")

        // this.options = options || {};
    }

    setup(app) {
        this.app = app;
      }

    /**
     * do direct charge
     * @param {*} data
     */

    async paymentGateway(data,paymentConf,config) {
      let index;
      if (config.online_payment) {
        console.log("online_payment",config.online_payment[data.gateway]);
        index = _.findIndex(config.online_payment[data.gateway], function(o) { return o.isDefault == true; });
        console.log("_.findIndex",index);
        if (index < 0) {
            throw new errors.NotFound("Payment Credential is not available. Please configure atleast one credential!!")
        }
      }
      else {
        throw new errors.NotFound("Payment Credential is not available. Please configure atleast one credential!!")
      }
      return new Promise(async function(resolve, reject) {
        let paymentToken = config.online_payment[data.gateway][index]
        console.log("configData",config.online_payment[data.gateway][index]);
        // let paymentToken = config.online_payment[data.gateway];
        if (data.gateway == "paypal") {
          paymentConf.body_option.transactions[0].amount.total = data.amount;
          paymentConf.body_option.transactions[0].amount.details.subtotal = data.amount;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.type = data.type;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.number = data.cardNumber;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.expire_month = data.expMonth;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.expire_year = data.expYear;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.cvv2 = data.cvc;
          paymentConf.headers["X-api-token"] = paymentToken.Client_Id;
          paymentConf.headers["x-api-login"] = paymentToken.Secret;
        }
        else {
          paymentConf.body_option.amount = (data.amount);
          paymentConf.body_option.cardNumber = data.cardNumber;
          paymentConf.body_option.expMonth = data.expMonth;
          paymentConf.body_option.expYear = data.expYear;
          paymentConf.body_option.cvc = data.cvc;
          if (data.gateway == "stripe") {
            paymentConf.headers["x-api-token"] = paymentToken.Secret_Key;
          }
          else {
              paymentConf.headers["x-api-token"] = paymentToken.Transaction_Key;
              paymentConf.headers["x-api-login"] = paymentToken.Signature_Key;
          }
        }

        var options = {
          method: "POST",
          uri: paymentConfig.apiUrl + '/payment',
          body: paymentConf.body_option,
          json: true, // Automatically stringifies the body to JSON
          headers: paymentConf.headers
        };
        console.log("options",options)

        rp(options)
          .then(function (parsedBody) {
            // console.log("inside then%%%%%%%%%%%",parsedBody)
            resolve(parsedBody);
          })
          .catch(function (err) {
            console.log("inside catch")
            reject(err);
              // POST failed...
          });
      })
    }

    async postPayment(data , afterPaymentData, gateway ,config) {
      return new Promise(async function(resolve, reject) {
        let amount = data.amount;
        var samplePayment = {
          
            Invoice_No: data.id,
            settingId: data.settingId
          
        };
        // console.log("samplePayment ",samplePayment);
        // console.log("config ",config);
        // console.log("Sample payment ",samplePayment);
        // console.log("afterPaymentData " , afterPaymentData)
        var options = {
            method: "GET",
            uri: config.invoice_url,
            qs: samplePayment
          };
          console.log("options",options)
  
          rp(options)
            .then(function (parsedBody) {
               console.log("2inside then%%%%%%%%%%%",JSON.parse(parsedBody))
                let newDue;
                let newPaid;
                // if (gateway == 'paypal') {
                //   newDue = JSON.parse(parsedBody).data[0].Due - afterPaymentData.amount;
                //   newPaid = afterPaymentData.amount;
                // }
                // else {
                //   newDue = JSON.parse(parsedBody).data[0].Due - afterPaymentData.amount/100 ;
                //   newPaid = afterPaymentData.amount/100;
                // }

                newDue = JSON.parse(parsedBody).data[0].Due - amount ;
                newPaid = amount;
               console.log("newDue " + newDue)
               let allNewPaid = newPaid+JSON.parse(parsedBody).data[0].Paid
               console.log("newPaid "+ newPaid )
               let newStatus = newDue <= 0 ? "PAID" : "AUTHORISED";
               console.log("newStatus " + newStatus)

            let id = JSON.parse(parsedBody).data[0].id
            let data = {Status : newStatus , Paid : allNewPaid , Due : newDue , payment_Date : moment(new Date()).format("DD/MM/YYYY") };
            let resultAfterUpdate ;
             app.service("custominvoice").patch(JSON.parse(parsedBody).data[0].id , data).then(function(result , err){
                console.log(result)
                resolve(result);
                console.log(err)
            })
            
            })
            .catch(function (err) {
              console.log("inside catch")
              console.log(err)
              reject(err);
                // POST failed...
            });
      })
    }

    async createPayment(config,data) {
      
      var paymentConf = paymentConfig.credentials[data.gateway];
      //console.log("paymentConf",paymentConf);
      var payment = await this.paymentGateway(data,paymentConf,config);
      
      console.log("payment response from gateway",payment);
      var status;
      var errorMsg;
      //stripe invalid token error
      if (payment.statusCode == 401) {
          errorMsg = payment.message
      }
      //paypal internal service error
      else if (payment.httpStatusCode == 500) {
          errorMsg = payment.response.message
      }
      else {
          status = payment.status || payment.state || payment.messages.resultCode
      }
      if (status == "Error") {
          errorMsg = payment.messages.message[0].text
      }
      console.log("Status of payment", status);
      
     let payment1;
      if(status == 'succeeded' || status == 'Ok' || status == 'created') {
        payment1 = await this.postPayment(data , payment, data.gateway , config);
        return new Promise(async function(resolve, reject) {
          // console.log("@@@@@@@@@  payment1",payment1)
          // console.log("payment date",payment1.Payments[0].Date)
          let myfinalObj = {};
          let mObj = {
              'Gateway' : data.gateway
          }
          _.forEach(payment, (v, k) => {
              if (k == 'id' || k == 'amount' || k == 'balance_transaction' ||  k == 'captured' || k == 'created'|| k == 'currency'|| k == 'refunded'|| k == 'refunds' || 
                  k == 'transactionResponse' || 
                  k == 'create_time' || k == 'update_time' || k == 'state' || k == 'payer' || k == 'transactions') {
                  mObj[k] = v
              }
          })
          console.log(">>>>>>>>>>>>>>>payment1>>>>>>>>>>>>>> " , payment1);
          
          let accObj = {
            //'PaymentID' : payment1.Payments[0].PaymentID,
            'Amount' : data.amount,
            //'Account' : payment1.Payments[0].Account,
            'Invoice' : {
              'InvoiceID' : payment1.id,
              'InvoiceNumber' : payment1.Invoice_No,
              'Date' :payment1.payment_Date,
              'DueDate' : payment1.DueDate,
              'LineItems' : payment1.Products
            },
            'Contact' : {
              'ContactID' : ""  ,
              'Name' : payment1.Name
            }
          };
  
           myfinalObj.settingId = config.id
           myfinalObj.user = config.user
           myfinalObj.paymentGateway = mObj
           myfinalObj.paymentAccounting = accObj
  
          // console.log("payment transaction post obj",myfinalObj);
  
          resolve({
            paymentGateway: payment,
            paymentAccounting: payment1,
            paymemntPostObj : myfinalObj
          });
        })
      }
      else {
        throw new errors.BadRequest(errorMsg);
      }
    }
}

module.exports = function(options) {
    return new custom(options);
};
