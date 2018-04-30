// Initializes the `po-settings` service on path `/po-settings`
const createService = require('feathers-rethinkdb');
const hooks = require('./po-settings.hooks');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'po_settings',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/po-settings', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('po-settings');

  service.hooks(hooks);
};
