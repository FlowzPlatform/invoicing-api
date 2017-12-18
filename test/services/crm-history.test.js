const assert = require('assert');
const app = require('../../src/app');

describe('\'crm-history\' service', () => {
  it('registered the service', () => {
    const service = app.service('crm-history');

    assert.ok(service, 'Registered the service');
  });
});
