const assert = require('assert');
const app = require('../../src/app');

describe('\'custominvoice\' service', () => {
  it('registered the service', () => {
    const service = app.service('custominvoice');

    assert.ok(service, 'Registered the service');
  });
});
