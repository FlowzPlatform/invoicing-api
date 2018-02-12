var moment = require('moment');
// const config = require("../../../config.js");

const xero = require('xero-node');
// const fs = require("fs");

class Xero1 {
    /**
     * constructor
     * @param {*} options
     */
    constructor() {
        console.log("inside constr xero")

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

    //to count days in one month
    daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    }

    // async getAllInvoice (config,data) {
    //   var xeroClient = await this.authentication();
    //   return new Promise((resolve, reject) => {
    //       xeroClient.core.invoices.getInvoices()
    //       .then(function(invoices) {
    //           resolve(invoices)
    //       })
    //       .catch(function(err) {
    //           console.log("Error", typeof(err));
    //           data = {err:'Authentication error!!! Check your connection and credentials.'};
    //       })
    //   })
    // }

    async getInvoiceById(config,id) {
      var xeroClient = await this.authentication(config);
      return new Promise((resolve, reject) => {
        xeroClient.core.invoices.getInvoice(id)
          .then(function(invoices) {
              resolve(invoices)
          })
          .catch(function(err) {
              console.log("Error in get invoice by id", err);
              // data = {err:'Authentication error!!! Check your connection and credentials.'};
              resolve(err);
          })
      })
    }

    async getInvoicesByFilter(config,data) {
        // console.log("inside filter")
        var data_arr = [];
        var condition = '';
        data_arr.push(data);
        var keys = Object.keys(data_arr[0]);
        // console.log("keys",keys);
        // console.log("data_arr[0].keys[0]",data_arr[0][keys[0]]);
        // var filterContact = '';
        var filter = '';

        for (var i = 0; i < keys.length; i++) {
          if (i == 1) {
            condition = ''
          }
          else {
            condition = ' && '
          }
          if (keys[i] == 'domain' || keys[i] == 'chart' || keys[i] == 'stats' || keys[i] == 'settingId' || keys[i] == 'user') {

          }
          else {
            if (keys[i].slice(0,3) == 'min') {
                if ((keys[i].slice(3,keys[i].length) == 'Date') || (keys[i].slice(3,keys[i].length) == 'DueDate')) {
                  var date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
                  // console.log("date",date);
                  filter += condition + keys[i].slice(3,keys[i].length) + ' >= ' + date
                }
                else {
                  filter += condition + keys[i].slice(3,keys[i].length) + ' >= ' + data_arr[0][keys[i]]
                }
            }
            else if (keys[i].slice(0,3) == 'max') {
              if ((keys[i].slice(3,keys[i].length) == 'Date') || (keys[i].slice(3,keys[i].length) == 'DueDate')) {
                var date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
                // console.log("date",date);
                filter += condition + keys[i].slice(3,keys[i].length) + ' <= ' + date
              }
              else {
                filter += condition + keys[i].slice(3,keys[i].length) + ' <= ' + data_arr[0][keys[i]]
              }
            }
            else {
              if (keys[i] == 'Name') {
                  filter += condition + 'Contact.' + keys[i] + ' = "' + data_arr[0][keys[i]] + '"'
              }
              else if (keys[i] == 'Status') {
                  filter += condition + keys[i] + ' = "' + data_arr[0][keys[i]] + '"'
              }
              else if ((keys[i] == 'Date') || (keys[i] == 'DueDate')) {
                  var date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
                  // console.log("date",date);
                  filter += condition + keys[i] + ' = ' + date
              }
              else {
                  filter += condition + keys[i] + ' = ' + data_arr[0][keys[i]]
              }
            }
          }
        }

        console.log("############filter",filter);

        var xeroClient = await this.authentication(config);
        return new Promise((resolve, reject) => {
          xeroClient.core.invoices.getInvoices({ where : filter})
            .then(function(invoices) {
              // console.log("invoices",invoices);
                resolve(invoices)
            })
            .catch(function(err) {
                console.log("Error", typeof(err), err);
                // data = {err:'Authentication error!!! Check your connection and credentials.'};
                resolve(err);
            })
        })
    }

