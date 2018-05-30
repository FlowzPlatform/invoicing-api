
const paymentConfig = require("../../../payment-plugin.js");

const xero = require('xero-node');
var rp = require('request-promise');
const _ = require('lodash');
var moment = require("moment");

const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

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
        const xeroClient = new xero.PrivateApplication(credentials);
        resolve(xeroClient);
      })
    }

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
                console.log("inside then%%%%%%%%%%%",parsedBody)
                if(parsedBody.statusCode == 402){
                    reject(parsedBody)
                }else{
                    resolve(parsedBody)
                }
            })
            .catch(function (err) {
                console.log("###########")
                console.log("@@@@@@@@@",err)
                // POST failed...
                reject (err);
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
              // console.log(">>>>>>>>>>>> payments " , payments)
                myPayment = payments.response;
                console.log("Payment Save");
                resolve(myPayment);
            })
            .catch(function(err) {
                console.log("Error in payment Xero")
                // console.log("#################",err.data.Elements[0]);
                // console.log("#################",err.data.Elements[0].ValidationErrors);
                //  console.log("#################",err.data.Message);
                reject(err);
                // throw new errors.NotAcceptable(err);
            });
      })
    }

    async createPayment(config,data) {
        var xeroClient = await this.authentication(config);
        var paymentConf = paymentConfig.credentials[data.gateway];
        console.log("paymentConf",paymentConf);

        if (paymentConf != undefined) {
            //payment in gateway
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
            else if (payment.httpStatusCode == 401) {
                errorMsg = payment.response.error_description
            }
            else {
                status = payment.status || payment.state || payment.messages.resultCode
            }
            if (status == "Error") {
                errorMsg = payment.messages.message[0].text
            }
            console.log("Status of payment", status);

            //payment In accounting 
            var payment1;
            if(status == 'succeeded' || status == 'Ok' || status == 'created') {
                payment1 = await this.postPayment(data,xeroClient);
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
                    let accObj = {
                        'PaymentID' : payment1.Payments[0].PaymentID,
                        'Amount' : payment1.Payments[0].Amount,
                        'Account' : payment1.Payments[0].Account,
                        'Invoice' : {
                            'InvoiceID' : payment1.Payments[0].Invoice.InvoiceID,
                            'InvoiceNumber' : payment1.Payments[0].Invoice.InvoiceNumber,
                            'Date' : moment(payment1.Payments[0].Date).format('DD/MM/YYYY'),
                            'DueDate' : payment1.Payments[0].Invoice.DueDateString,
                            'LineItems' : payment1.Payments[0].Invoice.LineItems,
                            'Status' : payment1.Payments[0].Invoice.Status
                        },
                        'Contact' : {
                            'ContactID' : payment1.Payments[0].Invoice.Contact.ContactID,
                            'Name' : payment1.Payments[0].Invoice.Contact.Name
                        }
                    };
    
                    myfinalObj.settingId = config.id
                    myfinalObj.user = config.user
                    myfinalObj.paymentGateway = mObj
                    myfinalObj.paymentAccounting = accObj
    
                    console.log("payment transaction post obj",myfinalObj);
    
                    resolve({
                        paymentGateway: payment,
                        paymentAccounting: payment1,
                        paymemntPostObj : myfinalObj
                    });
                })
            }
            else {
                // var errorMsg = payment.message || payment.messages.message[0].text
                throw new errors.BadRequest(errorMsg);
            }

        }
        else {
            throw new errors.NotFound("Gateway is not available");
        }

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
            //   data = {err:'Authentication error!!! Check your connection and credentials.'};
            //   resolve(err)
            throw new errors.NotFound(err)
          })
      })
    }
}

module.exports = function(options) {
    return new Xero1(options);
};
