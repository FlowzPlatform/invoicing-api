const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
let rp = require('request-promise')
const subscription = require('flowz-subscription')
module.exports.subscription = subscription

module.exports = async function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this;
  subscription.moduleResource.moduleName = 'crm'
   registerAppModule = {
    'settings': ['create']
  }

  subscription.moduleResource.registerAppModule = registerAppModule
  subscription.moduleResource.appRoles = ['admin', 'user', 'client']
  subscription.registeredAppModulesRole()
  //subscription.registerDynamicHooks(app, registerAppModule)

  app.use(notFound());
  app.use(handler());
};
