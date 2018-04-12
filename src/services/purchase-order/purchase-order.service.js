// Initializes the `purchase-order` service on path `/purchase-order`
const createService = require('feathers-rethinkdb');
const hooks = require('./purchase-order.hooks');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'purchase_order',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/purchase-order', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('purchase-order');

  service.hooks(hooks);

  
};
