var moment = require('moment');
const config = require("../../../config.js");
const paymentConfig = require("../../../payment-plugin.json");

//For quickbook
var TokenProvider = require('refresh-token');
var request = require('request')

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
    getToken() {
      console.log("inside get token");
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

    async getAllInvoice(data) {
      return new Promise(async function(resolve, reject) {
        // console.log("@@@@@@@@@@@inside get invoice method");
        var token = await this.getToken();
        // console.log("token",token);

        var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/query?query=select * from Invoice'
        console.log('Making API call to: ' + url)

        var requestObj = await this.getRequestObj (url, token)

        var result = await this.make_api_call (requestObj)

        var jsondata = JSON.parse(result.body);
        var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
        console.log("Length of Invoice",len);
        var arr = [];
        for (var i=0; i<len; i++) {
          var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[i], null, 2);
          arr.push(JSON.parse(data1));
        }
        resolve(arr);
      })
    }

    async getInvoiceById(id) {
      var token = await this.getToken();
      // console.log("token",token);

      var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + "/query?query=select * from Invoice where Id='" + id + "'"
      console.log('Making API call to: ' + url)

      var requestObj = await this.getRequestObj (url, token)

      var result = await this.make_api_call (requestObj)

      return new Promise(async function(resolve, reject) {
        console.log("@@@@@@@@@@@inside get invoice by id",id);

        var jsondata = JSON.parse(result.body);
        var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
        console.log("Length of Invoice",len);
        var arr = [];
        for (var i=0; i<len; i++) {
          var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[i], null, 2);
          arr.push(JSON.parse(data1));
        }
        resolve(arr);
      })
    }

    async createInvoice(data) {
      var token = await this.getToken();
      var value = '59';             //customer ref value
      var line = [
              {
                "Amount": data.amount,
                "DetailType": "SalesItemLineDetail",
                "SalesItemLineDetail": {
                  "ItemRef": {
                    "value": "2",
                    "name": "Services"
                  }
                }
              }
            ];
      var ref = {
                "value": value,
            };
      var body = JSON.stringify({'Line': line, 'CustomerRef':ref});
      console.log("body",body);
      var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/invoice'
      console.log('Making API call to: ' + url)
      var postrequestObj = await this.postRequestObj (url,body, token)
      var result = await this.make_api_call (postrequestObj)
      var jsondata = JSON.parse(result.body);
      var data1 = JSON.stringify(jsondata.Invoice, null, 2);
      var arr = JSON.parse(data1);
      return arr;
    }

    async getInvoicesByFilter(data) {

      var data_arr = [];
      var condition = '';
      data_arr.push(data);
      var keys = Object.keys(data_arr[0]);
      var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + "/query?query=select * from Invoice "

      for (var i = 0; i < keys.length; i++) {
        if ( i == 1) {
          condition = 'WHERE '
        }
        else {
          // console.log("inside key else ");
          condition = ' && '
        }
        if (keys[i] == 'domain') {

        }
        else {
          if (keys[i].slice(0,3) == 'min') {
            url += condition + keys[i].slice(3,keys[i].length) + " >='" + data_arr[0][keys[i]] + "'"
          }
          else if (keys[i].slice(0,3) == 'max') {
            url += condition + keys[i].slice(3,keys[i].length) + " <='" + data_arr[0][keys[i]] + "'"
          }
          else {
            url += condition + keys[i] + " = '" + data_arr[0][keys[i]] + "'"
          }
        }
      }
      // console.log("############filter url",url);
      console.log('Making API call to: ', url)

      var token = await this.getToken();
      // console.log("token",token);
      var requestObj = await this.getRequestObj (url,token)
      // console.log("requestObj",requestObj);
      // Make API call
      var result = await this.make_api_call (requestObj)

      return new Promise(async function(resolve, reject) {
        // console.log("@@@@@@@@@@@inside get invoice method");
        // console.log("result",result);
        var jsondata = JSON.parse(result.body);
        var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
        console.log("Length of Invoice",len);
        var arr = [];
        for (var i=0; i<len; i++) {
          var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[i], null, 2);
          arr.push(JSON.parse(data1));
        }
        resolve(arr);
      })
    }
    // async getInvoiceByName(value,self) {
    //   return new Promise(async function(resolve, reject) {
    //     console.log("@@@@@@@@@@@inside get invoice by name");
    //     var token = await self.getToken();
    //     // console.log("token",token);
    //
    //     var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + "/query?query=select * from Invoice WHERE CustomerRef = '" + value + "'"
    //     console.log('Making API call to: ' + url)
    //
    //     var requestObj = await self.getRequestObj (url, token)
    //
    //     var result = await self.make_api_call (requestObj)
    //
    //     var jsondata = JSON.parse(result.body);
    //     var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
    //     console.log("Length of Invoice",len);
    //     var arr = [];
    //     for (var i=0; i<len; i++) {
    //       var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[i], null, 2);
    //       arr.push(JSON.parse(data1));
    //     }
    //     resolve(arr);
    //   })
    // }
}

module.exports = function(options) {
    return new QB1(options);
};
