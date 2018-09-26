const assert = require('assert');
const app = require('../../src/app');

describe('\'cloudinaryupload\' service', () => {
  it('registered the service', () => {
    const service = app.service('cloudinaryupload');

    assert.ok(service, 'Registered the service');
  });
});
