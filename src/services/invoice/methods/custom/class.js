let moment = require('moment');
let accounting = require('accounting-js');

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
        
        let date1 = moment(data.date1).format('YYYY/MM/DD')
        let date2 = moment(data.date2).format('YYYY/MM/DD')
        // let query = "";
        let paid_amt = 0,
            unpaid_amt = 0,
            draft_amt= 0,
            arr,
            arr_invoice = [];

        let query = {
            settingId: config.id
        }
        if (data.contact) {
            query['Name'] = data.contact
        }
        await app.service('custominvoice').find({query : query})
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
                console.log("invoice.Date",date,date1,date2)
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

        let pie_data = [
          {name: "Paid Amount", value: paid_amt},
          {name:"Unpaid Amount", value: unpaid_amt},
          {name: "Draft Amount", value: draft_amt}
        ];
        // console.log("pie_data in function",pie_data);
        return(pie_data);
    }

    async invoiceStats(config,data) {
        let date1 = moment(data.date1).format('YYYY/MM/DD')
        let date2 = moment(data.date2).format('YYYY/MM/DD')

        let paid_amt = 0,
            unpaid_amt = 0,
            draft_amt= 0,
            total_amt = 0,
            total_invoice = 0,
            arr,
            arr_block;
        
        let query = {
            settingId: config.id
        }
        if (data.contact) {
            query['Name'] = data.contact
        }
        await app.service('custominvoice').find({query : query})
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

    async calculateAmount(arr,dategt,datelt) {
        let invoice_arr = [];
        arr.forEach(function(invoice) {
            let date = moment(invoice.Date).format('YYYY/MM/DD');
            if (date >= dategt) {
                if (date <= datelt) {
                    invoice_arr.push(invoice);
                }
            }
        })

        let draft_amt = 0,
            authorize_amt = 0,
            paid_amt = 0;
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
        let amt = [paid_amt, authorize_amt, draft_amt]
        return amt;
    }

    async invoiceStatistics(config,data) {
        
        let date1 = moment(data.date1,'YYYY/MM/DD')
        let date2 = moment(data.date2,'YYYY/MM/DD')
        // console.log("####date1",date1);
        // console.log("#######date2",date2);

        let month_len = (date2.diff(date1, 'month')) + 1;
        console.log("mnth_len",month_len);

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

        let query = {
            settingId: config.id
        }
        if (data.contact) {
            query['Name'] = data.contact
        }
        
        
        let arr,
            dategt,
            datelt,
            mnth,
            year,
            day,
            mnth_name,
            invoice_arr = [],
            amt;

        await app.service('custominvoice').find({query : query})
            .then(function(response) {
                arr = response.data;
            })
            .catch(function(err) {
                return err;
            })
        
        if ((month_len - 1) === 0) {
            let mnth1 = moment(date1).format('MM')
            let mnth2 = moment(date2).format('MM')
            if (mnth1 === mnth2) {
                mnth = moment(date1).format('MM')
                year = moment(date1).format('YYYY')
                day = this.daysInMonth(mnth, year)
                dategt = moment(date1).format('YYYY/MM/DD')
                datelt = moment(date2).format('YYYY/MM/DD')
                mnth_name =  monthNames[mnth - 1];
                // datelt = moment(datelt).format('YYYY/MM/DD');

                amt = await this.calculateAmount(arr,dategt,datelt);
                for (let j=0; j<3; j++) {
                    amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
                }
            }
            else {
                mnth = moment(date1).format('MM')
                year = moment(date1).format('YYYY')
                day = this.daysInMonth(mnth, year)
                dategt = moment(date1).format('YYYY/MM/DD')
                datelt = year+'/'+ mnth + '/' + day
                mnth_name =  monthNames[mnth - 1];
                datelt = moment(datelt).format('YYYY/MM/DD');
                amt = await this.calculateAmount(arr,dategt,datelt);
                for (let j=0; j<3; j++) {
                    amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
                }

                mnth = moment(date2).format('MM')
                year = moment(date2).format('YYYY')
                dategt = year+'/'+ mnth + '/1'
                datelt = moment(date2).format('YYYY/MM/DD')
                mnth_name =  monthNames[mnth - 1];
                dategt = moment(dategt).format('YYYY/MM/DD');
                amt = await this.calculateAmount(arr,dategt,datelt);
                for (let j=0; j<3; j++) {
                    amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
                }
            }
        }
        else {
            for (let i=0; i <= month_len-1; i++) {
                invoice_arr = [];
                if ( i == (month_len-1)) {
                    mnth = moment(date2).format('MM')
                    year = moment(date2).format('YYYY')
                    mnth_name =  monthNames[mnth - 1];
                    dategt = year+'/'+ mnth + '/1'
                    datelt = moment(date2).format('YYYY/MM/DD')
                    dategt = moment(dategt).format('YYYY/MM/DD');
                }
                else if (i == 0) {
                    mnth = moment(date1).format('MM')
                    year = moment(date1).format('YYYY')
                    day = this.daysInMonth(mnth, year)
                    dategt = moment(date1).format('YYYY/MM/DD')
                    datelt = year+'/'+ mnth + '/' + day
                    mnth_name =  monthNames[mnth - 1];
                    datelt = moment(datelt).format('YYYY/MM/DD');
                }
                else {
                    mnth = parseInt(moment(date1).format('MM')) + i
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
                    day = this.daysInMonth(mnth, year)
                    dategt = year+'/'+ mnth + '/1'
                    datelt = year+'/'+ mnth + '/' + day
                    mnth_name =  monthNames[mnth - 1];
                    dategt = moment(dategt).format('YYYY/MM/DD');
                    datelt = moment(datelt).format('YYYY/MM/DD');
                }
    
                amt = await this.calculateAmount(arr,dategt,datelt);
                for (let j=0; j<3; j++) {
                    amt_data[j].data.push({"label" : mnth_name+year, y : amt[j]})
                }
            }
        }
        return(amt_data);
    }

    async cashflowAmt(arr, dategt, datelt,status) {
        let invoice_arr = [];
        arr.forEach(function(invoice) {
            let date = moment(invoice.Date).format('YYYY/MM/DD');
            if (date >= dategt) {
                if (date <= datelt) {
                    invoice_arr.push(invoice);
                }
            }
        })

        let status_amt = 0;
        invoice_arr.forEach(function(invoice) {
            if (status) {
                if((invoice.Status).toLowerCase() == status.toLowerCase()) {
                    status_amt += invoice.Total
                }
            }
            else {
                status_amt += invoice.Total
            }
        })
        return (status_amt);
    }

    async invoiceStatisticsCashflow(config,data) {
        
        let date1 = moment(data.date1,'YYYY/MM/DD')
        let date2 = moment(data.date2,'YYYY/MM/DD')
        let month_len = (date2.diff(date1, 'month')) + 1;
        let arr;
        let monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

        let query = {
            settingId: config.id
        }
        if (data.contact) {
            query['Name'] = data.contact
        }
        await app.service('custominvoice').find({query : query})
            .then(function(response) {
                arr = response.data;
            })
            .catch(function(err) {
                return err;
            })
        
        let cashflow_arr = [],
            mnth,
            year,
            day,
            dategt,
            datelt,
            mnth_name,
            status_amt;
        // console.log("!!!!!!!!!!!!!!!!!!!!!!!!1arr",month_len)

        if ((month_len - 1) === 0) {
            let mnth1 = moment(date1).format('MM')
            let mnth2 = moment(date2).format('MM')
            if (mnth1 === mnth2) {
                mnth = moment(date1).format('MM')
                year = moment(date1).format('YYYY')
                day = this.daysInMonth(mnth, year)
                dategt = moment(date1).format('YYYY/MM/DD')
                datelt = moment(date2).format('YYYY/MM/DD')
                mnth_name =  monthNames[mnth - 1];

                status_amt = await this.cashflowAmt(arr, dategt, datelt, data.status);
                cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})
            }
            else {
                mnth = moment(date1).format('MM')
                year = moment(date1).format('YYYY')
                day = this.daysInMonth(mnth, year)
                dategt = moment(date1).format('YYYY/MM/DD')
                datelt = year+'/'+ mnth + '/' + day
                mnth_name =  monthNames[mnth - 1];
                datelt = moment(datelt).format('YYYY/MM/DD');

                status_amt = await this.cashflowAmt(arr, dategt, datelt, data.status);
                cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})

                mnth = moment(date2).format('MM')
                year = moment(date2).format('YYYY')
                dategt = year+'/'+ mnth + '/1'
                datelt = moment(date2).format('YYYY/MM/DD')
                mnth_name =  monthNames[mnth - 1];
                dategt = moment(dategt).format('YYYY/MM/DD');

                status_amt = await this.cashflowAmt(arr, dategt, datelt, data.status);
                cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})

            }
        }
        else {
            for (let i=0; i <= month_len-1; i++) {
                if ( i == (month_len-1)) {
                    mnth = moment(date2).format('MM')
                    year = moment(date2).format('YYYY')
                    dategt = year+'/'+ mnth + '/1'
                    datelt = moment(date2).format('YYYY/MM/DD')
                    mnth_name =  monthNames[mnth - 1];
                    dategt = moment(dategt).format('YYYY/MM/DD');
    
                }
                else if (i == 0) {
                    mnth = moment(date1).format('MM')
                    year = moment(date1).format('YYYY')
                    day = this.daysInMonth(mnth, year)
                    dategt = moment(date1).format('YYYY/MM/DD')
                    datelt = year+'/'+ mnth + '/' + day
                    mnth_name =  monthNames[mnth - 1];
                    datelt = moment(datelt).format('YYYY/MM/DD');
    
                }
                else {
                    mnth = parseInt(moment(date1).format('MM')) + i
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
                    day = this.daysInMonth(mnth, year)
                    dategt = year+'/'+ mnth + '/1'
                    datelt = year+'/'+ mnth + '/' + day
                    // dategt = '1/' + mnth + year
                    // datelt = day +'/'+ mnth + '/' + year
                    mnth_name =  monthNames[mnth - 1];
                    dategt = moment(dategt).format('YYYY/MM/DD');
                    datelt = moment(datelt).format('YYYY/MM/DD');
    
                }
    
                status_amt = await this.cashflowAmt(arr, dategt, datelt, data.status);
                cashflow_arr.push({"label":mnth_name+year, "y" : status_amt})
            }
        }

        return(cashflow_arr);
    }
    
}

module.exports = function(options) {
    return new custom(options);
};