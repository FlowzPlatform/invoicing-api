let moment = require('moment');
const accounting = require('accounting-js');
//For quickbook
let TokenProvider = require('refresh-token');
let request = require('request')

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
      let tokenProvider = new TokenProvider(token_uri, {
        refresh_token: config.refresh_token,
        client_id:     config.client_id,
        client_secret: config.client_secret
      });
      // console.log("tokenProvider",tokenProvider);
      return new Promise(function(resolve, reject) {
        tokenProvider.getToken(function (err, newToken) {
          // console.log("Token######",newToken);
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
      }
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

    //to count days in one month
    daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    }

    // async getAllInvoice(config,data) {
    //   return new Promise(async function(resolve, reject) {
    //     // console.log("@@@@@@@@@@@inside get invoice method");
    //     let token = await this.getToken();
    //     // console.log("token",token);
    //
    //     let url = config.qbcredentials.api_uri + config.qbcredentials.realmId + '/query?query=select * from Invoice'
    //     console.log('Making API call to: ' + url)
    //
    //     let requestObj = await this.getRequestObj (url, token)
    //
    //     let result = await this.make_api_call (requestObj)
    //
    //     let jsondata = JSON.parse(result.body);
    //     let len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
    //     console.log("Length of Invoice",len);
    //     let arr = [];
    //     for (let i=0; i<len; i++) {
    //       let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[i], null, 2);
    //       arr.push(JSON.parse(data1));
    //     }
    //     resolve(arr);
    //   })
    // }

    async getInvoiceById(config,id) {
      let token = await this.getToken(config);
      // console.log("token",token);

      let url = api_uri + config.realmId + "/query?query=select * from Invoice where Id='" + id + "'"
      console.log('Making API call to: ' + url)

      let requestObj = await this.getRequestObj (url, token)

      let result = await this.make_api_call (requestObj)

      return new Promise(async function(resolve, reject) {
        console.log("@@@@@@@@@@@inside get invoice by id",id);

        let jsondata = JSON.parse(result.body);
        if (jsondata.QueryResponse == undefined) {
          if (jsondata.fault) {
              resolve(jsondata.fault.error[0].message)
          }
          if (jsondata.Fault) {
              resolve(jsondata.Fault.Error[0].Message)
          }
        }
        else {
          let len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          let arr = [];
          for (let i=0; i<len; i++) {
            let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[i], null, 2);
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
        console.log('Making API call to: ', itemUrl);
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
    let token = await this.getToken(config);
    let value = contactResponse.data[0].Id;             //customer ref value
    console.log("customer value",value);
    
    let arr,
      line = [],
      itemUrl,
      itemRequestObj,
      itemResult,
      itemJsondata,
      itemValue;
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

      let lineData = {
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
        let lineData = {
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
        let lineData = {
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

    let ref = {
        "value": value,
    };

    let body = JSON.stringify({'Line': line, 'CustomerRef':ref});
    console.log("body",body);
    let url = api_uri + config.realmId + '/invoice'
    console.log('Making API call to: ' + url)
    let postrequestObj = await this.postRequestObj (url, body, token)
    let result = await this.make_api_call (postrequestObj)
    let jsondata = JSON.parse(result.body);
    console.log("QB Invoice post response",jsondata);
    if (jsondata.QueryResponse == undefined) {
      // return(jsondata.fault.error[0].message);
      return(jsondata);
    }
    else {
      // let data1 = JSON.stringify(jsondata.Invoice, null, 2);
      // arr = JSON.parse(data1);
      // return arr;

      arr = jsondata.Invoice;
      return arr;
    }
    // return itemJsondata;
  }

    async getInvoicesByFilter(config,data) {
      let token = await this.getToken(config);
      let data_arr = [],
          condition = '';
      data_arr.push(data);
      let keys = Object.keys(data_arr[0]);
      let url = api_uri + config.realmId + "/query?query=select * from Invoice "
      let requestObj,
          result;
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
        let jsondata = JSON.parse(result.body);
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
          let len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
          console.log("Length of Invoice",len);
          let arr = [];
          for (let i=0; i<len; i++) {
            let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[i], null, 2);
            arr.push(JSON.parse(data1));
          }
          resolve(arr);
        }
      })
    }

    async calculateAmount(invoice_arr) {
        let draft_amt = 0,
          	authorize_amt = 0,
          	paid_amt = 0;
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
        let amt = [paid_amt, authorize_amt, draft_amt]
        return(amt);
    }
    
    async invoiceStatistics(config,data) {
      let token = await this.getToken(config);
      let date1 = moment(data.date1,'YYYY-MM-DD')
      let date2 = moment(data.date2,'YYYY-MM-DD')
      let month_len = (date2.diff(date1, 'month')) + 1;
      console.log("mnth_length",month_len);

      let monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      let amt_data = [
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
	  
	  let amt,
		  mnth,
		  year,
		  day,
		  dategt,
		  datelt,
		  mnth_name,
		  requestObj,
		  result,
		  jsondata,
		  len,
		  arr,
		  url = '',
		  invoice_arr = [];

      if ((month_len - 1) === 0) {
        let mnth1 = moment(date1).format('MM')
        let mnth2 = moment(date2).format('MM')
        if (mnth1 === mnth2) {
          invoice_arr = [];
          url = api_uri + config.realmId + '/query?query=select * from Invoice'
          mnth = moment(date1).format('MM')
          year = moment(date1).format('YYYY')
          dategt = moment(date1).format('YYYY-MM-DD')
          datelt = moment(date2).format('YYYY-MM-DD')
          mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          if (data.contact) {
            url += " AND CustomerRef = '" + data.contact + "'"
          }
          console.log('Making API call to: ' + url)

          requestObj = await this.getRequestObj (url, token)

          result = await this.make_api_call (requestObj)
          jsondata = JSON.parse(result.body);
          if (jsondata.QueryResponse == undefined) {

          }
          else {
            len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
            console.log("Length of Invoice",len);
            arr = [];
            for (let j=0; j<len; j++) {
              let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
              arr.push(JSON.parse(data1));
            }
            invoice_arr.push(arr);
            amt = await this.calculateAmount(invoice_arr);
            for (let k=0; k<3; k++) {
              amt_data[k].data.push({"label" : mnth_name+year, y : amt[k]})
            }
          }
        }
        else {
          invoice_arr = [];
          url = api_uri + config.realmId + '/query?query=select * from Invoice'
          mnth = moment(date1).format('MM')
          year = moment(date1).format('YYYY')
          day = this.daysInMonth(mnth, year)
          dategt = moment(date1).format('YYYY-MM-DD')
          datelt = year+'-'+ mnth + '-' + day
          mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          if (data.contact) {
            url += " AND CustomerRef = '" + data.contact + "'"
          }
          console.log('Making API call to: ' + url)

          requestObj = await this.getRequestObj (url, token)

          result = await this.make_api_call (requestObj)
          jsondata = JSON.parse(result.body);
          if (jsondata.QueryResponse == undefined) {

          }
          else {
            len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
            console.log("Length of Invoice",len);
            arr = [];
            for (let j=0; j<len; j++) {
              let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
              arr.push(JSON.parse(data1));
            }
            invoice_arr.push(arr);
            amt = await this.calculateAmount(invoice_arr);
            for (let k=0; k<3; k++) {
              amt_data[k].data.push({"label" : mnth_name+year, y : amt[k]})
            }
          }

          invoice_arr = [];
          url = api_uri + config.realmId + '/query?query=select * from Invoice'
          mnth = moment(date2).format('MM')
          year = moment(date2).format('YYYY')
          dategt = year+'-'+ mnth + '-01'
          datelt = moment(date2).format('YYYY-MM-DD')
          mnth_name =  monthNames[mnth - 1];
          url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
          if (data.contact) {
            url += " AND CustomerRef = '" + data.contact + "'"
          }
          console.log('Making API call to: ' + url)

          requestObj = await this.getRequestObj (url, token)
          // console.log("requestObj",requestObj);
          result = await this.make_api_call (requestObj)
          jsondata = JSON.parse(result.body);
          if (jsondata.QueryResponse == undefined) {

          }
          else {
            len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
            console.log("Length of Invoice",len);
            arr = [];
            for (let j=0; j<len; j++) {
              data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
              arr.push(JSON.parse(data1));
            }
            invoice_arr.push(arr);
            amt = await this.calculateAmount(invoice_arr);
            for (let k=0; k<3; k++) {
              amt_data[k].data.push({"label" : mnth_name+year, y : amt[k]})
            }
          }

        }
      }
      else {
        for (let i=0; i <= month_len-1; i++) {
          console.log('value of i',i);
          url = api_uri + config.realmId + '/query?query=select * from Invoice'
          invoice_arr = [];
          if ( i == (month_len-1)) {
            mnth = moment(date2).format('MM')
            year = moment(date2).format('YYYY')
            dategt = year+'-'+ mnth + '-01'
            datelt = moment(date2).format('YYYY-MM-DD')
            mnth_name =  monthNames[mnth - 1];
            url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
            if (data.contact) {
              url += " AND CustomerRef = '" + data.contact + "'"
            }
            console.log('Making API call to: ' + url)
  
            requestObj = await this.getRequestObj (url, token)
            // console.log("requestObj",requestObj);
            result = await this.make_api_call (requestObj)
            jsondata = JSON.parse(result.body);
            if (jsondata.QueryResponse == undefined) {
  
            }
            else {
              len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
              console.log("Length of Invoice",len);
              arr = [];
              for (let j=0; j<len; j++) {
                let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
                arr.push(JSON.parse(data1));
              }
              invoice_arr.push(arr);
            }
          }
          else if (i == 0) {
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            day = this.daysInMonth(mnth, year)
            dategt = moment(date1).format('YYYY-MM-DD')
            datelt = year+'-'+ mnth + '-' + day
            mnth_name =  monthNames[mnth - 1];
            url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
            if (data.contact) {
              url += " AND CustomerRef = '" + data.contact + "'"
            }
            console.log('Making API call to: ' + url)
  
            requestObj = await this.getRequestObj (url, token)
  
            result = await this.make_api_call (requestObj)
            jsondata = JSON.parse(result.body);
            if (jsondata.QueryResponse == undefined) {
  
            }
            else {
              len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
              console.log("Length of Invoice",len);
              arr = [];
              for (let j=0; j<len; j++) {
                let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
                arr.push(JSON.parse(data1));
              }
              invoice_arr.push(arr);
            }
          }
          else {
            mnth = (parseInt(moment(date1).format('MM')) + i)
            year = moment(date1).format('YYYY')
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
            day = this.daysInMonth(mnth, year)
            dategt = year+'-'+ mnth + '-01'
            datelt = year+'-'+ mnth + '-' + day
            mnth_name =  monthNames[mnth - 1];
            url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
            if (data.contact) {
              url += " AND CustomerRef = '" + data.contact + "'"
            }
            console.log('Making API call to: ' + url)
  
            requestObj = await this.getRequestObj (url, token)
  
            result = await this.make_api_call (requestObj)
            jsondata = JSON.parse(result.body);
            if (jsondata.QueryResponse == undefined) {
  
            }
            else {
              len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
              console.log("Length of Invoice",len);
              arr = [];
              for (let j=0; j<len; j++) {
                let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
                arr.push(JSON.parse(data1));
              }
              invoice_arr.push(arr);
            }
          }
  
          // console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
          amt = await this.calculateAmount(invoice_arr);
          for (let k=0; k<3; k++) {
            amt_data[k].data.push({"label" : mnth_name+year, y : amt[k]})
          }
        }
      }
      return(amt_data);
    }

    async invoiceStatisticsPieData(config,data) {
		let token = await this.getToken(config);
		let date1 = moment(data.date1).format('YYYY-MM-DD')
		let date2 = moment(data.date2).format('YYYY-MM-DD')

		let url = api_uri + config.realmId + '/query?query=select * from Invoice'

		let paid_amt = 0,
			unpaid_amt = 0,
			draft_amt= 0,
			arr_invoice;
		url += " WHERE TxnDate >= '" + date1 + "' AND" + " TxnDate <= '" + date2 + "'"
		if (data.contact) {
			url += " AND CustomerRef = '" + data.contact + "'"
		}
		console.log('Making API call to: ' + url)

		let requestObj = await this.getRequestObj (url, token)
		// console.log("requestObj",requestObj);
		let result = await this.make_api_call (requestObj)
		let jsondata = JSON.parse(result.body);
		if (jsondata.QueryResponse == undefined) {

		}
		else {
			let len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
			console.log("Length of Invoice",len);
			let arr = [];
			for (let j=0; j<len; j++) {
				let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
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
			let pie_data = [
				{name: "Paid Amount", value: paid_amt},
				{name: "Unpaid Amount", value: unpaid_amt},
				{name: "Draft Amount", value: draft_amt}
			];
			return(pie_data);
		}
    }

    async cashflowAmt(invoice_arr, status) {
        let status_amt = 0;
        invoice_arr.forEach(function(invoice) {
          invoice.forEach(function(inv) {
            if (status) {
              if ((status == 'Paid') && (inv.Balance == 0)) {
                status_amt += inv.TotalAmt
              }
              if ((status == 'Unpaid') && (inv.Balance > 0)) {
                status_amt += inv.TotalAmt
              }
            }
            else {
              status_amt += inv.TotalAmt
            }
          })
        })
        return (status_amt);
    }

    async invoiceStatisticsCashflow(config,data) {
      let token = await this.getToken(config);
      let date1 = moment(data.date1,'YYYY-MM-DD')
      let date2 = moment(data.date2,'YYYY-MM-DD')
      let month_len = (date2.diff(date1, 'month')) + 1;
      console.log("mnth_length",month_len);

      let monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      let cashflow_arr = [];
      let url = '';

      let mnth,
          year,
          day,
          dategt,
          datelt,
          mnth_name,
          requestObj,
          result,
          jsondata,
          len,
          arr = [],
		  invoice_arr = [],
		  status_amt;


      if ((month_len - 1) === 0) {
        let mnth1 = moment(date1).format('MM')
        let mnth2 = moment(date2).format('MM')
        if (mnth1 === mnth2) {
            url = api_uri + config.realmId + '/query?query=select * from Invoice'
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            day = this.daysInMonth(mnth, year)
            dategt = moment(date1).format('YYYY-MM-DD')
            datelt = moment(date2).format('YYYY-MM-DD')
            mnth_name =  monthNames[mnth - 1];
            url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
            if (data.contact) {
              url += " AND CustomerRef = '" + data.contact + "'"
            }
            console.log('Making API call to: ' + url)
  
            requestObj = await this.getRequestObj (url, token)
  
            result = await this.make_api_call (requestObj)
            jsondata = JSON.parse(result.body);
            if (jsondata.QueryResponse == undefined) {
  
            }
            else {
              len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
              console.log("Length of Invoice",len);
              arr = [];
              for (let j=0; j<len; j++) {
                let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
                arr.push(JSON.parse(data1));
              }
              invoice_arr.push(arr);
              status_amt = await this.cashflowAmt(invoice_arr, data.status);
              cashflow_arr.push({"label":mnth_name, "y" : status_amt})
            }
        }
        else {
            url = api_uri + config.realmId + '/query?query=select * from Invoice'
            invoice_arr = [];
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            day = this.daysInMonth(mnth, year)
            dategt = moment(date1).format('YYYY-MM-DD')
            datelt = year+'-'+ mnth + '-' + day
            mnth_name =  monthNames[mnth - 1];
            url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
            if (data.contact) {
              url += " AND CustomerRef = '" + data.contact + "'"
            }
            console.log('Making API call to: ' + url)

            requestObj = await this.getRequestObj (url, token)

            result = await this.make_api_call (requestObj)
            jsondata = JSON.parse(result.body);
            if (jsondata.QueryResponse == undefined) {

            }
            else {
              len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
              console.log("Length of Invoice",len);
              arr = [];
              for (let j=0; j<len; j++) {
                let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
                arr.push(JSON.parse(data1));
              }
              invoice_arr.push(arr);
              status_amt = await this.cashflowAmt(invoice_arr, data.status);
              cashflow_arr.push({"label":mnth_name, "y" : status_amt})
            }

            url = api_uri + config.realmId + '/query?query=select * from Invoice'
            invoice_arr = [];
            mnth = moment(date2).format('MM')
            year = moment(date2).format('YYYY')
            dategt = year+'-'+ mnth + '-01'
            datelt = moment(date2).format('YYYY-MM-DD')
            mnth_name =  monthNames[mnth - 1];
            url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
            if (data.contact) {
              url += " AND CustomerRef = '" + data.contact + "'"
            }
            console.log('Making API call to: ' + url)
  
            requestObj = await this.getRequestObj (url, token)
            // console.log("requestObj",requestObj);
            result = await this.make_api_call (requestObj)
            jsondata = JSON.parse(result.body);
            if (jsondata.QueryResponse == undefined) {
  
            }
            else {
              len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
              console.log("Length of Invoice",len);
              arr = [];
              for (let j=0; j<len; j++) {
                let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
                arr.push(JSON.parse(data1));
              }
              invoice_arr.push(arr);
              status_amt = await this.cashflowAmt(invoice_arr, data.status);
              cashflow_arr.push({"label":mnth_name, "y" : status_amt})
            }
        }
      }
      else {
        for (let i=0; i <= month_len-1; i++) {
          console.log('value of i',i);
          url = api_uri + config.realmId + '/query?query=select * from Invoice'
          invoice_arr = [];
          if ( i == (month_len-1)) {
            mnth = moment(date2).format('MM')
            year = moment(date2).format('YYYY')
            dategt = year+'-'+ mnth + '-01'
            datelt = moment(date2).format('YYYY-MM-DD')
            mnth_name =  monthNames[mnth - 1];
            url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
            if (data.contact) {
              url += " AND CustomerRef = '" + data.contact + "'"
            }
            console.log('Making API call to: ' + url)
  
            requestObj = await this.getRequestObj (url, token)
            // console.log("requestObj",requestObj);
            result = await this.make_api_call (requestObj)
            jsondata = JSON.parse(result.body);
            if (jsondata.QueryResponse == undefined) {
  
            }
            else {
              len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
              console.log("Length of Invoice",len);
              arr = [];
              for (let j=0; j<len; j++) {
                let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
                arr.push(JSON.parse(data1));
              }
              invoice_arr.push(arr);
            }
          }
          else if (i == 0) {
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            day = this.daysInMonth(mnth, year)
            dategt = moment(date1).format('YYYY-MM-DD')
            datelt = year+'-'+ mnth + '-' + day
            mnth_name =  monthNames[mnth - 1];
            url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
            if (data.contact) {
              url += " AND CustomerRef = '" + data.contact + "'"
            }
            console.log('Making API call to: ' + url)
  
            requestObj = await this.getRequestObj (url, token)
  
            result = await this.make_api_call (requestObj)
            jsondata = JSON.parse(result.body);
            if (jsondata.QueryResponse == undefined) {
  
            }
            else {
              len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
              console.log("Length of Invoice",len);
              arr = [];
              for (let j=0; j<len; j++) {
                let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
                arr.push(JSON.parse(data1));
              }
              invoice_arr.push(arr);
            }
          }
          else {
            mnth = (parseInt(moment(date1).format('MM')) + i)
            year = moment(date1).format('YYYY')
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
            day = this.daysInMonth(mnth, year)
            dategt = year+'-'+ mnth + '-01'
            datelt = year+'-'+ mnth + '-' + day
            mnth_name =  monthNames[mnth - 1];
            url += " WHERE TxnDate >= '" + dategt + "' AND" + " TxnDate <= '" + datelt + "'"
            if (data.contact) {
              url += " AND CustomerRef = '" + data.contact + "'"
            }
            console.log('Making API call to: ' + url)
  
            requestObj = await this.getRequestObj (url, token)
  
            result = await this.make_api_call (requestObj)
            jsondata = JSON.parse(result.body);
            if (jsondata.QueryResponse == undefined) {
  
            }
            else {
              len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
              console.log("Length of Invoice",len);
              arr = [];
              for (let j=0; j<len; j++) {
                let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
                arr.push(JSON.parse(data1));
              }
              invoice_arr.push(arr);
            }
          }
          status_amt = await this.cashflowAmt(invoice_arr, data.status);
          cashflow_arr.push({"label":mnth_name, "y" : status_amt})        
        }
      }
      return(cashflow_arr);
    }

    async invoiceStats(config,data) {
		let token = await this.getToken(config);
		let date1 = moment(data.date1).format('YYYY-MM-DD')
		let date2 = moment(data.date2).format('YYYY-MM-DD')

		let url = api_uri + config.realmId + '/query?query=select * from Invoice'

		let paid_amt = 0,
			unpaid_amt = 0,
			draft_amt= 0,
			total_amt = 0,
			arr_invoice,
			arr_block,
			total_invoice = 0;

		url += " WHERE TxnDate >= '" + date1 + "' AND" + " TxnDate <= '" + date2 + "'"
		if (data.contact) {
			url += " AND CustomerRef = '" + data.contact + "'"
		}
		console.log('Making API call to: ' + url)

		let requestObj = await this.getRequestObj (url, token)
		// console.log("requestObj",requestObj);
		let result = await this.make_api_call (requestObj)
		let jsondata = JSON.parse(result.body);
		if (jsondata.QueryResponse == undefined) {

		}
		else {
			let len = JSON.stringify(jsondata.QueryResponse.totalCount, null, 2);
			console.log("Length of Invoice",len);
			let arr = [];
			for (let j=0; j<len; j++) {
			let data1 = JSON.stringify(jsondata.QueryResponse.Invoice[j], null, 2);
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
