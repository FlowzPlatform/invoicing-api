// Initializes the `payment` service on path `/payment`
const createService = require('./payment.class.js');
const hooks = require('./payment.hooks');
const filters = require('./payment.filters');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  const options = {
    name: 'payment',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/payment', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('payment');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
