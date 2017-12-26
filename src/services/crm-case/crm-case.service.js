// Initializes the `crm-case` service on path `/crm-case`
const createService = require('feathers-rethinkdb');
const hooks = require('./crm-case.hooks');
const filters = require('./crm-case.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'crm_case',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/crm-case', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('crm-case');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
