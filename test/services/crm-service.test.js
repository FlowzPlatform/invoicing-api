const assert = require('assert');
const app = require('../../src/app');

describe('\'crm-service\' service', () => {
  it('registered the service', () => {
    const service = app.service('crm-service');

    assert.ok(service, 'Registered the service');
  });
});
