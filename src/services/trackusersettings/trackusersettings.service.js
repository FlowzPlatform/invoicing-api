// Initializes the `trackusersettings` service on path `/trackusersettings`
const createService = require('feathers-rethinkdb');
const hooks = require('./trackusersettings.hooks');
const filters = require('./trackusersettings.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'trackusersettings',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/trackusersettings', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('trackusersettings');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
