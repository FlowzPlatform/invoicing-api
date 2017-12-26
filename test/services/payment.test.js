const assert = require('assert');
const app = require('../../src/app');

describe('\'payment\' service', () => {
  it('registered the service', () => {
    const service = app.service('payment');

    assert.ok(service, 'Registered the service');
  });
});
