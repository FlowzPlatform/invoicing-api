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


    getAllContacts(data , xeroClient) {
        return new Promise((resolve, reject) => {
            xeroClient.core.contacts.getContacts()
            .then(function(contacts) {
                resolve(contacts)
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