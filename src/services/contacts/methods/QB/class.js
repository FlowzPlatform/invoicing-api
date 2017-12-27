var moment = require('moment');
// const config = require("../../../config.js");
const paymentConfig = require("../../../payment-plugin.json");

//For quickbook
var TokenProvider = require('refresh-token');
var request = require('request')
let api_uri="https://sandbox-quickbooks.api.intuit.com/v3/company/"
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

    //Qb functions
    getToken(config) {
      console.log("inside get token");
      // var tokenProvider = new TokenProvider(config.qbcredentials.tokenUrl, {
      //   refresh_token: config.qbcredentials.refresh_token,
      //   client_id:     config.qbcredentials.client_id,
      //   client_secret: config.qbcredentials.client_secret
      // });
      var tokenProvider = new TokenProvider('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        refresh_token: config.refresh_token,
        // refresh_token: config.refresh_token,
        client_id:     config.client_id,
        client_secret: config.client_secret
      });
      // console.log("tokenProvider",tokenProvider);
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

    async getAllContacts(config,data) {
      let token = await this.getToken(config);
       console.log("token >>>>>>>>>>  ",token);
       let arrcustomer = [];
      let url = api_uri + config.realmId + '/query?query=select * from Customer'
      console.log('Making API call to: ' + url)
  
      let requestObj = await this.getRequestObj (url , token)
      let result = await this.make_api_call (requestObj)
      return new Promise(async function(resolve, reject) {
        // console.log("@@@@@@@@@@@inside get invoice method");
        
        let jsondata = JSON.parse(result.body);
        let len = JSON.stringify(jsondata.QueryResponse.maxResults, null, 2);
        console.log("Length of Customer",len);
        
        for (let i=0; i<len; i++) {
          let data1 =jsondata.QueryResponse.Customer[i];
          
          // console.log("data:",arrdata)
          arrcustomer.push(data1);
        }
        console.log("Customer Get Data",arrcustomer[0]);
        resolve (arrcustomer);
      })
    }

    async createContact(config,data) { 
      var token = await this.getToken(config);

      var url = config.api_uri + req.session.credentials[0].realmId + '/customer'
      console.log('Making API call to: ' + url)
      
      var postrequestObj = await this.postRequestObj (url,body, token)
      var result = await this.make_api_call (postrequestObj)

    }
}

module.exports = function(options) {
    return new QB1(options);
};