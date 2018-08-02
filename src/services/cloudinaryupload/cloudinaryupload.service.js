// Initializes the `cloudinaryupload` service on path `/cloudinaryupload`
const createService = require('./cloudinaryupload.class.js');
const hooks = require('./cloudinaryupload.hooks');
const filters = require('./cloudinaryupload.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'cloudinaryupload',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cloudinaryupload', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('cloudinaryupload');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
