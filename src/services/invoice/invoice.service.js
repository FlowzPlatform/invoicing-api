// Initializes the `invoice` service on path `/invoice`
const createService = require('./invoice.class.js');
const hooks = require('./invoice.hooks');
const filters = require('./invoice.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'invoice',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/invoice', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('invoice');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
