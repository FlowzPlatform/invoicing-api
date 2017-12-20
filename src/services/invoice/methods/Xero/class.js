var moment = require('moment');
const config = require("../../../config.js");

const xero = require('xero-node');
const fs = require("fs");

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

    authentication() {
      return new Promise(function(resolve, reject) {
        if (config.credentials.privateKeyPath && !config.credentials.privateKey)
        config.credentials.privateKey = fs.readFileSync(config.credentials.privateKeyPath);
        const xeroClient = new xero.PrivateApplication(config.credentials);
        resolve(xeroClient);
      })
    }

    //to count days in one month
    daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    }

    async getAllInvoice (data) {
      var xeroClient = await this.authentication();
      return new Promise((resolve, reject) => {
          xeroClient.core.invoices.getInvoices()
          .then(function(invoices) {
              resolve(invoices)
          })
          .catch(function(err) {
              console.log("Error", typeof(err));
              data = {err:'Authentication error!!! Check your connection and credentials.'};
          })
      })
    }

    async getInvoiceById(id) {
        var xeroClient = await this.authentication();
        return new Promise((resolve, reject) => {
            xeroClient.core.invoices.getInvoice(id)
            .then(function(invoices) {
                resolve(invoices)
            })
            .catch(function(err) {
                console.log("Error", typeof(err));
                data = {err:'Authentication error!!! Check your connection and credentials.'};
            })
        })
    }

    invoiceChart(filter, xeroClient) {
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
            data = {err:'Authentication error!!! Check your connection and credentials.'};
        })
      })
    }

    async getInvoicesByFilter(data) {
        // console.log("inside filter")
        var data_arr = [];
        var condition = '';
        data_arr.push(data);
        var keys = Object.keys(data_arr[0]);
        // console.log("keys",keys);
        // console.log("data_arr[0].keys[0]",data_arr[0][keys[0]]);
        // var filterContact = '';
        var filter = '';
        // var array = {"ContactID" : "", "ContactStatus": "", "Name": "", "EmailAddress": ""};
        // console.log("params data inside function",data_arr[0].amt_gt);
        // for (var i = 0; i < keys.length; i++) {
        //   if (i == (keys.length-1)) {
        //     // console.log("inside key if");
        //     condition = ''
        //   }
        //   else {
        //     // console.log("inside key else ");
        //     condition = ' && '
        //   }
        //   if (keys[i] in array) {
        //     var n = filter.lastIndexOf("&&");
        //     filter = filter.slice(0, n)
        //     if (keys[i] == 'Name') {
        //       filterContact += 'Contact.' + keys[i] + ' = "' + data_arr[0][keys[i]] + '"' + condition
        //     }
        //     else {
        //       filterContact += 'Contact.' + keys[i] + ' = ' + data_arr[0][keys[i]] + condition
        //     }
        //   }
        //   else {
        //     if (keys[i] == 'domain') {
        //
        //     }
        //     else if ( (keys[i] == 'Total' && data_arr[0].amt_gt == 'true') || (keys[i] == 'AmountPaid' && data_arr[0].amt_gt == 'true')) {
        //       // console.log("inside total if");
        //       filter += keys[i] + ' >= ' + data_arr[0][keys[i]] + condition
        //     }
        //     else if( keys[i] == 'Total' && data_arr[0].amt_lt == 'true') {
        //       // console.log("inside total if");
        //       filter += keys[i] + ' <= ' + data_arr[0][keys[i]] + condition
        //     }
        //     else if ( (keys[i] == 'amt_gt') || (keys[i] == 'amt_lt') ) {
        //       // console.log("inside amt_gt if");
        //       // var n = filter.lastIndexOf("AND");
        //       // filter = filter.slice(0, n)
        //       if (i == (keys.length-1)) {
        //         var n = filter.lastIndexOf("&&");
        //         filter = filter.slice(0, n)
        //       }
        //       continue;
        //     }
        //     // else if (keys[i] == 'Date' && data_arr[0].date_gt == 'true') {
        //     else if (keys[i] == 'Date') {
        //       var date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
        //       // console.log("date",date);
        //       filter += keys[i] + ' = ' + date + condition
        //     }
        //     // else if (keys[i] == 'Date' && data_arr[0].date_lt == 'true') {
        //     //   var date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
        //     //   // console.log("date",date);
        //     //   filter += keys[i] + ' <= ' + date + condition
        //     // }
        //     else if (keys[i] == 'DueDate') {
        //       var date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
        //       // console.log("date",date);
        //       filter += keys[i] + ' = ' + date + condition
        //     }
        //     else if (keys[i] == 'Status') {
        //       filter += keys[i] + ' = "' + data_arr[0][keys[i]] + '"' + condition
        //     }
        //     else {
        //       console.log("inside else");
        //       filter += keys[i] + ' = ' + data_arr[0][keys[i]] + condition
        //     }
        //   }
        // }

        for (var i = 0; i < keys.length; i++) {
          if (i == 1) {
            condition = ''
          }
          else {
            condition = ' && '
          }
          if (keys[i] == 'domain' || keys[i] == 'chart') {

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

        // var final_filter = '';
        // if ( filterContact != '') {
        //   if (filter != '') {
        //     final_filter = filterContact + ' && ' + filter
        //   }
        //   else {
        //     final_filter = filterContact
        //   }
        // }
        // else {
        //   final_filter = filter
        // }
        console.log("############filter",filter);

        var xeroClient = await this.authentication();
        return new Promise((resolve, reject) => {
            xeroClient.core.invoices.getInvoices({ where : filter})
            .then(function(invoices) {
                resolve(invoices)
            })
            .catch(function(err) {
                console.log("Error", typeof(err));
                data = {err:'Authentication error!!! Check your connection and credentials.'};
            })
        })
    }

    async createInvoice(data) {
      var xeroClient = await this.authentication();
      var sampleInvoice = {
        Type: 'ACCREC',
        Contact: {
          Name: data.name
        },
        Status: 'AUTHORISED',
        DueDate: new Date().toISOString().split("T")[0],
        LineItems: [{
          Description: data.description,
          Quantity: data.qty,
          UnitAmount: data.amount,
          AccountCode: '200'
        }]
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
              console.log("Error", typeof(err));
              data = {err:'Authentication error!!! Check your connection and credentials.'};
          })
      })
    }

    async invoiceStatistics(data) {
      var xeroClient = await this.authentication();
      var date1 = moment(data.date1,'YYYY,MM,DD')
      var date2 = moment(data.date2,'YYYY,MM,DD')
      var month_len = (date2.diff(date1, 'month')) + 1;

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

      var filter = '';
      for (var i=month_len-1; i >= 0; i--) {
        var invoice_arr = [];
        if ( i == (month_len-1)) {
          var mnth = moment(date2).format('MM')
          var year = moment(date2).format('YYYY')
          var dategt = year+','+ mnth + ',1'
          var datelt = moment(date2).format('YYYY,MM,DD')
          var mnth_name =  monthNames[mnth - 1];
          filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
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
          filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
          console.log("Filter####",filter);
          var arr = await this.invoiceChart(filter, xeroClient)
          invoice_arr.push(arr);
        }
        else {
          var mnth = parseInt(moment(date1).format('MM')) + i
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = year+','+ mnth + ',1'
          datelt = year+','+ mnth + ',' + day
          var mnth_name =  monthNames[mnth - 1];
          filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
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
            else {
              // console.log("Draft or Void invoice");
              draft_amt += inv.Total;
            }
          })
        })
        console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
        var amt = [paid_amt, authorize_amt, draft_amt]
        for (var j=0; j<3; j++) {
          amt_data[j].data.push({"label" : mnth_name +'-2017', y : amt[j]})
        }
      }
      return(amt_data);
    }

    async invoiceStatisticsPieData(data) {
        var xeroClient = await this.authentication();
        var date1 = moment(data.date1).format('YYYY,MM,DD')
        var date2 = moment(data.date2).format('YYYY,MM,DD')
        var filter = "";
        var paid_amt = 0;
        var unpaid_amt = 0;
        var draft_amt= 0;
        var arr_invoice;
        filter = ' Date >= DateTime(' + date1 + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + date2 + ',00,00,00)'
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
        return(pie_data);
    }

    async invoiceStatisticsCashflow(data) {
      var xeroClient = await this.authentication();
      var date1 = moment(data.date1,'YYYY,MM,DD')
      var date2 = moment(data.date2,'YYYY,MM,DD')
      var month_len = (date2.diff(date1, 'month')) + 1;

      var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      var filter = '';
      var cashflow_arr = [];
      for (var i=month_len-1; i >= 0; i--) {
        var invoice_arr = [];
        if ( i == (month_len-1)) {
          var mnth = moment(date2).format('MM')
          var year = moment(date2).format('YYYY')
          var dategt = year+','+ mnth + ',1'
          var datelt = moment(date2).format('YYYY,MM,DD')
          var mnth_name =  monthNames[mnth - 1];
          filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
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
          filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
          console.log("Filter####",filter);
          var arr = await this.invoiceChart(filter, xeroClient)
          invoice_arr.push(arr);
        }
        else {
          var mnth = parseInt(moment(date1).format('MM')) + i
          var year = moment(date1).format('YYYY')
          var day = this.daysInMonth(mnth, year)
          dategt = year+','+ mnth + ',1'
          datelt = year+','+ mnth + ',' + day
          var mnth_name =  monthNames[mnth - 1];
          filter = ' Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
          console.log("Filter####",filter);
          var arr = await this.invoiceChart(filter, xeroClient)
          invoice_arr.push(arr);
        }

        var status_amt = 0;
        invoice_arr.forEach(function(invoice) {
          invoice.forEach(function(inv) {
              if (data.status) {
                console.log("inside if");
                if((inv.Status).toLowerCase() == data.status.toLowerCase()) {
                  status_amt += inv.Total
                }
              }
              else {
                status_amt += inv.Total
              }
          })
          cashflow_arr.push({"label":mnth_name, "y" : status_amt})
        })
      }
      return(cashflow_arr);
    }

    async invoiceStats(data) {
        var xeroClient = await this.authentication();
        var date1 = moment(data.date1).format('YYYY,MM,DD')
        var date2 = moment(data.date2).format('YYYY,MM,DD')
        var filter = "";
        var paid_amt = 0;
        var unpaid_amt = 0;
        var draft_amt= 0;
        var total_amt = 0;
        var arr_invoice;
        var arr_block;
        filter = ' Date >= DateTime(' + date1 + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + date2 + ',00,00,00)'
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
    return new Xero1(options);
};
