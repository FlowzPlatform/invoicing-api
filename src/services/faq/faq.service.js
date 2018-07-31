// Initializes the `FAQ` service on path `/faq`
const createService = require('feathers-rethinkdb');
const hooks = require('./faq.hooks');
const filters = require('./faq.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'faq',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/faq', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('faq');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
