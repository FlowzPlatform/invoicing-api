// Initializes the `supplierPaymentConfig` service on path `/supplier-payment-config`
const createService = require('feathers-rethinkdb');
const hooks = require('./supplier-payment-config.hooks');
const filters = require('./supplier-payment-config.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'supplierPaymentConfig',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/supplier-payment-config', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('supplier-payment-config');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
