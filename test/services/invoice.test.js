const assert = require('assert');
const app = require('../../src/app');

describe('\'invoice\' service', () => {
  it('registered the service', () => {
    const service = app.service('invoice');

    assert.ok(service, 'Registered the service');
  });
});
