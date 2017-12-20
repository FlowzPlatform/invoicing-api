// Initializes the `upload` service on path `/upload`
const createService = require('./upload.class.js');
const hooks = require('./upload.hooks');
const filters = require('./upload.filters');


const blobService = require('feathers-blob');
const fs = require('fs-blob-store');
const blobStorage = fs('./src/uploads');
console.log(blobStorage)

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'upload',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/upload',   blobService({Model: blobStorage}));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('upload');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
