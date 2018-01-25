
const paymentConfig = require("../../../payment-plugin.json");

const xero = require('xero-node');
var rp = require('request-promise');
const _ = require('lodash');
var moment = require("moment");

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

    authentication(config) {
      return new Promise(function(resolve, reject) {
        var keybuffer = new Buffer(config.certificate, 'base64');
        let credentials = {
          "userAgent" : config.useragent,
          "consumerKey": config.consumerKey,
          "consumerSecret": config.consumerSecret,
          "privateKey": keybuffer
        }
        console.log("credentials",credentials);
        const xeroClient = new xero.PrivateApplication(credentials);
        resolve(xeroClient);
      })
    }

    async paymentGateway(data,paymentConf) {
      return new Promise(async function(resolve, reject) {
        if (data.gateway == "paypal") {
          paymentConf.body_option.transactions[0].amount.total = data.amount;
          paymentConf.body_option.transactions[0].amount.details.subtotal = data.amount;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.type = data.type;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.number = data.cardNumber;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.expire_month = data.expMonth;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.expire_year = data.expYear;
          paymentConf.body_option.payer.funding_instruments[0].payment_card.cvv2 = data.cvc;
        }
        else {
          paymentConf.body_option.amount = (data.amount * 100);
          paymentConf.body_option.cardNumber = data.cardNumber;
          paymentConf.body_option.expMonth = data.expMonth;
          paymentConf.body_option.expYear = data.expYear;
          paymentConf.body_option.cvc = data.cvc;
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

    async postPayment(data , afterPaymentData ,config) {
      return new Promise(async function(resolve, reject) {
        var samplePayment = {
          
            Invoice_No: data.id,
            settingId: data.settingId
          
        };
        console.log("samplePayment ",samplePayment);
        console.log("config ",config);
        console.log("Sample payment ",samplePayment);
        console.log("afterPaymentData " , afterPaymentData)
        var options = {
            method: "GET",
            uri: config.invoice_url,
            qs: samplePayment
          };
          console.log("options",options)
  
          rp(options)
            .then(function (parsedBody) {
                
               let newDue = JSON.parse(parsedBody).data[0].Due - afterPaymentData.amount/100 ; 
               console.log("newDue " + newDue)
               let newPaid = afterPaymentData.amount/100;
               let allNewPaid = newPaid+JSON.parse(parsedBody).data[0].Paid
               console.log("newPaid "+ newPaid )
               let newStatus = newDue <= 0 ? "PAID" : "AUTHORISED";
               console.log("newStatus " + newStatus)
               console.log("2inside then%%%%%%%%%%%",JSON.parse(parsedBody))

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
        // var paymentObj = xeroClient.core.payments.newPayment(samplePayment);
        // var myPayment;
        // paymentObj.save()
        //     .then(function(payments) {
        //       //console.log(">>>>>>>>>>>> payments " , payments)
        //         myPayment = payments.response;
        //         console.log("Save");
        //         resolve(myPayment);
        //     })
        //     .catch(function(err) {
        //         console.log("Error in payment Xero")
        //          console.log(err);
        //         resolve(err);
        //     });
      })
    }

    async createPayment(config,data) {
      //var xeroClient = await this.authentication(config);
      var paymentConf = paymentConfig.credentials[data.gateway];
      //console.log("paymentConf",paymentConf);
      var payment = await this.paymentGateway(data,paymentConf);
      
      if (payment.err) {
        var err = payment.err.message || payment.err.response.error_description
        console.log("Error in payment",err);
      }
      else {
        var status = payment.status || payment.state || payment.messages.resultCode
        console.log("Status of payment", status);
      }
     let payment1;
      if(status == 'succeeded' || status == 'Ok' || status == 'created') {
        payment1 = await this.postPayment(data , payment , config);
      }
      return new Promise(async function(resolve, reject) {
        // console.log("@@@@@@@@@  payment1",payment1)
        // console.log("payment date",payment1.Payments[0].Date)
        let myfinalObj = {};
        let mObj = {}
        _.forEach(payment, (v, k) => {
          if (k == 'id' || k == 'amount' || k == 'balance_transaction' ||  k == 'captured' || k == 'created'|| k == 'currency'|| k == 'refunded'|| k == 'refunds') {
            mObj[k] = v
          }
        })
        console.log(">>>>>>>>>>>>>>>payment1>>>>>>>>>>>>>> " , payment1);
        let accObj = {
          //'PaymentID' : payment1.Payments[0].PaymentID,
          'Amount' : mObj.amount/100,
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
          paymentAccounting: "payment1",
          paymemntPostObj : myfinalObj
        });
      })
    }

    async getPayment(config,data) {
      var xeroClient = await this.authentication(config);
      return new Promise(async function(resolve, reject) {
        xeroClient.core.payments.getPayments()
        .then(function(payments) {
              resolve(payments)
          })
          .catch(function(err) {
              console.log("Error", typeof(err));
              data = {err:'Authentication error!!! Check your connection and credentials.'};
              resolve(err)
          })
      })
    }
}

module.exports = function(options) {
    return new custom(options);
};
