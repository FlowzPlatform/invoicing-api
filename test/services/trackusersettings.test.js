const assert = require('assert');
const app = require('../../src/app');

describe('\'trackusersettings\' service', () => {
  it('registered the service', () => {
    const service = app.service('trackusersettings');

    assert.ok(service, 'Registered the service');
  });
});
