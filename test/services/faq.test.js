const assert = require('assert');
const app = require('../../src/app');

describe('\'FAQ\' service', () => {
  it('registered the service', () => {
    const service = app.service('faq');

    assert.ok(service, 'Registered the service');
  });
});
