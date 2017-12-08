// Initializes the `contacts` service on path `/contacts`
const createService = require('./contacts.class.js');
const hooks = require('./contacts.hooks');
const filters = require('./contacts.filters');


module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'contacts',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/contacts', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('contacts');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
