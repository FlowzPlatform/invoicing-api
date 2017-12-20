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


    invoiceStatistics(filter, xeroClient) {
     
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

    getInvoiceById(id , xeroClient) {
      
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

    getInvoicesByFilter(data, xeroClient) {
        console.log(xeroClient)
        // console.log("inside filter")
        var data_arr = [];
        data_arr.push(data);
        var filterContact = '';
        var filter = '';

        var array = {"ContactID" : "", "ContactStatus": "", "Name": "", "EmailAddress": ""};
        // console.log("params data inside function",data_arr[0].amt_gt);
        for (var i = 0; i < keys.length; i++) {
          if (i == (keys.length-1)) {
            // console.log("inside key if");
            condition = ''
          }
          else {
            // console.log("inside key else ");
            condition = ' && '
          }
          if (keys[i] in array) {
            var n = filter.lastIndexOf("&&");
            filter = filter.slice(0, n)
            if (keys[i] == 'Name') {
              filterContact += 'Contact.' + keys[i] + ' = "' + data_arr[0][keys[i]] + '"' + condition
            }
            else {
              filterContact += 'Contact.' + keys[i] + ' = ' + data_arr[0][keys[i]] + condition
            }
          }
          else {
            if ( (keys[i] == 'Total' && data_arr[0].amt_gt == 'true') || (keys[i] == 'AmountPaid' && data_arr[0].amt_gt == 'true')) {
              // console.log("inside total if");
              filter += keys[i] + ' >= ' + data_arr[0][keys[i]] + condition
            }
            else if( keys[i] == 'Total' && data_arr[0].amt_lt == 'true') {
              // console.log("inside total if");
              filter += keys[i] + ' <= ' + data_arr[0][keys[i]] + condition
            }
            else if ( (keys[i] == 'amt_gt') || (keys[i] == 'amt_lt') ) {
              // console.log("inside amt_gt if");
              // var n = filter.lastIndexOf("AND");
              // filter = filter.slice(0, n)
              if (i == (keys.length-1)) {
                var n = filter.lastIndexOf("&&");
                filter = filter.slice(0, n)
              }
              continue;
            }
            // else if (keys[i] == 'Date' && data_arr[0].date_gt == 'true') {
            else if (keys[i] == 'Date') {
              var date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
              // console.log("date",date);
              filter += keys[i] + ' = ' + date + condition
            }
            // else if (keys[i] == 'Date' && data_arr[0].date_lt == 'true') {
            //   var date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
            //   // console.log("date",date);
            //   filter += keys[i] + ' <= ' + date + condition
            // }
            else if (keys[i] == 'DueDate') {
              var date = 'DateTime(' + moment(data_arr[0][keys[i]]).format('YYYY,MM,DD,HH,mm,ss') +')'
              // console.log("date",date);
              filter += keys[i] + ' = ' + date + condition
            }
            else if (keys[i] == 'Status') {
              filter += keys[i] + ' = "' + data_arr[0][keys[i]] + '"' + condition
            }
            else {
              console.log("inside else");
              filter += keys[i] + ' = ' + data_arr[0][keys[i]] + condition
            }
          }
        }

        var final_filter = '';
        if ( filterContact != '') {
          if (filter != '') {
            final_filter = filterContact + ' && ' + filter
          }
          else {
            final_filter = filterContact
          }
        }
        else {
          final_filter = filter
        }
        console.log("############filter",final_filter);

        return new Promise((resolve, reject) => {
            xeroClient.core.invoices.getInvoices({ where : final_filter})
            .then(function(invoices) {
                console.log(invoices)
                resolve(invoices)
            })
            .catch(function(err) {
                console.log("Error");
                data = {err:'Authentication error!!! Check your connection and credentials.'};
            })

        })
        return new Promise((resolve, reject) => {
            xesroClient.core.invoices.getInvoices({ where : filter})
            .then(function(invoices) {
                resolve(invoices)
            })
            .catch(function(err) {
                console.log("Error", typeof(err));
                data = {err:'Authentication error!!! Check your connection and credentials.'};
            })
        })
    }

}

module.exports = function(options) {
    return new Xero1(options);
};
