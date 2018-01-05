
const paymentConfig = require("../../../payment-plugin.json");

const xero = require('xero-node');
var rp = require('request-promise');
const axios = require('axios');
var _ = require('lodash')

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
              Code: '001'
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
                 console.log(err);
                resolve({err:'Not able to perform payment!! Check Payment data'});
            });
      })
    }

    async createPayment(config,data) {
      console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
      var xeroClient = await this.authentication(config);
      var paymentConf = paymentConfig.credentials[data.gateway];
      console.log("paymentConf",paymentConf);
      var payment = await this.paymentGateway(data,paymentConf);
      var res

      console.log("data.settingId------------------->",data.settingId)
      console.log("apiHeaders.authorization===================>",apiHeaders.authorization)

      await axios.get('http://localhost:3037/invoice/'+ data.id, {
          params: {
            settingId : data.settingId
          },
          headers: {
            Authorization : apiHeaders.authorization
          }
        })
        .then(function (response) {
          console.log("response",response)
          res = response
        })
        .catch(function (error) {
          console.log("error",error);
        });
      console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU",res.data[0].Contact.ContactID)
      let myfinalObj = {};
        myfinalObj.settingId = data.settingId
        myfinalObj.user = data.user
        var mObj = {}
        _.forEach(payment, (v, k) => {
          if (k == 'id' || k == 'amount' || k == 'balance_transaction' ||  k == 'captured' || k == 'created'|| k == 'currency'|| k == 'refunded'|| k == 'refunds') {
            mObj[k] = v
          }
        })
        myfinalObj.payment = mObj

        var mObj1 = {}
        mObj1['id']= res.data[0].Contact.ContactID
        mObj1['name'] =res.data[0].Contact.Name

        myfinalObj.Customer = mObj1

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
        // console.log("@@@@@@@@@payment1",payment1)
        myfinalObj.Accounting = payment1
        resolve(myfinalObj);
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
    return new Xero1(options);
};
