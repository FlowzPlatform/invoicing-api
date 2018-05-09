const assert = require('assert');
const app = require('../../src/app');

describe('\'poInvoice\' service', () => {
  it('registered the service', () => {
    const service = app.service('po-invoice');

    assert.ok(service, 'Registered the service');
  });
});
