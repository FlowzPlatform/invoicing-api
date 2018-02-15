// Initializes the `customcustomer` service on path `/customcustomer`
const createService = require('feathers-rethinkdb');
const hooks = require('./customcustomer.hooks');
const filters = require('./customcustomer.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'customcustomer',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/customcustomer', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('customcustomer');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
