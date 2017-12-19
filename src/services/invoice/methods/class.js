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
        // console.log("inside filter")
        var data_arr = [];
        data_arr.push(data);
        var filterContact = '';
        var filter = '';
        console.log("params data inside function",data_arr);
        data_arr.forEach(function(params) {
          // console.log("key",key);
          console.log("params",params);
          // filter += ''
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
