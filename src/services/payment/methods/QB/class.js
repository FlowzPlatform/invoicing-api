const config = require("../../../config.js");
const paymentConfig = require("../../../payment-plugin.json");

var TokenProvider = require('refresh-token');
var request = require('request');
var rp = require('request-promise');

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

    async getToken() {
      console.log("inside get token");
      console.log("config",config.qbcredentials);
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
      console.log("requestObj",getReqObj);
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
          uri: paymentConfig.apiUrl + '/payment?gateway=stripe',
          body: paymentConf.body_option,
          json: true, // Automatically stringifies the body to JSON
          headers: paymentConf.headers
        };

        console.log("options",options);

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

    async postPayment(data, token) {
      var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/payment'
      console.log('Making API call to: ' + url)
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
            "value": data.value,
            "name": data.cname
        };
      var TotalAmt = data.amount;
      var body = JSON.stringify({'Line': line, 'CustomerRef':ref, 'TotalAmt':TotalAmt});
      var requestObj = await this.postRequestObj (url,body, token)
      console.log("requestObj@@@@",requestObj);
      // Make API call
      var result = await this.make_api_call (requestObj)
      return(result);
    }

    async createPayment(data) {
      var token = await this.getToken();
      var paymentConf = paymentConfig.credentials[data.gateway];
      // console.log("paymentConf",paymentConf)
        var payment = await this.paymentGateway(data,paymentConf);
        // console.log("payment",payment)
        if (payment.err) {
          var err = payment.err.message || payment.err.response.error_description
          console.log("Error in payment",err);
        }
        else {
          var status = payment.status
          console.log("Status of payment", status);
        }
        var payment1;
        if(status == 'succeeded' || status == 'Ok' || status == 'created') {
          payment1 = await this.postPayment(data,token);  
        }
      return new Promise(async function(resolve, reject) {

        var jsondata = JSON.parse(payment1.body);
        resolve(jsondata);
      })
    }

    async getPayment() {
      var token = await this.getToken();
         console.log("token",token);

         var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/query?query=select * from Payment'
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
