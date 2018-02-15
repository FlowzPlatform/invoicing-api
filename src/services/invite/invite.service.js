// Initializes the `invite` service on path `/invite`
const createService = require('./invite.class.js');
const hooks = require('./invite.hooks');
const filters = require('./invite.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'invite',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/invite', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('invite');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
