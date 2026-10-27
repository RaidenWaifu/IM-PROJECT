
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { authorizeRole } = require('../src/middleware/authorizeRole');

function makeResponse() {
  return {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('allows a permitted role', () => {
  const req = { user: { roleName: 'Admin' } };
  const res = makeResponse();
  let nextCalled = false;

  authorizeRole('Admin', 'Fleet Manager')(
    req,
    res,
    () => { nextCalled = true; }
  );

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('rejects a role that is not permitted', () => {
  const req = { user: { roleName: 'Inspector' } };
  const res = makeResponse();
  let nextCalled = false;

  authorizeRole('Admin', 'Fleet Manager')(
    req,
    res,
    () => { nextCalled = true; }
  );

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
});

test('rejects a request without an authenticated user', () => {
  const req = {};
  const res = makeResponse();
  let nextCalled = false;

  authorizeRole('Admin')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test('does not allow a similar but different role name', () => {
  const req = { user: { roleName: 'admin' } };
  const res = makeResponse();

  authorizeRole('Admin')(req, res, () => {});

  assert.equal(res.statusCode, 403);
});
