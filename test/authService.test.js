
const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const originalLoad = Module._load;
let databaseResponse;
let databaseError;
let capturedQuery;
let capturedParams;
let passwordCheckResult = true;
let passwordCheckCalls = 0;

const fakePool = {
  query: async (query, params) => {
    capturedQuery = query;
    capturedParams = params;

    if (databaseError) {
      throw databaseError;
    }

    return databaseResponse;
  }
};

const fakePasswords = {
  verifyPassword: async (password, storedHash) => {
    passwordCheckCalls++;
    assert.equal(password, 'Correct-Test-Password');
    assert.equal(storedHash, 'scrypt$test-salt$test-hash');
    return passwordCheckResult;
  }
};

// Replace only the dependencies used by authService.
Module._load = function (request, parent, isMain) {
  if (parent && parent.filename.endsWith('authService.js')) {
    if (request === '../db') return fakePool;
    if (request === '../utils/passwords') return fakePasswords;
  }

  return originalLoad.call(this, request, parent, isMain);
};

const { login } = require('../src/services/authService');

afterEach(() => {
  databaseResponse = undefined;
  databaseError = undefined;
  capturedQuery = undefined;
  capturedParams = undefined;
  passwordCheckResult = true;
  passwordCheckCalls = 0;
});

test('login accepts valid credentials for an active user', async () => {
  databaseResponse = {
    rows: [{
      user_id: 9001,
      username: 'testadmin',
      password_hash: 'scrypt$test-salt$test-hash',
      account_status: 'Active',
      role_id: 9001,
      role_name: 'Admin'
    }]
  };

  const result = await login('testadmin', 'Correct-Test-Password');

  assert.deepEqual(result, {
    userId: 9001,
    username: 'testadmin',
    roleId: 9001,
    roleName: 'Admin'
  });

  assert.equal(Object.hasOwn(result, 'password_hash'), false);
  assert.deepEqual(capturedParams, ['testadmin']);
  assert.match(capturedQuery, /WHERE ua\.username = \$1/);
});

test('login rejects an incorrect password', async () => {
  databaseResponse = {
    rows: [{
      user_id: 9001,
      username: 'testadmin',
      password_hash: 'scrypt$test-salt$test-hash',
      account_status: 'Active',
      role_id: 9001,
      role_name: 'Admin'
    }]
  };
  passwordCheckResult = false;

  const result = await login('testadmin', 'Correct-Test-Password');

  assert.equal(result, null);
});

test('login rejects accounts that are not exactly Active', async () => {
  for (const status of ['Inactive', 'Suspended', null, 'active']) {
    databaseResponse = {
      rows: [{
        user_id: 9001,
        username: 'testadmin',
        password_hash: 'scrypt$test-salt$test-hash',
        account_status: status,
        role_id: 9001,
        role_name: 'Admin'
      }]
    };

    const result = await login('testadmin', 'Correct-Test-Password');

    assert.equal(result, null);
  }

  assert.equal(passwordCheckCalls, 0);
});

test('login rejects a username that does not exist', async () => {
  databaseResponse = { rows: [] };

  const result = await login('unknown-user', 'Correct-Test-Password');

  assert.equal(result, null);
});

test('login rejects invalid inputs without querying the database', async () => {
  for (const [username, password] of [
    ['', 'password'],
    ['   ', 'password'],
    [null, 'password'],
    ['testadmin', ''],
    ['testadmin', null]
  ]) {
    const result = await login(username, password);
    assert.equal(result, null);
  }

  assert.equal(capturedQuery, undefined);
});

test('login propagates database errors to its caller', async () => {
  databaseError = new Error('Simulated database failure');

  await assert.rejects(
    login('testadmin', 'Correct-Test-Password'),
    /Simulated database failure/
  );
});
