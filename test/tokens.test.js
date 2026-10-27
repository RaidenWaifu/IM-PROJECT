require('dotenv').config();

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  createAccessToken,
  verifyAccessToken
} = require('../src/utils/tokens');

const testUser = {
  userId: 9001,
  roleId: 9001,
  roleName: 'Admin'
};

test('creates a token containing the user ID and role', () => {
  const token = createAccessToken(testUser);
  const decoded = verifyAccessToken(token);

  assert.equal(decoded.sub, '9001');
  assert.equal(decoded.roleId, 9001);
  assert.equal(decoded.roleName, 'Admin');
  assert.equal(decoded.iss, 'fleettrack-api');
  assert.equal(decoded.aud, 'fleettrack-client');
});

test('sets an expiration approximately 15 minutes ahead', () => {
  const beforeCreation = Math.floor(Date.now() / 1000);
  const token = createAccessToken(testUser);
  const decoded = verifyAccessToken(token);
  const afterCreation = Math.floor(Date.now() / 1000);

  assert.ok(decoded.iat >= beforeCreation);
  assert.ok(decoded.iat <= afterCreation);
  assert.equal(decoded.exp - decoded.iat, 15 * 60);
});

test('rejects a token with an invalid signature', () => {
  const token = createAccessToken(testUser);
  const modifiedToken = `${token.slice(0, -1)}x`;

  assert.throws(
    () => verifyAccessToken(modifiedToken),
    { name: 'JsonWebTokenError' }
  );
});

test('rejects a malformed token', () => {
  assert.throws(
    () => verifyAccessToken('not-a-valid-token'),
    { name: 'JsonWebTokenError' }
  );
});
