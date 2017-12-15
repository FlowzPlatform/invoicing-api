var _ = require('lodash');

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


    getAllContacts(data, xeroClient) {

        console.log(data);

        if (_.isEmpty(data)) {

            return new Promise((resolve, reject) => {
                xeroClient.core.contacts.getContacts()
                    .then(function(contacts) {
                        resolve(contacts)
                    })
                    .catch(function(err) {
                        console.log("Error", typeof(err));
                        data = { err: 'Authentication error!!! Check your connection and credentials.' };
                    })
            })
        } else {

            var qryWhere = this.prepareXeroQuery(data);
            console.log(qryWhere)

            return new Promise((resolve, reject) => {
                console.log('----------------------' + qryWhere)
                xeroClient.core.contacts.getContacts({
                        where: qryWhere
                            //where: 'Addresses[0].City.Contains("Waghodia")'
                            //where: 'Name.Contains("Dweep") && EmailAddress.Contains("harshp@officebrain.com")'
                    })
                    .then(contacts => {
                        resolve(contacts)
                    }).catch(err => {
                        console.log(err);
                        reject(err);
                    });
            });
        }
    }

    prepareXeroQuery(data) {

        var qryWhere = '';

        var first = true;
        _.forOwn(data, function(value, key) {
            console.log("***" + key + '---' + value);

            qryWhere += ((first ? '' : ' && ') + key + '.Contains("' + value + '")');

            first = false;
        });

        return qryWhere;
    }

    createNewContact(data, xeroClient) {
        return new Promise((resolve, reject) => {
            console.log(data)
            xeroClient.core.contacts.newContact(data).save()
                .then(function(contacts) {
                    console.log(contacts)
                    resolve(contacts)
                })
                .catch(function(err) {
                    console.log("Error", err);
                    data = { err: 'Authentication error!!! Check your connection and credentials.' };
                })
        })
    }

}

module.exports = function(options) {
    return new Xero1(options);
};