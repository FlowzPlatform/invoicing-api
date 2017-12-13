const contacts = require('./contacts/contacts.service.js');
const invoice = require('./invoice/invoice.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(contacts);
  app.configure(invoice);
};
