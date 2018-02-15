/* eslint-disable no-unused-vars */

let fs = require('fs');
let pdf = require('html-pdf');


class Service {
  constructor (options) {
    this.options = options || {};
  }

  find (params) {
    return Promise.resolve([]);
  }

  get (id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  create (data, params) {
        return new Promise((resolve , reject) =>{
      pdf.create(data.html).toBuffer(function(err, buffer){
        console.log('This is a buffer:', buffer);
        
        resolve(buffer)
      });
    })
  }

  update (id, data, params) {
    return Promise.resolve(data);
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
