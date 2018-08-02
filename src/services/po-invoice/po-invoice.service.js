// Initializes the `poInvoice` service on path `/po-invoice`
const createService = require('feathers-rethinkdb');
const hooks = require('./po-invoice.hooks');
const filters = require('./po-invoice.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'poInvoice',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/po-invoice', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('po-invoice');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
