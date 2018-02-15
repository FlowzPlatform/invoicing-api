let moment = require('moment');

//For quickbook
let TokenProvider = require('refresh-token');
let request = require('request')
let api_uri="https://sandbox-quickbooks.api.intuit.com/v3/company/";
let token_uri = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

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
        let tokenProvider = new TokenProvider(token_uri, {
            refresh_token: config.refresh_token,
            client_id:     config.client_id,
            client_secret: config.client_secret
        });
        console.log("tokenProvider",tokenProvider);
        return new Promise(function(resolve, reject) {
            tokenProvider.getToken(function (err, newToken) {
                if (newToken == undefined) {
                    reject(err)
                }
                else {
                    resolve(newToken)
                }
            });
        })
    }

    getRequestObj(url, token) {
      let getReqObj = {
        url: url,
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        }
      };
      // console.log("requestObj",getReqObj);
      return getReqObj;
    }

    postRequestObj(url, body, token) {
      let postReqObj = {
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
            resolve(err);
        })
      })
    }

    async getAllContacts(config,data) {
        let token = await this.getToken(config);
        let arrcustomer = [];
        let url = api_uri + config.realmId + "/query?query=select * from Customer "
        // if (data.Name || data.EmailAddress) {
        //     url += "Where"
        // }
       

        if(data.Name && data.EmailAddress ){
            url += "Where PrimaryEmailAddr = '" + data.EmailAddress + "'"
        }else if (data.EmailAddress) {
            url += "Where PrimaryEmailAddr = '" + data.EmailAddress + "'"
        }else if (data.Name) {
            url += "Where DisplayName = '" + data.Name + "'"
        }else{
            
        }
        console.log('Making API call to: ' + url)
    
        let requestObj = await this.getRequestObj (url , token)
        let result = await this.make_api_call (requestObj)
        return new Promise(async function(resolve, reject) {
            // console.log("@@@@@@@@@@@inside get invoice method");
            let jsondata = JSON.parse(result.body);
            // console.log("@@@@@@@@@@@@@@@@@@@@@jsondata",jsondata);
            if (jsondata.QueryResponse == undefined) {
                // console.log("error in get contact",jsondata.fault.error[0])
                if (jsondata.fault) {
                    resolve(jsondata.fault.error[0].message)
                }
                if (jsondata.Fault) {
                    resolve(jsondata.Fault.Error[0].Message)
                }
            }
            else {
                let len = JSON.stringify(jsondata.QueryResponse.maxResults, null, 2);
                console.log("Length of Customer",len);
                
                for (let i=0; i<len; i++) {
                    let data1 =jsondata.QueryResponse.Customer[i];
                    arrcustomer.push(data1);
                }
                // console.log("Customer Get Data",arrcustomer[0]);
                resolve (arrcustomer);
            }
        })
    }

    async createContact(config,data) { 
      let token = await this.getToken(config);

      let url = api_uri + config.realmId + '/customer'
      console.log('Making API call to: ' + url)

      let body = JSON.stringify({
            'BillAddr': {
              'Line1': data.AddressLine1,
              'City': data.City,
              'Country': data.Country,
              'PostalCode': data.PostalCode
            },
            // 'CompanyName': data.CompanyName,
            'DisplayName': data.Name,
            'PrimaryPhone': {
              'FreeFormNumber': data.PhoneNumber
            },
            'PrimaryEmailAddr': {
              'Address': data.EmailAddress
            }
          });
      
      let postrequestObj = await this.postRequestObj (url,body, token)
      let result = await this.make_api_call (postrequestObj)
      let jsondata = JSON.parse(result.body);
      if (jsondata.Customer) {
        // console.log("####################### result in post contact QB",(JSON.parse(result.body)).Customer)
        let resp = [];
        resp.push((JSON.parse(result.body)).Customer);
        return resp;
      }
      else {
          if (jsondata.fault) {
            // console.log("####################### result in post contact QB@@@@@@@@@@@@@",jsondata.fault.error[0].message)
            return(jsondata.fault.error[0].message);
          }
          if (jsondata.Fault) {
            // console.log("####################### result in post contact QB@@@@@@@@@@@@@",jsondata.Fault.Error[0].Message)
            return(jsondata.Fault.Error[0].Message);
          }

      }
    }
}

module.exports = function(options) {
    return new QB1(options);
};