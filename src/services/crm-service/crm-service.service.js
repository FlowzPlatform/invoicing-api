// Initializes the `crm-service` service on path `/crm-service`
const createService = require('feathers-rethinkdb');
const hooks = require('./crm-service.hooks');
const filters = require('./crm-service.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'crm_service',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/crm-service', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('crm-service');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
