// Initializes the `settings` service on path `/settings`
const createService = require('feathers-rethinkdb');
const hooks = require('./buildersettings.hooks');
const filters = require('./buildersettings.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    id: 'userId',
    name: 'settings',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/buildersettings',   createService(options));
  

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('buildersettings');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
