const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
const subscription = require('flowz-subscription')
const flowzError = require('flowz-error-handler');
module.exports.subscription = subscription


module.exports = async function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this;
  

  
  let totalSettings = 6
  subscription.moduleResource.moduleName = 'crm'
  let registerAppModule = {
    
    'settings': ['create'],
    // 'invoice': ['create' , 'get' , 'find',  'update' , 'remove'],
    // 'contacts': ['create' , 'get' , 'find',  'update' , 'remove'],
    // 'customcontacts': ['create' , 'find',  'get' , 'update' , 'remove'],
    // 'custominvoice': ['create' , 'get' ,'find',  'update' , 'remove']
  }
  subscription.moduleResource.registerAppModule = registerAppModule 
  subscription.moduleResource.appRoles = ['admin', 'accountant', 'client']
  subscription.registeredAppModulesRole()
  subscription.registerDynamicHooks(app, registerAppModule)
  
  //console.log(app)
  // app.service("settings").get("cfe90fca-6a5e-4c6a-8430-a1538eeb130b").then(count => {
  //   console.log('users:', count);
  // }).catch(err => {
  //     console.log(err)
  // });
  // subscription.secureService.validate = (route, params, secureRouteInfo , userDetail) => {
    
  //   return new Promise((resolve, reject) => {
  //     // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>")
  //     // console.log(secureRouteInfo.value, '====', totalSettings)
  //     if ((route === '/settings' || route === 'settings') && secureRouteInfo.value >= totalSettings) {
  //       resolve(true)
  //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>" ,1)
  //     }else{
  //       resolve(false)
  //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>" ,2)
  //     }
      
  //   })
  // }
  app.use(flowzError());
};