    async createInvoice(config,data) {
      var xeroClient = await this.authentication(config);
      console.log("###########product arr",data.products);
      var LineItems = [];
      let duedate;
      if (data.DueDate) {
          duedate = data.DueDate
      }
      else {
          duedate = new Date().toISOString().split("T")[0]
      }
      data.products.forEach(function(product) {
        let desc = {
          description : product.description,
          title : product.title,
          sku : product.sku,
          additional_charges : product.additional_charges,
          shipping_charges : product.shipping_charges,
          tax : product.tax
        };
          var lineItemData = {
              Description: JSON.stringify(desc),
              Quantity: product.qty,
              UnitAmount: product.amount,
              AccountCode: '200'
          };
          LineItems.push(lineItemData);
          if (product.additional_charges) {
            lineItemData = {
              Description: "additional_charges",
              Quantity: "1",
              UnitAmount: product.additional_charges,
              AccountCode: '200'
            };
            LineItems.push(lineItemData);
          }
          if (product.shipping_charges) {
            lineItemData = {
              Description: "shipping_charges",
              Quantity: "1",
              UnitAmount: product.shipping_charges,
              AccountCode: '200'
            };
            LineItems.push(lineItemData);
          }
      })
      var sampleInvoice = {
          Type: 'ACCREC',
          Contact: {
              Name: data.Name
          },
          Status: 'AUTHORISED',
          DueDate: duedate,
          // LineItems: [{
          //   Description: data.description,
          //   Quantity: data.qty,
          //   UnitAmount: data.amount,
          //   AccountCode: '200'
          // }]
          LineItems : LineItems
      };
      console.log("sampleInvoice",sampleInvoice);
      return new Promise((resolve, reject) => {
          var invoiceObj = xeroClient.core.invoices.newInvoice(sampleInvoice);
          var myInvoice;
          invoiceObj.save()
          .then(function(invoices) {
              myInvoice = invoices.entities[0];
              resolve(myInvoice);
          })
          .catch(function(err) {
              console.log("Error in post invoice", typeof(err), err);
              // data = {err:'Authentication error!!! Check your connection and credentials.'};
              resolve(err);
          })
      })
  }

    async invoiceChart(filter, xeroClient) {
      var invoice_arr = [];
      return new Promise((resolve, reject) => {
        xeroClient.core.invoices.getInvoices({where : filter})
        .then(function(invoices) {
          // console.log("@@@@@@@@@@arr",invoices);
            invoices.forEach(function(invoice) {
              invoice_arr.push(invoice);
            })
            resolve(invoice_arr)
        })
        .catch(function(err) {
            console.log("Error", typeof(err));
            // data = {err:'Authentication error!!! Check your connection and credentials.'};
            resolve(err);
        })
      })
    }

