const assert = require('assert');
const app = require('../../src/app');

describe('\'crm-case\' service', () => {
  it('registered the service', () => {
    const service = app.service('crm-case');

    assert.ok(service, 'Registered the service');
  });
});
