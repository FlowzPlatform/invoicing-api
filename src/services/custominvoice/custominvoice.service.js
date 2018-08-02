// Initializes the `custominvoice` service on path `/custominvoice`
const createService = require('feathers-rethinkdb');
const hooks = require('./custominvoice.hooks');
const filters = require('./custominvoice.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'custominvoice',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/custominvoice', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('custominvoice');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