    async invoiceStatistics(config,data) {
      var xeroClient = await this.authentication(config);
      var date1 = moment(data.date1,'YYYY,MM,DD')
      var date2 = moment(data.date2,'YYYY,MM,DD')
      var month_len = (date2.diff(date1, 'month')) + 1;
      console.log("mnth_len",month_len);

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
        var filter = '';
        var invoice_arr = [];
        if ( i == (month_len-1)) {
          var mnth = moment(date2).format('MM')
          var year = moment(date2).format('YYYY')
          var dategt = year+','+ mnth + ',1'
          var datelt = moment(date2).format('YYYY,MM,DD')
          var mnth_name =  monthNames[mnth - 1];
          if (data.contact) {
            filter = 'Contact.Name = "'+ data.contact +'" && '
          }
          filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
          console.log("Filter####",filter);
          var arr = await this.invoiceChart(filter, xeroClient)
          invoice_arr.push(arr);
        }
        else if (i == 0) {
          var mnth = moment(date1).format('MM')
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = moment(date1).format('YYYY,MM,DD')
          datelt = year+','+ mnth + ',' + day
          var mnth_name =  monthNames[mnth - 1];
          if (data.contact) {
            filter = 'Contact.Name = "'+ data.contact +'" && '
          }
          filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
          console.log("Filter####",filter);
          var arr = await this.invoiceChart(filter, xeroClient)
          invoice_arr.push(arr);
        }
        else {
          let mnth = parseInt(moment(date1).format('MM')) + i
          let year = moment(date1).format('YYYY');
          if (mnth > 12) {
            if ((mnth % 12 != 0)) {
              mnth = mnth % 12
              year = parseInt(moment(date1).format('YYYY')) + 1
            }
            else {
              mnth = 12
            }
          }
          var day = this.daysInMonth(mnth, year)
          dategt = year+','+ mnth + ',1'
          datelt = year+','+ mnth + ',' + day
          var mnth_name =  monthNames[mnth - 1];
          if (data.contact) {
            filter = 'Contact.Name = "'+ data.contact +'" && '
          }
          filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
          console.log("Filter####",filter);
          var arr = await this.invoiceChart(filter, xeroClient)
          invoice_arr.push(arr);
        }

        var draft_amt = 0;
        var authorize_amt = 0;
        var paid_amt = 0;
        // console.log("arr",arr[5]);
        console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
        invoice_arr.forEach(function(invoice) {
          // console.log("@@@@@@@@@@@@@@arr",invoice[0]._obj.Status);
          invoice.forEach(function(inv) {
            // console.log("inv status",inv.Status);
            // console.log("amount",inv.Total);
            if (inv.Status == "PAID") {
              // console.log("Paid invoice");
              paid_amt += inv.Total;
            }
            else if (inv.Status == "AUTHORISED") {
              // console.log("Unpaid invoice");
              authorize_amt += inv.Total;
            }
            else if (inv.Status == "DRAFT"){
              // console.log("Draft or Void invoice");
              draft_amt += inv.Total;
            }
            else {
                
            }
          })
        })
        console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
        var amt = [paid_amt, authorize_amt, draft_amt]
        for (var j=0; j<3; j++) {
          amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
        }
      }
      return(amt_data);
    }

    async invoiceStatisticsPieData(config,data) {
        var xeroClient = await this.authentication(config);
        var date1 = moment(data.date1).format('YYYY,MM,DD')
        var date2 = moment(data.date2).format('YYYY,MM,DD')
        var filter = "";
        var paid_amt = 0;
        var unpaid_amt = 0;
        var draft_amt= 0;
        var arr_invoice;
        if (data.contact) {
          filter = 'Contact.Name = "'+ data.contact +'" && '
        }
        filter += 'Date >= DateTime(' + date1 + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + date2 + ',00,00,00)'
        console.log("#######filter",filter);
        arr_invoice = await this.invoiceChart(filter, xeroClient)
        arr_invoice.forEach(function(invoice) {
          // console.log("@@@@@#############invoice",invoice);
            if(invoice.Status == 'AUTHORISED') {
              unpaid_amt += invoice.Total;
            }
            else if(invoice.Status == 'DRAFT') {
              draft_amt += invoice.Total;
            }
            else {
              paid_amt += invoice.Total;
            }
        });
        var pie_data = [
          {name: "Paid Amount", value: paid_amt},
          {name:"Unpaid Amount", value: unpaid_amt},
          {name: "Draft Amount", value: draft_amt}
        ];
        // console.log("pie_data in function",pie_data);
        return(pie_data);
    }

    async invoiceStatisticsCashflow(config,data) {
      var xeroClient = await this.authentication(config);
      var date1 = moment(data.date1,'YYYY,MM,DD')
      var date2 = moment(data.date2,'YYYY,MM,DD')
      var month_len = (date2.diff(date1, 'month')) + 1;

      var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      var cashflow_arr = [];
      for (var i=0; i <= month_len-1; i++) {
        var filter = '';
        var invoice_arr = [];
        if ( i == (month_len-1)) {
          var mnth = moment(date2).format('MM')
          var year = moment(date2).format('YYYY')
          var dategt = year+','+ mnth + ',1'
          var datelt = moment(date2).format('YYYY,MM,DD')
          var mnth_name =  monthNames[mnth - 1];
          if (data.contact) {
            filter = 'Contact.Name = "'+ data.contact +'" && '
          }
          filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
          console.log("Filter####",filter);
          var arr = await this.invoiceChart(filter, xeroClient)
          invoice_arr.push(arr);
        }
        else if (i == 0) {
          var mnth = moment(date1).format('MM')
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = moment(date1).format('YYYY,MM,DD')
          datelt = year+','+ mnth + ',' + day
          var mnth_name =  monthNames[mnth - 1];
          if (data.contact) {
            filter = 'Contact.Name = "'+ data.contact +'" && '
          }
          filter += ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
          console.log("Filter####",filter);
          var arr = await this.invoiceChart(filter, xeroClient)
          invoice_arr.push(arr);
        }
        else {
          var mnth = parseInt(moment(date1).format('MM')) + i
          let year = moment(date1).format('YYYY');
          if (mnth > 12) {
            if ((mnth % 12 != 0)) {
              mnth = mnth % 12
              year = parseInt(moment(date1).format('YYYY')) + 1
            }
            else {
              mnth = 12
            }
          }
          var day = this.daysInMonth(mnth, year)
          dategt = year+','+ mnth + ',1'
          datelt = year+','+ mnth + ',' + day
          var mnth_name =  monthNames[mnth - 1];
          if (data.contact) {
            filter = 'Contact.Name = "'+ data.contact +'" && '
          }
          filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
          console.log("Filter####",filter);
          var arr = await this.invoiceChart(filter, xeroClient)
          invoice_arr.push(arr);
        }

        var status_amt = 0;
        invoice_arr.forEach(function(invoice) {
          invoice.forEach(function(inv) {
              if (data.status) {
                // console.log("inside if");
                if((inv.Status).toLowerCase() == data.status.toLowerCase()) {
                  status_amt += inv.Total
                }
              }
              else {
                status_amt += inv.Total
              }
          })
          cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})
        })
      }
      return(cashflow_arr);
    }

    async invoiceStats(config,data) {
        var xeroClient = await this.authentication(config);
        var date1 = moment(data.date1).format('YYYY,MM,DD')
        var date2 = moment(data.date2).format('YYYY,MM,DD')
        var paid_amt = 0;
        var unpaid_amt = 0;
        var draft_amt= 0;
        var total_amt = 0;
        var arr_invoice;
        var arr_block;
        var total_invoice = 0;
        var filter = "";
        if (data.contact) {
          filter = 'Contact.Name = "'+ data.contact +'" && '
        }
        filter += ' Date >= DateTime(' + date1 + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + date2 + ',00,00,00)'
        console.log("#######filter",filter);
        arr_invoice = await this.invoiceChart(filter, xeroClient)
        arr_invoice.forEach(function(invoice) {
          // console.log("@@@@@#############invoice",invoice);
            if(invoice.Status == 'AUTHORISED') {
              unpaid_amt += invoice.Total;
            }
            else if(invoice.Status == 'DRAFT') {
              draft_amt += invoice.Total;
            }
            else {
              paid_amt += invoice.Total;
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

module.exports = function(options) {
    return new Xero1(options);
};
