// Initializes the `crm-history` service on path `/crm-history`
const createService = require('feathers-rethinkdb');
const hooks = require('./crm-history.hooks');
const filters = require('./crm-history.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'crm_history',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/crm-history', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('crm-history');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
