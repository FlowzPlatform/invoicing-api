const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');

const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

// const auth = require('feathers-authentication');
// const jwt = require('feathers-authentication-jwt');

const rethinkdb = require('./rethinkdb');



const subscription = require('flowz-subscription')


const app = feathers();

app.use(function(req, res, next) {
    //req.feathers.headers = req.headers;
     console.log("???????????????????????? " , req.headers)
     this.app = app;
     this.apiHeaders = req.headers ;
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// Load app configuration
app.configure(configuration());
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));


// Set up Plugins and providers
app.configure(hooks());
app.configure(rethinkdb);
app.configure(rest());
//app.configure(socketio());


// app.configure(auth({ secret: 'abcdefgabcdefg' }))
// app.configure(jwt({service : "contacts"}))

app.use(subscription.featherSubscription)


// Set up our services (see `services/index.js`)
//app.use(subscription.subscription)
app.configure(services);
app.configure(middleware);


app.use(notFound());
app.use(handler());
// Configure middleware (see `middleware/index.js`) - always has to be last

app.hooks(appHooks);



module.exports = app;
