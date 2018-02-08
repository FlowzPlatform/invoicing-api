const assert = require('assert');
const app = require('../../src/app');

describe('\'invite\' service', () => {
  it('registered the service', () => {
    const service = app.service('invite');

    assert.ok(service, 'Registered the service');
  });
});
