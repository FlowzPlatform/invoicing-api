const assert = require('assert');
const app = require('../../src/app');

describe('\'supplierPaymentConfig\' service', () => {
  it('registered the service', () => {
    const service = app.service('supplier-payment-config');

    assert.ok(service, 'Registered the service');
  });
});
