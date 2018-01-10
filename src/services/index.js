const contacts = require('./contacts/contacts.service.js');
const settings = require('./settings/settings.service.js');
const invoice = require('./invoice/invoice.service.js');
const upload = require('./upload/upload.service.js');


const crmService = require('./crm-service/crm-service.service.js');
const crmCase = require('./crm-case/crm-case.service.js');
const crmHistory = require('./crm-history/crm-history.service.js');
const relationshipcomments = require('./relationshipcomments/relationshipcomments.service.js');

const payment = require('./payment/payment.service.js');

const transaction = require('./transaction/transaction.service.js');


module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(contacts);
  app.configure(settings);
  app.configure(invoice);



  app.configure(upload);


  app.configure(crmService);
  app.configure(crmCase);
  app.configure(crmHistory);
  app.configure(relationshipcomments);

  app.configure(payment);

  app.configure(transaction);

};
