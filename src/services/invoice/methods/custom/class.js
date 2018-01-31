let moment = require('moment');

class custom {
    /**
     * constructor
     * @param {*} options
     */
    constructor() {
        console.log("inside constr")

        // this.options = options || {};
    }

    setup(app) {
        this.app = app;
      }

    /**
     * do direct charge
     * @param {*} data
     */

    //to count days in one month
    daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    }

    async invoiceStatisticsPieData(config,data) {
        
        var date1 = moment(data.date1).format('YYYY/MM/DD')
        var date2 = moment(data.date2).format('YYYY/MM/DD')
        // let query = "";
        var paid_amt = 0;
        var unpaid_amt = 0;
        var draft_amt= 0;
        let arr;
        let arr_invoice = [];
        
        await app.service('custominvoice').find(config.id)
            .then(function(response) {
                arr = response.data;
            })
            .catch(function(err) {
                return err;
            })
        
        // console.log("############arr",arr);
        console.log("arr length",arr.length);


        arr.forEach(function(invoice) {
            // console.log("invoice.Date",invoice.Date,date1,date2)
            let date = moment(invoice.Date).format('YYYY/MM/DD');
            if (date >= date1) {
                console.log("invoice.DueDate",date,date1,date2)
                if (date <= date2) {
                    // console.log("@@@@@@@@invoice.Status",invoice.Status)
                    if(invoice.Status == 'AUTHORISED') {
                        unpaid_amt += invoice.Total;
                    }
                    else if(invoice.Status == 'DRAFT') {
                        draft_amt += invoice.Total;
                    }
                    else if(invoice.Status == 'PAID') {
                        paid_amt += invoice.Total;
                    }
                    else {
                    }
                }
            }
        })

        var pie_data = [
          {name: "Paid Amount", value: paid_amt},
          {name:"Unpaid Amount", value: unpaid_amt},
          {name: "Draft Amount", value: draft_amt}
        ];
        // console.log("pie_data in function",pie_data);
        return(pie_data);
    }

    async invoiceStats(config,data) {
        var date1 = moment(data.date1).format('YYYY/MM/DD')
        var date2 = moment(data.date2).format('YYYY/MM/DD')

        var paid_amt = 0;
        var unpaid_amt = 0;
        var draft_amt= 0;
        var total_amt = 0;
        var total_invoice = 0;

        var arr;
        var arr_block;
        
        await app.service('custominvoice').find(config.id)
            .then(function(response) {
                arr = response.data;
            })
            .catch(function(err) {
                return err;
            })

        
        arr.forEach(function(invoice) {
            let date = moment(invoice.Date).format('YYYY/MM/DD');
            if (date >= date1) {
                if (date <= date2) {
                    if(invoice.Status == 'AUTHORISED') {
                        unpaid_amt += invoice.Total;
                    }
                    else if(invoice.Status == 'DRAFT') {
                        draft_amt += invoice.Total;
                    }
                    else if(invoice.Status == 'PAID'){
                        paid_amt += invoice.Total;
                    }
                    else {

                    }
                    total_invoice = arr.length;
                }
            }
        })

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

    async invoiceStatistics(config,data) {
        
        var date1 = moment(data.date1,'YYYY/MM/DD')
        var date2 = moment(data.date2,'YYYY/MM/DD')
        // console.log("####date1",date1);
        // console.log("#######date2",date2);

        var month_len = (date2.diff(date1, 'month')) + 1;
        console.log("mnth_len",month_len);

        var arr;

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

        await app.service('custominvoice').find(config.id)
            .then(function(response) {
                arr = response.data;
            })
            .catch(function(err) {
                return err;
            })

        for (var i=0; i <= month_len-1; i++) {
            
            var invoice_arr = [];
            if ( i == (month_len-1)) {
                var mnth = moment(date2).format('MM')
                var year = moment(date2).format('YYYY')
                var dategt = year+'/'+ mnth + '/1'
                var datelt = moment(date2).format('YYYY/MM/DD')
                var mnth_name =  monthNames[mnth - 1];

                arr.forEach(function(invoice) {
                    let date = moment(invoice.Date).format('YYYY/MM/DD');
                    if (date >= dategt) {
                        if (date <= datelt) {
                            invoice_arr.push(invoice);
                        }
                    }
                })    
            }
            else if (i == 0) {
                var mnth = moment(date1).format('MM')
                var year = moment(date1).format('YYYY')
                var day = this.daysInMonth(mnth, year)
                dategt = moment(date1).format('YYYY/MM/DD')
                datelt = year+'/'+ mnth + '/' + day
                var mnth_name =  monthNames[mnth - 1];

                arr.forEach(function(invoice) {
                    let date = moment(invoice.Date).format('YYYY/MM/DD');
                    if (date >= dategt) {
                        if (date <= datelt) {
                            invoice_arr.push(invoice);
                        }
                    }
                })
            }
            else {
                var mnth = parseInt(moment(date1).format('MM')) + i
                var year = moment(date1).format('YYYY')
                var day = this.daysInMonth(mnth, year)
                dategt = year+'/'+ mnth + '/1'
                datelt = year+'/'+ mnth + '/' + day
                var mnth_name =  monthNames[mnth - 1];

                arr.forEach(function(invoice) {
                    let date = moment(invoice.Date).format('YYYY/MM/DD');
                    if (date >= dategt) {
                        if (date <= datelt) {
                            invoice_arr.push(invoice);
                        }
                    }
                })
            }

            var draft_amt = 0;
            var authorize_amt = 0;
            var paid_amt = 0;
            // console.log("arr",arr[5]);
            console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
            invoice_arr.forEach(function(invoice) {
                if (invoice.Status == "PAID") {
                    paid_amt += invoice.Total;
                }
                else if (invoice.Status == "AUTHORISED") {
                    authorize_amt += invoice.Total;
                }
                else if (invoice.Status == "DRAFT"){
                    draft_amt += invoice.Total;
                }
                else {
                    
                }
            })
            console.log("draft_amt",draft_amt,"authorize_amt",authorize_amt,"paid_amt",paid_amt);
            var amt = [paid_amt, authorize_amt, draft_amt]
            for (var j=0; j<3; j++) {
                amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
            }
        }
        return(amt_data);
    }

    async invoiceStatisticsCashflow(config,data) {
        
        var date1 = moment(data.date1,'YYYY/MM/DD')
        var date2 = moment(data.date2,'YYYY/MM/DD')
        var month_len = (date2.diff(date1, 'month')) + 1;
        let arr;
        var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

        await app.service('custominvoice').find(config.id)
            .then(function(response) {
                arr = response.data;
            })
            .catch(function(err) {
                return err;
            })
        
        var cashflow_arr = [];
        // console.log("!!!!!!!!!!!!!!!!!!!!!!!!1arr",month_len)
        for (var i=0; i <= month_len-1; i++) {
            var invoice_arr = [];
            if ( i == (month_len-1)) {
                var mnth = moment(date2).format('MM')
                var year = moment(date2).format('YYYY')
                var dategt = year+'/'+ mnth + '/1'
                // var dategt = '1/'+ mnth+ '/'+ year 
                var datelt = moment(date2).format('YYYY/MM/DD')
                var mnth_name =  monthNames[mnth - 1];

                arr.forEach(function(invoice) {
                    let date = moment(invoice.Date).format('YYYY/MM/DD');
                    if (date >= dategt) {
                        if (date <= datelt) {
                            console.log("1")
                            invoice_arr.push(invoice);
                        }
                    }
                })
                
            }
            else if (i == 0) {
                var mnth = moment(date1).format('MM')
                var year = moment(date1).format('YYYY')
                var day = this.daysInMonth(mnth, year)
                dategt = moment(date1).format('YYYY/MM/DD')
                // datelt = day +'/'+ mnth + '/' + year
                datelt = year+'/'+ mnth + '/' + day
                var mnth_name =  monthNames[mnth - 1];

                arr.forEach(function(invoice) {
                    let date = moment(invoice.Date).format('YYYY/MM/DD');
                    if (date >= dategt) {
                        if (date <= datelt) {
                            invoice_arr.push(invoice);
                        }
                    }
                })
            }
            else {
                var mnth = parseInt(moment(date1).format('MM')) + i
                var year = moment(date1).format('YYYY')
                var day = this.daysInMonth(mnth, year)
                dategt = year+'/'+ mnth + '/1'
                datelt = year+'/'+ mnth + '/' + day
                // dategt = '1/' + mnth + year
                // datelt = day +'/'+ mnth + '/' + year
                var mnth_name =  monthNames[mnth - 1];
                
                arr.forEach(function(invoice) {
                    let date = moment(invoice.Date).format('YYYY/MM/DD');
                    if (date >= dategt) {
                        if (date <= datelt) {
                            invoice_arr.push(invoice);
                        }
                    }
                })
            }

            // console.log("############invoice_arr",invoice_arr)

            var status_amt = 0;
            invoice_arr.forEach(function(invoice) {
                if (data.status) {
                    if((invoice.Status).toLowerCase() == data.status.toLowerCase()) {
                        status_amt += invoice.Total
                    }
                }
                else {
                    status_amt += invoice.Total
                }
            })
            cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})
        }
        return(cashflow_arr);
    }
    
}

module.exports = function(options) {
    return new custom(options);
};