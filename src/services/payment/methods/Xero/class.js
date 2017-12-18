const config = require("../../../config.js");
const paymentConfig = require("../../../payment-plugin.json");

const xero = require('xero-node');
const fs = require("fs");
var rp = require('request-promise');

class Xero1 {
    /**
     * constructor
     * @param {*} options
     */
    constructor() {
        console.log("inside constr")

        // this.options = options || {};
    }

    /**
     * do direct charge
     * @param {*} data
     */

    authentication() {
      return new Promise(function(resolve, reject) {
        if (config.credentials.privateKeyPath && !config.credentials.privateKey)
        config.credentials.privateKey = fs.readFileSync(config.credentials.privateKeyPath);
        const xeroClient = new xero.PrivateApplication(config.credentials);
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
            resolve({err:err});
              // POST failed...
          });
      })
    }

    async postPayment(data, xeroClient) {
      return new Promise(async function(resolve, reject) {
        var samplePayment = {
          Invoice: {
              InvoiceID: data.id
          },
          Account: {
              Code: '090'
          },
          Date: new Date().toISOString().split("T")[0],
          Amount: data.amount
        };
        console.log("Sample payment",samplePayment);
        var paymentObj = xeroClient.core.payments.newPayment(samplePayment);
        var myPayment;
        paymentObj.save()
            .then(function(payments) {
                myPayment = payments.entities[0];
                console.log("Save");
                resolve(myPayment);
            })
            .catch(function(err) {
                console.log("Error in payment Xero")
                // console.log(err);
                resolve({err:'Not able to perform payment!! Check Payment data'});
            });
      })
    }

    async createPayment(data) {
      var xeroClient = await this.authentication();
      var paymentConf = paymentConfig.credentials[data.gateway];
      console.log("paymentConf",paymentConf);
      var payment = await this.paymentGateway(data,paymentConf);
      console.log("payment",payment)
      if (payment.err) {
        var err = payment.err.message || payment.err.response.error_description
        console.log("Error in payment",err);
      }
      else {
        var status = payment.status || payment.messages.resultCode || payment.state
        console.log("Status of payment", status);
      }
      var payment1;
      if(status == 'succeeded' || status == 'Ok' || status == 'created') {
        payment1 = await this.postPayment(data,xeroClient);
      }
      return new Promise(async function(resolve, reject) {
        resolve(payment1);
      })
    }

    async getPayment(self) {
      var xeroClient = await this.authentication();
      return new Promise(async function(resolve, reject) {
        xeroClient.core.payments.getPayments()
        .then(function(payments) {
              resolve(payments)
          })
          .catch(function(err) {
              console.log("Error", typeof(err));
              data = {err:'Authentication error!!! Check your connection and credentials.'};
          })
      })
    }
}

module.exports = function(options) {
    return new Xero1(options);
};
