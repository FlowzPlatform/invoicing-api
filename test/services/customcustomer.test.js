const assert = require('assert');
const app = require('../../src/app');

describe('\'customcustomer\' service', () => {
  it('registered the service', () => {
    const service = app.service('customcustomer');

    assert.ok(service, 'Registered the service');
  });
});
