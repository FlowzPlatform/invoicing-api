
const paymentConfig = require("../../../payment-plugin.js");

var TokenProvider = require('refresh-token');
var request = require('request');
var rp = require('request-promise');
const axios = require('axios');
const _ = require('lodash');
var moment = require("moment");

const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;

let api_uri = 'https://sandbox-quickbooks.api.intuit.com/v3/company/';
let token_uri = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

class QB1 {
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

    async getToken(config) {
      console.log("inside get token");
      var tokenProvider = new TokenProvider(token_uri , {
        refresh_token: config.refresh_token,
        client_id:     config.client_id,
        client_secret: config.client_secret
      });
      return new Promise(function(resolve, reject) {
        tokenProvider.getToken(function (err, newToken) {
          if (err) {
              console.log("==============",err);
          }
          else {
            resolve(newToken)
          }
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
      // console.log("requestObj",getReqObj);
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
      };
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
            // resolve(err);
            throw new errors.NotAcceptable(err);
        })
      })
    }

    async paymentGateway(data,paymentConf,config) {
      let index;
      if (config.online_payment) {
        console.log("online_payment",config.online_payment[data.gateway]);
        index = _.findIndex(config.online_payment[data.gateway], function(o) { return (o.isDefault === true && o.isDeleted !== true); });
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
          paymentConf.headers["X-api-token"] = paymentToken.x_api_token;
          paymentConf.headers["x-api-login"] = paymentToken.x_api_login;
        }
        else {
          paymentConf.body_option.amount = (data.amount * 100);
          paymentConf.body_option.cardNumber = data.cardNumber;
          paymentConf.body_option.expMonth = data.expMonth;
          paymentConf.body_option.expYear = data.expYear;
          paymentConf.body_option.cvc = data.cvc;
          if (data.gateway == "stripe") {
            paymentConf.headers["x-api-token"] = paymentToken.x_api_token;
          }
          else {
              paymentConf.headers["x-api-token"] = paymentToken.x_api_token;
              paymentConf.headers["x-api-login"] = paymentToken.x_api_login;
          }
        }

        var options = {
          method: "POST",
          uri: paymentConfig.apiUrl + '/payment?gateway=' + data.gateway,
          body: paymentConf.body_option,
          json: true, // Automatically stringifies the body to JSON
          headers: paymentConf.headers
        };

        console.log("options",options);

        rp(options)
          .then(function (parsedBody , err) {
             console.log("inside then%%%%%%%%%%%",parsedBody)
             if(parsedBody.statusCode == 402){
              reject(parsedBody)
             }else{
              resolve(parsedBody)
             }
            
          })
          .catch(function (err) {
              // POST failed...
             console.log("inside catch " , err)
             reject(err);
            //  if (err.statusCode == 500) {
            //   reject(err);
            //  }
            //throw new errors.NotAcceptable(err);
          });
      })
    }

    async postPayment(data, token,url) {
      let value;

      // await axios.get(process.env.baseUrl+"contacts", {
      //   params: data
      // })
      // .then(function (response) {
      //   console.log("contact response",response.data[0]);
      //   value = response.data[0].data[0].Id
      // })
      // .catch(function (error) {
      //   console.log("error",error);
      //   throw new errors.NotAcceptable(error);
      // });

      await axios({
        method:'get',
        url: process.env.baseUrl+'contacts',
        params : data
      })
      .then(function(response) {
          console.log("contact response",response.data[0]);
          value = response.data[0].data[0].Id
      })
      .catch(function (error) {
          console.log("error",error);
          throw new errors.NotAcceptable(error);
      });

      var line = [
        {
            "Amount": data.amount,
            "LinkedTxn": [
            {
                "TxnId": data.id,
                "TxnType": "invoice"
            }]
        }];
      var ref = {
            "value": value,
            "name": data.Name
        };
      var TotalAmt = data.amount;
      var body = JSON.stringify({'Line': line, 'CustomerRef':ref, 'TotalAmt':TotalAmt});
      var requestObj = await this.postRequestObj (url,body, token)
      // Make API call
      var result = await this.make_api_call (requestObj)
      return(result);
    }

    async createPayment(config,data) {
        var token = await this.getToken(config);
        var paymentConf = paymentConfig.credentials[data.gateway];
        // console.log("paymentConf",paymentConf)
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
        // var status = payment.status || payment.state || payment.messages.resultCode
        console.log("Status of payment", status);
        
        var payment1;
        if(status == 'succeeded' || status == 'Ok' || status == 'created') {
          var url = api_uri + config.realmId + '/payment'
          console.log('Making API call to: ' + url)
          payment1 = await this.postPayment(data,token,url);  
          return new Promise(async function(resolve, reject) {
            let jsondata = JSON.parse(payment1.body);
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
            // console.log(">>>>>>>>>>>>>>>>>>>>>jsondata",jsondata);
    
            let accObj = {
              'PaymentID' : jsondata.Payment.Id,
              'Amount' : jsondata.Payment.TotalAmt,
              'Account' : jsondata.Payment.DepositToAccountRef,
              'Invoice' : {
                'InvoiceID' : jsondata.Payment.Line[0].LinkedTxn[0].TxnId,
                'Date' : jsondata.Payment.TxnDate,
                'Status' : ''
              },
              'Contact' : {
                'ContactID' : jsondata.Payment.CustomerRef.value,
                'Name' : jsondata.Payment.CustomerRef.name
              }
            };
    
            myfinalObj.settingId = config.id
            myfinalObj.user = config.user
            myfinalObj.paymentGateway = mObj
            myfinalObj.paymentAccounting = accObj
    
            // console.log("payment transaction post obj",myfinalObj);
    
            resolve({
              paymentGateway: payment,
              paymentAccounting: jsondata,
              paymemntPostObj : myfinalObj
            });
          })
        }
        else {
          throw new errors.BadRequest(errorMsg);
        }
    }

    async getPayment(config,data) {
      var token = await this.getToken(config);
        //  console.log("token",token);

         var url = api_uri + config.realmId + '/query?query=select * from Payment'
        console.log('Making API call to: ' + url)

        var requestObj = await this.getRequestObj (url, token)

        var result = await this.make_api_call (requestObj)

      return new Promise(async function(resolve, reject) {
        // console.log("@@@@@@@@@@@inside get invoice method");
        // var token = await this.getToken();
        //  console.log("token",token);

        var jsondata = JSON.parse(result.body);
        // console.log("jsondata",jsondata)
        var len = JSON.stringify(jsondata.QueryResponse.maxResults, null, 2);
        console.log("Length of Payments",len);
        var arr = [];
        for (var i=0; i<len; i++) {
          var data1 = JSON.stringify(jsondata.QueryResponse.Payment[i], null, 2);
          arr.push(JSON.parse(data1));
        }
        resolve(arr);
      })
    }

}

module.exports = function(options) {
    return new QB1(options);
};
