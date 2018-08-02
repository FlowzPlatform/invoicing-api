const assert = require('assert');
const app = require('../../src/app');

describe('\'exporttopdf\' service', () => {
  it('registered the service', () => {
    const service = app.service('exporttopdf');

    assert.ok(service, 'Registered the service');
  });
});
