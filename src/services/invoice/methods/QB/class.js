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

    //to count days in one month
    daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
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
        if (keys[i] == 'domain' || keys[i] == 'chart') {

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

    async invoiceStatistics(data) {
      var token = await this.getToken();
      var date1 = moment(data.date1,'YYYY-MM-DD')
      var date2 = moment(data.date2,'YYYY-MM-DD')
      var month_len = (date2.diff(date1, 'month')) + 1;
      console.log("mnth_length",month_len);

      var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      var amt_data = [
        {
          name : "Paid Amount",
          data : [ ]
        },
        {
          name : "Unpaid Amount",
          data : [ ]
        },
        {
          name : "Draft Amount",
          data : [ ]
        }
      ];

      for (var i=month_len-1; i >= 0; i--) {
        console.log('value of i',i);
        var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/query?query=select * from Invoice'
        var invoice_arr = [];
        if ( i == (month_len-1)) {
          var mnth = moment(date2).format('MM')
          var year = moment(date2).format('YYYY')
          var dategt = year+'-'+ mnth + '-01'
          var datelt = moment(date2).format('YYYY-MM-DD')
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)
          // console.log("requestObj",requestObj);
          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          var arr = [];
          for (var j=0; j<len; j++) {
            var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
            arr.push(JSON.parse(data1));
          }
          invoice_arr.push(arr);
        }
        else if (i == 0) {
          var mnth = moment(date1).format('MM')
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = moment(date1).format('YYYY-MM-DD')
          datelt = year+'-'+ mnth + '-' + day
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)

          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          var arr = [];
          for (var j=0; j<len; j++) {
            var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
            arr.push(JSON.parse(data1));
          }
          invoice_arr.push(arr);
        }
        else {
          var mnth = (parseInt(moment(date1).format('MM')) + i)
          if (mnth < 10) {
            mnth = moment({month:mnth-1}).format('MM')
          }
          console.log("mnth",mnth);
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = year+'-'+ mnth + '-01'
          datelt = year+'-'+ mnth + '-' + day
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)

          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          var arr = [];
          for (var j=0; j<len; j++) {
            var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
            arr.push(JSON.parse(data1));
          }
          invoice_arr.push(arr);
        }

        var draft_amt = 0;
        var authorize_amt = 0;
        var paid_amt = 0;
        // console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
        invoice_arr.forEach(function(invoice) {
          invoice.forEach(function(inv) {
            if (inv.Balance == 0) {
              paid_amt += inv.TotalAmt;
            }
            else if (inv.Balance > 0) {
              authorize_amt += inv.TotalAmt;
            }
            else {
              draft_amt += inv.TotalAmt;
            }
          })
        })
        // console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
        var amt = [paid_amt, authorize_amt, draft_amt]
        for (var k=0; k<3; k++) {
          amt_data[k].data.push({"label" : mnth_name +'-2017', y : amt[k]})
        }
      }
      return(amt_data);
    }

    async invoiceStatisticsPieData(data) {
      var token = await this.getToken();
      var date1 = moment(data.date1).format('YYYY-MM-DD')
      var date2 = moment(data.date2).format('YYYY-MM-DD')

      var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/query?query=select * from Invoice'

      var paid_amt = 0;
      var unpaid_amt = 0;
      var draft_amt= 0;
      var arr_invoice;
      url += " WHERE TxnDate >= '" + date1 + "' AND" + " TxnDate <= '" + date2 + "'"

      console.log('Making API call to: ' + url)

      var requestObj = await this.getRequestObj (url, token)
      // console.log("requestObj",requestObj);
      var result = await this.make_api_call (requestObj)
      var jsondata = JSON.parse(result.body);
      var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
      console.log("Length of Invoice",len);
      var arr = [];
      for (var j=0; j<len; j++) {
        var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
        arr.push(JSON.parse(data1));
      }
      arr.forEach(function(invoice) {
        // console.log("@@@@@#############invoice",invoice);
        if (invoice.Balance == 0) {
          paid_amt += invoice.TotalAmt;
        }
        else if (invoice.Balance > 0) {
          unpaid_amt += invoice.TotalAmt;
        }
        else {
          draft_amt += invoice.TotalAmt;
        }
      });
      var pie_data = [
        {name: "Paid Amount", value: paid_amt},
        {name: "Unpaid Amount", value: unpaid_amt},
        {name: "Draft Amount", value: draft_amt}
      ];
      return(pie_data);
    }

    async invoiceStatisticsCashflow(data) {
      var token = await this.getToken();
      var date1 = moment(data.date1,'YYYY-MM-DD')
      var date2 = moment(data.date2,'YYYY-MM-DD')
      var month_len = (date2.diff(date1, 'month')) + 1;
      console.log("mnth_length",month_len);

      var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      var cashflow_arr = [];
      for (var i=month_len-1; i >= 0; i--) {
        console.log('value of i',i);
        var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/query?query=select * from Invoice'
        var invoice_arr = [];
        if ( i == (month_len-1)) {
          var mnth = moment(date2).format('MM')
          var year = moment(date2).format('YYYY')
          var dategt = year+'-'+ mnth + '-01'
          var datelt = moment(date2).format('YYYY-MM-DD')
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)
          // console.log("requestObj",requestObj);
          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          var arr = [];
          for (var j=0; j<len; j++) {
            var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
            arr.push(JSON.parse(data1));
          }
          invoice_arr.push(arr);
        }
        else if (i == 0) {
          var mnth = moment(date1).format('MM')
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = moment(date1).format('YYYY-MM-DD')
          datelt = year+'-'+ mnth + '-' + day
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)

          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          var arr = [];
          for (var j=0; j<len; j++) {
            var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
            arr.push(JSON.parse(data1));
          }
          invoice_arr.push(arr);
        }
        else {
          var mnth = (parseInt(moment(date1).format('MM')) + i)
          if (mnth < 10) {
            mnth = moment({month:mnth-1}).format('MM')
          }
          console.log("mnth",mnth);
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = year+'-'+ mnth + '-01'
          datelt = year+'-'+ mnth + '-' + day
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)

          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          var arr = [];
          for (var j=0; j<len; j++) {
            var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
            arr.push(JSON.parse(data1));
          }
          invoice_arr.push(arr);
        }

        var status_amt = 0;
        invoice_arr.forEach(function(invoice) {
          invoice.forEach(function(inv) {
            if (data.status) {
              if ((data.status == 'Paid') && (inv.Balance == 0)) {
                status_amt += inv.TotalAmt
              }
              if ((data.status == 'Unpaid') && (inv.Balance > 0)) {
                status_amt += inv.TotalAmt
              }
            }
            else {
              status_amt += inv.TotalAmt
            }
          })
          cashflow_arr.push({"label":mnth_name, "y" : status_amt})
        })
      }
      return(cashflow_arr);
    }

    async invoiceStats(data) {
      var token = await this.getToken();
      var date1 = moment(data.date1).format('YYYY-MM-DD')
      var date2 = moment(data.date2).format('YYYY-MM-DD')

      var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/query?query=select * from Invoice'

      var paid_amt = 0;
      var unpaid_amt = 0;
      var draft_amt= 0;
      var total_amt = 0;
      var arr_invoice;
      var arr_block;
      url += " WHERE TxnDate >= '" + date1 + "' AND" + " TxnDate <= '" + date2 + "'"

      console.log('Making API call to: ' + url)

      var requestObj = await this.getRequestObj (url, token)
      // console.log("requestObj",requestObj);
      var result = await this.make_api_call (requestObj)
      var jsondata = JSON.parse(result.body);
      var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
      console.log("Length of Invoice",len);
      var arr = [];
      for (var j=0; j<len; j++) {
        var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
        arr.push(JSON.parse(data1));
      }
      arr.forEach(function(invoice) {
        // console.log("@@@@@#############invoice",invoice);
        if (invoice.Balance == 0) {
          paid_amt += invoice.TotalAmt;
        }
        else if (invoice.Balance > 0) {
          unpaid_amt += invoice.TotalAmt;
        }
        else {
          draft_amt += invoice.TotalAmt;
        }
      });
      total_amt = unpaid_amt + draft_amt + paid_amt;
      arr_block = [
        {name: "Total Amount", value: total_amt},
        {name: "Paid Amount", value: paid_amt},
        {name:"Unpaid Amount", value: unpaid_amt},
        {name: "Draft Amount", value: draft_amt}
      ];
      return(arr_block);
    }
}

module.exports = function(options) {
    return new QB1(options);
};
