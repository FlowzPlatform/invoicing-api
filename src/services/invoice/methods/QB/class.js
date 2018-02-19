var moment = require('moment');

//For quickbook
var TokenProvider = require('refresh-token');
var request = require('request')

let api_uri= "https://sandbox-quickbooks.api.intuit.com/v3/company/";
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

    setup(app){
      this.app = app;
    }

    /**
     * do direct charge
     * @param {*} data
     */

    //Qb functions
    getToken(config) {
      console.log("inside get token");
      var tokenProvider = new TokenProvider(token_uri, {
        refresh_token: config.refresh_token,
        client_id:     config.client_id,
        client_secret: config.client_secret
      });
      console.log("tokenProvider",tokenProvider);
      return new Promise(function(resolve, reject) {
        tokenProvider.getToken(function (err, newToken) {
          console.log("Token######",newToken);
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
            resolve(err);
        })
      })
    }

    //to count days in one month
    daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    }

    // async getAllInvoice(config,data) {
    //   return new Promise(async function(resolve, reject) {
    //     // console.log("@@@@@@@@@@@inside get invoice method");
    //     var token = await this.getToken();
    //     // console.log("token",token);
    //
    //     var url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/query?query=select * from Invoice'
    //     console.log('Making API call to: ' + url)
    //
    //     var requestObj = await this.getRequestObj (url, token)
    //
    //     var result = await this.make_api_call (requestObj)
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

    async getInvoiceById(config,id) {
      var token = await this.getToken(config);
      // console.log("token",token);

      var url = api_uri + config.realmId + "/query?query=select * from Invoice where Id='" + id + "'"
      console.log('Making API call to: ' + url)

      var requestObj = await this.getRequestObj (url, token)

      var result = await this.make_api_call (requestObj)

      return new Promise(async function(resolve, reject) {
        console.log("@@@@@@@@@@@inside get invoice by id",id);

        var jsondata = JSON.parse(result.body);
        if (jsondata.QueryResponse == undefined) {
          if (jsondata.fault) {
              resolve(jsondata.fault.error[0].message)
          }
          if (jsondata.Fault) {
              resolve(jsondata.Fault.Error[0].Message)
          }
        }
        else {
          var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          var arr = [];
          for (var i=0; i<len; i++) {
            var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[i], null, 2);
            arr.push(JSON.parse(data1));
          }
          resolve(arr);
        }
      })
    }

    async getItemValue(itemName, itemUrl, token, config) {
      let itemRequestObj = await this.getRequestObj (itemUrl, token)
      let itemResult = await this.make_api_call (itemRequestObj)
      let itemJsondata = await JSON.parse(itemResult.body);
      // console.log("reponse.........", itemJsondata.QueryResponse)
      // console.log(" itemJsondata.QueryResponse.........", Object.keys(itemJsondata.QueryResponse).length)
      let itemValue;
      if (Object.keys(itemJsondata.QueryResponse).length == 0) {
        itemUrl = api_uri + config.realmId + "/item";
        console.log('Making API call to: ' + itemUrl);
        let body = JSON.stringify({
          "Name": itemName,
          "IncomeAccountRef": {
            "value": "79",
            "name": "Sales of Product Income"
          },
          "ExpenseAccountRef": {
            "value": "80",
            "name": "Cost of Goods Sold"
          },
          "AssetAccountRef": {
            "value": "81",
            "name": "Inventory Asset"
          },
          "Type": "Service",
          "TrackQtyOnHand": true,
          "QtyOnHand": 10,
          "InvStartDate": "2015-01-01"
        });
        itemRequestObj = await this.postRequestObj (itemUrl, body, token);
        itemResult = await this.make_api_call (itemRequestObj)
        itemJsondata = await JSON.parse(itemResult.body);
        // console.log("________________________________________>>>>>item post response",itemJsondata)
        if (itemJsondata.Fault) {
          
        }
        else {
          itemValue = itemJsondata.Item.Id;
        }
      }
      else {
        itemValue = itemJsondata.QueryResponse.Item[0].Id;
      }
      return itemValue;
  }

  async createInvoice(config,data,contactResponse) {
    let arr;
    var token = await this.getToken(config);
    var value = contactResponse.data[0].Id;             //customer ref value
    console.log("customer value",value);

    let line = [];
    let itemUrl;
    let itemRequestObj;
    let itemResult;
    var itemJsondata;
    let itemValue;
    // let self = this;
    // data.products.forEach(async function(product) {
    for (let [i, product] of data.products.entries()) {
      let desc = {
        description : product.description,
        title : product.title,
        sku : product.sku,
        additional_charges : product.additional_charges,
        shipping_charges : product.shipping_charges,
        tax : product.tax
      };
      let amount = (product.qty) * (product.amount); 
      console.log("@@@@@@@@@@@@@@@@@amount",amount)

      //----------------to get all item in qb
      itemUrl = api_uri + config.realmId + "/query?query=select * from Item where Name = '"+ product.title +"'";
      console.log('Making API call to: ' + itemUrl);
      itemValue = await this.getItemValue(product.title, itemUrl, token,config)
      console.log("itemValue",itemValue)
      ////////////////////////////////////////

      var lineData = {
        "Amount" : amount,
        "Description" : JSON.stringify(desc),
        "DetailType": "SalesItemLineDetail",
        "SalesItemLineDetail": {
          // "ItemRef": {
          //   "value": "2",
          //   "name": "Services"
          // },
          "ItemRef": {
            "value": itemValue
          },
          "UnitPrice" : product.amount,
          "Qty" : product.qty
        }
      };
      line.push(lineData);

      if (product.additional_charges) {
        itemUrl = api_uri + config.realmId + "/query?query=select * from Item where Name = '"+ product.title +"_additional_charges'";
        console.log('Making API call to: ' + itemUrl);
        itemValue = await this.getItemValue(product.title+"_additional_charges", itemUrl, token,config)
        console.log("itemValue",itemValue)
        amount = 1 * product.additional_charges;
        var lineData = {
          "Amount" : amount,
          "Description" : "additional_charges",
          "DetailType": "SalesItemLineDetail",
          "SalesItemLineDetail": {
            "ItemRef": {
              "value": itemValue
            },
            "UnitPrice" : product.additional_charges,
            "Qty" : "1"
          }
        };
        line.push(lineData);
      }

      if (product.shipping_charges) {
        itemUrl = api_uri + config.realmId + "/query?query=select * from Item where Name = '"+ product.title +"_shipping_charges'";
        console.log('Making API call to: ' + itemUrl);
        itemValue = await this.getItemValue(product.title+"_shipping_charges", itemUrl, token, config)
        console.log("itemValue",itemValue)
        amount = 1 * product.shipping_charges;
        var lineData = {
          "Amount" : amount,
          "Description" : "shipping_charges",
          "DetailType": "SalesItemLineDetail",
          "SalesItemLineDetail": {
            "ItemRef": {
              "value": itemValue
            },
            "UnitPrice" : product.shipping_charges,
            "Qty" : "1"
          }
        };
        line.push(lineData);
      }
    }

    var ref = {
        "value": value,
    };

    var body = JSON.stringify({'Line': line, 'CustomerRef':ref});
    console.log("body",body);
    var url = api_uri + config.realmId + '/invoice'
    console.log('Making API call to: ' + url)
    var postrequestObj = await this.postRequestObj (url, body, token)
    var result = await this.make_api_call (postrequestObj)
    var jsondata = JSON.parse(result.body);
    console.log("QB Invoice post response",jsondata);
    if (jsondata.QueryResponse == undefined) {
      // return(jsondata.fault.error[0].message);
      return(jsondata);
    }
    else {
      // var data1 = JSON.stringify(jsondata.Invoice, null, 2);
      // arr = JSON.parse(data1);
      // return arr;

      arr = jsondata.Invoice;
      return arr;
    }
    // return itemJsondata;
  }

    async getInvoicesByFilter(config,data) {
      var token = await this.getToken(config);
      let data_arr = [];
      let condition = '';
      data_arr.push(data);
      let keys = Object.keys(data_arr[0]);
      let url = api_uri + config.realmId + "/query?query=select * from Invoice "
      let requestObj;
      let result;
      for (let i = 0; i < keys.length; i++) {
        if ( i == 1) {
          condition = 'WHERE '
        }
        else {
          // console.log("inside key else ");
          condition = ' && '
        }
        if (keys[i] == 'chart' || keys[i] == 'stats' || keys[i] == 'settingId') {

        }
        else {
          if (keys[i].slice(0,3) == 'min') {
            url += condition + keys[i].slice(3,keys[i].length) + " >='" + data_arr[0][keys[i]] + "'"
          }
          else if (keys[i].slice(0,3) == 'max') {
            url += condition + keys[i].slice(3,keys[i].length) + " <='" + data_arr[0][keys[i]] + "'"
          }
          else if (keys[i] == 'Name') {
            let contactUrl = api_uri + config.realmId + "/query?query=select * from Customer where DisplayName = '" + data_arr[0][keys[i]] + "'"
            let customerRefValue;
            requestObj = await this.getRequestObj (contactUrl , token)
            result = await this.make_api_call (requestObj)
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
                        customerRefValue = data1.Id;
                    }
                    // console.log("Customer Get Data",arrcustomer[0]);
                }
            })
            url += condition + " CustomerRef = '" + customerRefValue + "'"
          }
          else {
            url += condition + keys[i] + " = '" + data_arr[0][keys[i]] + "'"
          }
        }
      }
      // console.log("############filter url",url);
      console.log('Making API call to: ', url)
      // console.log("@@@@@@@@@2token",token);
      requestObj = await this.getRequestObj (url,token)
      // console.log("requestObj",requestObj);
      // Make API call
      result = await this.make_api_call (requestObj)

      return new Promise(async function(resolve, reject) {
        // console.log("@@@@@@@@@@@inside get invoice method");
        // console.log("result",result.body);
        var jsondata = JSON.parse(result.body);
        // console.log("")
        if (jsondata.QueryResponse == undefined) {
          if (jsondata.fault) {
              resolve(jsondata.fault.error[0].message)
          }
          if (jsondata.Fault) {
              resolve(jsondata.Fault)
          }
        }
        else {
          var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          var arr = [];
          for (var i=0; i<len; i++) {
            var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[i], null, 2);
            arr.push(JSON.parse(data1));
          }
          resolve(arr);
        }
      })
    }

    async invoiceStatistics(config,data) {
      var token = await this.getToken(config);
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

      for (var i=0; i <= month_len-1; i++) {
        console.log('value of i',i);
        var url = api_uri + config.realmId + '/query?query=select * from Invoice'
        var invoice_arr = [];
        if ( i == (month_len-1)) {
          var mnth = moment(date2).format('MM')
          var year = moment(date2).format('YYYY')
          var dategt = year+'-'+ mnth + '-01'
          var datelt = moment(date2).format('YYYY-MM-DD')
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          if (data.contact) {
            url += " AND CustomerRef = '" + data.contact + "'"
          }
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)
          // console.log("requestObj",requestObj);
          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          if (jsondata.QueryResponse == undefined) {

          }
          else {
            var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
            console.log("Length of Invoice",len);
            var arr = [];
            for (var j=0; j<len; j++) {
              var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
              arr.push(JSON.parse(data1));
            }
            invoice_arr.push(arr);
          }
        }
        else if (i == 0) {
          var mnth = moment(date1).format('MM')
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = moment(date1).format('YYYY-MM-DD')
          datelt = year+'-'+ mnth + '-' + day
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          if (data.contact) {
            url += " AND CustomerRef = '" + data.contact + "'"
          }
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)

          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          if (jsondata.QueryResponse == undefined) {

          }
          else {
            var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
            console.log("Length of Invoice",len);
            var arr = [];
            for (var j=0; j<len; j++) {
              var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
              arr.push(JSON.parse(data1));
            }
            invoice_arr.push(arr);
          }
        }
        else {
          var mnth = (parseInt(moment(date1).format('MM')) + i)
          var year = moment(date1).format('YYYY')
          if (mnth > 12) {
            if ((mnth % 12 != 0)) {
              mnth = mnth % 12
              year = parseInt(moment(date1).format('YYYY')) + 1
            }
            else {
              mnth = 12
            }
          }
          if (mnth < 10) {
            mnth = moment({month:mnth-1}).format('MM')
          }
          console.log("mnth",mnth);
          var day = this.daysInMonth(mnth, year)
          dategt = year+'-'+ mnth + '-01'
          datelt = year+'-'+ mnth + '-' + day
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          if (data.contact) {
            url += " AND CustomerRef = '" + data.contact + "'"
          }
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)

          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          if (jsondata.QueryResponse == undefined) {

          }
          else {
            var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
            console.log("Length of Invoice",len);
            var arr = [];
            for (var j=0; j<len; j++) {
              var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
              arr.push(JSON.parse(data1));
            }
            invoice_arr.push(arr);
          }
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
          amt_data[k].data.push({"label" : mnth_name+year, y : amt[k]})
        }
      }
      return(amt_data);
    }

    async invoiceStatisticsPieData(config,data) {
      var token = await this.getToken(config);
      var date1 = moment(data.date1).format('YYYY-MM-DD')
      var date2 = moment(data.date2).format('YYYY-MM-DD')

      var url = api_uri + config.realmId + '/query?query=select * from Invoice'

      var paid_amt = 0;
      var unpaid_amt = 0;
      var draft_amt= 0;
      var arr_invoice;
      url += " WHERE TxnDate >= '" + date1 + "' AND" + " TxnDate <= '" + date2 + "'"
      if (data.contact) {
        url += " AND CustomerRef = '" + data.contact + "'"
      }
      console.log('Making API call to: ' + url)

      var requestObj = await this.getRequestObj (url, token)
      // console.log("requestObj",requestObj);
      var result = await this.make_api_call (requestObj)
      var jsondata = JSON.parse(result.body);
      if (jsondata.QueryResponse == undefined) {

      }
      else {
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
    }

    async invoiceStatisticsCashflow(config,data) {
      var token = await this.getToken(config);
      var date1 = moment(data.date1,'YYYY-MM-DD')
      var date2 = moment(data.date2,'YYYY-MM-DD')
      var month_len = (date2.diff(date1, 'month')) + 1;
      console.log("mnth_length",month_len);

      var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      var cashflow_arr = [];
      for (var i=0; i <= month_len-1; i++) {
        console.log('value of i',i);
        var url = api_uri + config.realmId + '/query?query=select * from Invoice'
        var invoice_arr = [];
        if ( i == (month_len-1)) {
          var mnth = moment(date2).format('MM')
          var year = moment(date2).format('YYYY')
          var dategt = year+'-'+ mnth + '-01'
          var datelt = moment(date2).format('YYYY-MM-DD')
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          if (data.contact) {
            url += " AND CustomerRef = '" + data.contact + "'"
          }
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)
          // console.log("requestObj",requestObj);
          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          if (jsondata.QueryResponse == undefined) {

          }
          else {
            var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
            console.log("Length of Invoice",len);
            var arr = [];
            for (var j=0; j<len; j++) {
              var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
              arr.push(JSON.parse(data1));
            }
            invoice_arr.push(arr);
          }
        }
        else if (i == 0) {
          var mnth = moment(date1).format('MM')
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = moment(date1).format('YYYY-MM-DD')
          datelt = year+'-'+ mnth + '-' + day
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          if (data.contact) {
            url += " AND CustomerRef = '" + data.contact + "'"
          }
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)

          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          if (jsondata.QueryResponse == undefined) {

          }
          else {
            var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
            console.log("Length of Invoice",len);
            var arr = [];
            for (var j=0; j<len; j++) {
              var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
              arr.push(JSON.parse(data1));
            }
            invoice_arr.push(arr);
          }
        }
        else {
          var mnth = (parseInt(moment(date1).format('MM')) + i)
          var year = moment(date1).format('YYYY')
          if (mnth > 12) {
            if ((mnth % 12 != 0)) {
              mnth = mnth % 12
              year = parseInt(moment(date1).format('YYYY')) + 1
            }
            else {
              mnth = 12
            }
          }
          if (mnth < 10) {
            mnth = moment({month:mnth-1}).format('MM')
          }
          console.log("mnth",mnth);
          var day = this.daysInMonth(mnth, year)
          dategt = year+'-'+ mnth + '-01'
          datelt = year+'-'+ mnth + '-' + day
          var mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          if (data.contact) {
            url += " AND CustomerRef = '" + data.contact + "'"
          }
          console.log('Making API call to: ' + url)

          var requestObj = await this.getRequestObj (url, token)

          var result = await this.make_api_call (requestObj)
          var jsondata = JSON.parse(result.body);
          if (jsondata.QueryResponse == undefined) {

          }
          else {
            var len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
            console.log("Length of Invoice",len);
            var arr = [];
            for (var j=0; j<len; j++) {
              var data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
              arr.push(JSON.parse(data1));
            }
            invoice_arr.push(arr);
          }
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

    async invoiceStats(config,data) {
      var token = await this.getToken(config);
      var date1 = moment(data.date1).format('YYYY-MM-DD')
      var date2 = moment(data.date2).format('YYYY-MM-DD')

      var url = api_uri + config.realmId + '/query?query=select * from Invoice'

      var paid_amt = 0;
      var unpaid_amt = 0;
      var draft_amt= 0;
      var total_amt = 0;
      var arr_invoice;
      var arr_block;
      var total_invoice = 0;
      url += " WHERE TxnDate >= '" + date1 + "' AND" + " TxnDate <= '" + date2 + "'"
      if (data.contact) {
        url += " AND CustomerRef = '" + data.contact + "'"
      }
      console.log('Making API call to: ' + url)

      var requestObj = await this.getRequestObj (url, token)
      // console.log("requestObj",requestObj);
      var result = await this.make_api_call (requestObj)
      var jsondata = JSON.parse(result.body);
      if (jsondata.QueryResponse == undefined) {

      }
      else {
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
          total_invoice += 1;
        });
        total_amt = unpaid_amt + draft_amt + paid_amt;
        arr_block = [
          {name: "Total Amount", value: total_amt},
          {name: "Paid Amount", value: paid_amt},
          {name:"Unpaid Amount", value: unpaid_amt},
          {name: "Draft Amount", value: draft_amt},
          {name: "Total Invoice", value: total_invoice}
        ];
        return(arr_block);
      }
    }
}

module.exports = function(options) {
    return new QB1(options);
};
