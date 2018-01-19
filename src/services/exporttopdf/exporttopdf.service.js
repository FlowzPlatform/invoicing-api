// Initializes the `exporttopdf` service on path `/exporttopdf`
const createService = require('./exporttopdf.class.js');
const hooks = require('./exporttopdf.hooks');
const filters = require('./exporttopdf.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'exporttopdf',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/exporttopdf', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('exporttopdf');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
