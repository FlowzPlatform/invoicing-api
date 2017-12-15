

module.exports = {
  before: {
    all: [],
    find: [],
    get: [
      hook => beforeGet(hook)
    ],
    create: [
      hook => beforecreate(hook)
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

beforecreate = hook => {
  console.log(hook)
}

beforeGet = hook => {
  console.log(hook)
  hook.result = "any data"
}

