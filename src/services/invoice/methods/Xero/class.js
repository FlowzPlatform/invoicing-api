let moment = require('moment');
const accounting = require('accounting-js');
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
        let keybuffer = new Buffer(config.certificate, 'base64');
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
    //   let xeroClient = await this.authentication();
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
      let xeroClient = await this.authentication(config);
      console.log("iddddddddddddddddddddddd----------",id);
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
        let data_arr = [];
        let condition = '';
        data_arr.push(data);
        let keys = Object.keys(data_arr[0]);
        // console.log("keys",keys);
        // console.log("data_arr[0].keys[0]",data_arr[0][keys[0]]);
        // let filterContact = '';
        let filter = '';

        for (let i = 0; i < keys.length; i++) {
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
                  let date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
                  // console.log("date",date);
                  filter += condition + keys[i].slice(3,keys[i].length) + ' >= ' + date
                }
                else {
                  filter += condition + keys[i].slice(3,keys[i].length) + ' >= ' + data_arr[0][keys[i]]
                }
            }
            else if (keys[i].slice(0,3) == 'max') {
              if ((keys[i].slice(3,keys[i].length) == 'Date') || (keys[i].slice(3,keys[i].length) == 'DueDate')) {
                let date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
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
                  let date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
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

        let xeroClient = await this.authentication(config);
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
      let xeroClient = await this.authentication(config);
      // console.log("###########product arr",data.products);
      let LineItems = [];
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
          let lineItemData = {
              Description: JSON.stringify(desc),
              Quantity: product.qty,
              UnitAmount: product.amount,
              TaxAmount: product.tax,
              AccountCode: '200'
          };
          LineItems.push(lineItemData);
          if (product.additional_charges) {
            lineItemData = {
              Description: "additional_charges",
              Quantity: "1",
              UnitAmount: product.additional_charges,
              TaxAmount: 0,
              AccountCode: '200'
            };
            LineItems.push(lineItemData);
          }
          if (product.shipping_charges) {
            lineItemData = {
              Description: "shipping_charges",
              Quantity: "1",
              UnitAmount: product.shipping_charges,
              TaxAmount: 0,
              AccountCode: '200'
            };
            LineItems.push(lineItemData);
          }
      })
      let sampleInvoice = {
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
          let invoiceObj = xeroClient.core.invoices.newInvoice(sampleInvoice);
          let myInvoice;
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
      let invoice_arr = [];
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

    async calculateAmount(invoice_arr, mnth_name, year){

        let draft_amt = 0,
            authorize_amt = 0,
            paid_amt = 0;
        // console.log("-----------------------------",invoice_arr);
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
        let amt = [paid_amt, authorize_amt, draft_amt]
      
      return(amt)
    }

    async invoiceStatistics(config,data) {
      let xeroClient = await this.authentication(config);
      let date1 = moment(data.date1,'YYYY,MM,DD')
      let date2 = moment(data.date2,'YYYY,MM,DD')
      let month_len = (date2.diff(date1, 'month')) + 1;
      console.log("mnth_len",month_len);
      let finalAmt = [];

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
      let monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      let invoice_arr = [],
          filter = '',
          amt,
          mnth,
          year,
          day,
          mnth_name,
          arr,
          dategt,
          datelt;

      if ((month_len - 1) === 0) {
        let mnth1 = moment(date1).format('MM')
        let mnth2 = moment(date2).format('MM')
        if (mnth1 === mnth2) {
            invoice_arr = [];
            filter = '';
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            dategt = moment(date1).format('YYYY,MM,DD')
            datelt = moment(date2).format('YYYY,MM,DD')
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
            amt = await this.calculateAmount(invoice_arr, mnth_name, year);
            for (let j=0; j<3; j++) {
              amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
            }
        }
        else {
            //calculate for first month
            invoice_arr = [];
            filter = '';
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            day = this.daysInMonth(mnth, year)
            dategt = moment(date1).format('YYYY,MM,DD')
            datelt = year+','+ mnth + ',' + day
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
            amt = await this.calculateAmount(invoice_arr, mnth_name, year);
            for (let j=0; j<3; j++) {
              amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
            }

            //calculate for second month
            invoice_arr = [];
            filter = '';
            mnth = moment(date2).format('MM')
            year = moment(date2).format('YYYY')
            dategt = year+','+ mnth + ',1'
            datelt = moment(date2).format('YYYY,MM,DD')
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
            amt = await this.calculateAmount(invoice_arr, mnth_name, year);
            for (let j=0; j<3; j++) {
              amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
            }
        }
      }
      else {
        for (let i=0; i <= month_len-1; i++) {
          filter = '';
          invoice_arr = [];
          if (i == 0) {
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            day = this.daysInMonth(mnth, year)
            dategt = moment(date1).format('YYYY,MM,DD')
            datelt = year+','+ mnth + ',' + day
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
          }
          else if ( i == (month_len-1)) {
            mnth = moment(date2).format('MM')
            year = moment(date2).format('YYYY')
            dategt = year+','+ mnth + ',1'
            datelt = moment(date2).format('YYYY,MM,DD')
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
          }
          else {
            mnth = parseInt(moment(date1).format('MM')) + i
            year = moment(date1).format('YYYY');
            if (mnth > 12) {
              if ((mnth % 12 != 0)) {
                mnth = mnth % 12
                year = parseInt(moment(date1).format('YYYY')) + 1
              }
              else {
                mnth = 12
              }
            }
            day = this.daysInMonth(mnth, year)
            dategt = year+','+ mnth + ',1'
            datelt = year+','+ mnth + ',' + day
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
          }
          amt = await this.calculateAmount(invoice_arr, mnth_name, year);
          for (let j=0; j<3; j++) {
            amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
          }
        }
      }

      return(amt_data)
    }

    async invoiceStatisticsPieData(config,data) {
        let xeroClient = await this.authentication(config);
        let date1 = moment(data.date1).format('YYYY,MM,DD')
        let date2 = moment(data.date2).format('YYYY,MM,DD')
        let filter = "";
        let paid_amt = 0;
        let unpaid_amt = 0;
        let draft_amt= 0;
        let arr_invoice;
        if (data.contact) {
          filter = 'Contact.Name = "'+ data.contact +'" && '
        }
        filter += 'Date >= DateTime(' + date1 + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + date2 + ',00,00,00)'
        console.log("#######filter invoiceStatisticsPieData",filter);
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
        let pie_data = [
          {name: "Paid Amount", value: paid_amt},
          {name:"Unpaid Amount", value: unpaid_amt},
          {name: "Draft Amount", value: draft_amt}
        ];
        // console.log("pie_data in function",pie_data);
        return(pie_data);
    }

    async cashflowAmt (invoice_arr,status) {
      let status_amt = 0;
      invoice_arr.forEach(function(invoice) {
        invoice.forEach(function(inv) {
            if (status) {
              // console.log("inside if");
              if((inv.Status).toLowerCase() == status.toLowerCase()) {
                status_amt += inv.Total
              }
            }
            else {
              status_amt += inv.Total
            }
        })
      })
      return(status_amt);
    }

    async invoiceStatisticsCashflow(config,data) {
      let xeroClient = await this.authentication(config);
      let date1 = moment(data.date1,'YYYY,MM,DD')
      let date2 = moment(data.date2,'YYYY,MM,DD')
      let month_len = (date2.diff(date1, 'month')) + 1;

      let monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

      let cashflow_arr = [];
      let status_amt;

      let invoice_arr = [],
          filter = '',
          mnth,
          year,
          day,
          dategt,
          datelt,
          mnth_name,
          arr;

      if ((month_len - 1) === 0) {
        let mnth1 = moment(date1).format('MM')
        let mnth2 = moment(date2).format('MM')
        if (mnth1 === mnth2) {
            invoice_arr = [];
            filter = '';
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            dategt = moment(date1).format('YYYY,MM,DD')
            datelt = moment(date2).format('YYYY,MM,DD')
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
            status_amt = await this.cashflowAmt(invoice_arr,data.status);
            cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})
        }
        else {
            //calculate for first month
            invoice_arr = [];
            filter = '';
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            day = this.daysInMonth(mnth, year)
            dategt = moment(date1).format('YYYY,MM,DD')
            datelt = year+','+ mnth + ',' + day
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
            status_amt = await this.cashflowAmt(invoice_arr,data.status);
            cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})

            //calculate for second month
            invoice_arr = [];
            filter = '';
            mnth = moment(date2).format('MM')
            year = moment(date2).format('YYYY')
            dategt = year+','+ mnth + ',1'
            datelt = moment(date2).format('YYYY,MM,DD')
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
            status_amt = await this.cashflowAmt(invoice_arr,data.status);
            cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})
        }
      }
      else {
        for (let i=0; i <= month_len-1; i++) {
          filter = '';
          invoice_arr = [];
          if ( i == (month_len-1)) {
            mnth = moment(date2).format('MM')
            year = moment(date2).format('YYYY')
            dategt = year+','+ mnth + ',1'
            datelt = moment(date2).format('YYYY,MM,DD')
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
          }
          else if (i == 0) {
            mnth = moment(date1).format('MM')
            year = moment(date1).format('YYYY')
            day = this.daysInMonth(mnth, year)
            dategt = moment(date1).format('YYYY,MM,DD')
            datelt = year+','+ mnth + ',' + day
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += ' Date >= DateTime(' + dategt + ',00,00,00)' + 'AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
          }
          else {
            mnth = parseInt(moment(date1).format('MM')) + i
            year = moment(date1).format('YYYY');
            if (mnth > 12) {
              if ((mnth % 12 != 0)) {
                mnth = mnth % 12
                year = parseInt(moment(date1).format('YYYY')) + 1
              }
              else {
                mnth = 12
              }
            }
            day = this.daysInMonth(mnth, year)
            dategt = year+','+ mnth + ',1'
            datelt = year+','+ mnth + ',' + day
            mnth_name =  monthNames[mnth - 1];
            if (data.contact) {
              filter = 'Contact.Name = "'+ data.contact +'" && '
            }
            filter += 'Date >= DateTime(' + dategt + ',00,00,00)' + ' AND' + ' Date <=  DateTime(' + datelt + ',00,00,00)'
            console.log("Filter####",filter);
            arr = await this.invoiceChart(filter, xeroClient)
            invoice_arr.push(arr);
          }
  
          status_amt = await this.cashflowAmt(invoice_arr,data.status);
          cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})
        }
      }

      return(cashflow_arr);
    }

    async invoiceStats(config,data) {
        let xeroClient = await this.authentication(config);
        let date1 = moment(data.date1).format('YYYY,MM,DD')
        let date2 = moment(data.date2).format('YYYY,MM,DD')

        let paid_amt = 0,
            unpaid_amt = 0,
            draft_amt= 0,
            total_amt = 0,
            arr_invoice,
            arr_block,
            total_invoice = 0,
            filter = "";

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
          {name: "Unpaid Amount", value: unpaid_amt},
          {name: "Draft Amount", value: draft_amt},
          {name: "Total Invoice", value: total_invoice}
        ];
        return(arr_block);
    }
}

module.exports = function(options) {
    return new Xero1(options);
};
