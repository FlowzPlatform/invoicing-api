let moment = require('moment');
// const config = require("../../../config.js");

const xero = require('xero-node');
const fs = require("fs");

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

    async getAllContacts (config,data) {
      
        let xeroClient = await this.authentication(config);
        let filter = '';
        if(data.Name && data.EmailAddress ){
            filter += 'EmailAddress = "' + data.EmailAddress + '"'
        }else if (data.EmailAddress) {
            filter += 'EmailAddress = "' + data.EmailAddress + '"'
        }else if (data.Name) {
            filter = 'Name = "' + data.Name + '"'
        }else{
            filter = ''
        }

        console.log("############filter",filter);
        return new Promise((resolve, reject) => {
            xeroClient.core.contacts.getContacts({ where : filter})
            .then(function(invoices) {
                resolve(invoices)
            })
            .catch(function(err) {
                console.log("Error", typeof(err));
                resolve(err)
            })
        })
    }

    async createContact(config,data) {
      let xeroClient = await this.authentication(config);
        return new Promise((resolve, reject) => {
            console.log("params data",data)
            let sampleContact = {
                Name: data.Name,
                EmailAddress: data.EmailAddress,
                Addresses: [ {
                    AddressType: 'STREET',
                    AddressLine1: data.AddressLine1,
                    AddressLine2: data.AddressLine2,
                    City: data.City,
                    Region : data.State,
                    Country : data.Country,
                    PostalCode: data.PostalCode
                } ],
                Phones: [ {
                    PhoneType: 'MOBILE',
                    PhoneNumber: data.PhoneNumber
                } ]
            };
            xeroClient.core.contacts.newContact(sampleContact).save()
                .then(function(contacts) {
                    //console.log(contacts)
                    resolve(contacts.entities);
                })
                .catch(function(err) {
                    console.log("Error", err.data.Elements[0].ValidationErrors[0].Message);
                    resolve(err.data.Elements[0].ValidationErrors[0].Message);
                    // data = { err: 'Authentication error!!! Check your connection and credentials.' };
                })
        })
    }
}

module.exports = function(options) {
    return new Xero1(options);
};