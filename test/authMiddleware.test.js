
require('dotenv').config();

const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const originalLoad = Module._load;
let tokenError = null;
let nextCalled = false;
let responseStatus;
let responseBody;

const fakeTokens = {
  verifyAccessToken(token) {
    if (tokenError) {
      throw tokenError;
    }

    if (token === 'valid-test-token') {
      return {
        sub: '9001',
        roleId: 9001,
        roleName: 'Admin'
      };
    }

    throw new Error('Unexpected test token');
  }
};

Module._load = function (request, parent, isMain) {
  if (
    parent &&
    parent.filename.endsWith('authMiddleware.js') &&
    request === '../utils/tokens'
  ) {
    return fakeTokens;
  }

  return originalLoad.call(this, request, parent, isMain);
};

const { authenticateToken } = require('../src/middleware/authMiddleware');

function makeResponse() {
  return {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };
}

function resetState() {
  tokenError = null;
  nextCalled = false;
  responseStatus = undefined;
  responseBody = undefined;
}

test('accepts a valid bearer token and attaches the user', () => {
  resetState();

  const req = {
    headers: { authorization: 'Bearer valid-test-token' }
  };

  authenticateToken(req, makeResponse(), () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    userId: '9001',
    roleId: 9001,
    roleName: 'Admin'
  });
});

test('rejects a missing authorization header', () => {
  resetState();

  authenticateToken(
    { headers: {} },
    makeResponse(),
    () => { nextCalled = true; }
  );

  assert.equal(responseStatus, 401);
  assert.equal(nextCalled, false);
});

test('rejects an empty bearer token', () => {
  resetState();

  authenticateToken(
    { headers: { authorization: 'Bearer ' } },
    makeResponse(),
    () => { nextCalled = true; }
  );

  assert.equal(responseStatus, 401);
  assert.equal(nextCalled, false);
});

test('rejects invalid or expired tokens', () => {
  resetState();
  tokenError = new Error('Token expired');

  authenticateToken(
    { headers: { authorization: 'Bearer expired-test-token' } },
    makeResponse(),
    () => { nextCalled = true; }
  );

  assert.equal(responseStatus, 401);
  assert.deepEqual(responseBody, {
    error: 'Invalid or expired authentication token'
  });
  assert.equal(nextCalled, false);
});
