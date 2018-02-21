/* eslint-disable no-unused-vars */

let cloudinary = require('cloudinary');
let config1 = require('../../customConfig.js');

cloudinary.config({ 
      cloud_name: config1.default.cloudinary_cloud_name,
      api_key: config1.default.cloudinary_api_key, 
      api_secret: config1.default.cloudinary_api_secret 
    });

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
    // if (Array.isArray(data)) {
    //   return Promise.all(data.map(current => this.create(current)));
    // }

    return new Promise((resolve , reject) => {
      cloudinary.v2.uploader.upload(data.file,
      { resource_type: "raw",folder: data.folder},
      function(error, result) {
        if(error){
          console.log('&&&&&&&&&&',error)
          resolve(error)
        }else{ 
        resolve (result)      
          // console.log(result);
          // var fileobj = {
          //   "filename":hook.data.fileupload[0].filename,
          //   "url":result.url
          // }
          // fileurl.push(fileobj)
          // hook.data.fileupload = fileurl;
        }
      });
    }) 

    // return Promise.resolve(data);
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
