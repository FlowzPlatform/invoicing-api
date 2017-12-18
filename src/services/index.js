const contacts = require('./contacts/contacts.service.js');
const settings = require('./settings/settings.service.js');
const invoice = require('./invoice/invoice.service.js');
const payment = require('./payment/payment.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(contacts);
  app.configure(settings);
  app.configure(invoice);



  app.configure(payment);
};
