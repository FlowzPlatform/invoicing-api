const assert = require('assert');
const app = require('../../src/app');

describe('\'relationshipcomments\' service', () => {
  it('registered the service', () => {
    const service = app.service('relationshipcomments');

    assert.ok(service, 'Registered the service');
  });
});
