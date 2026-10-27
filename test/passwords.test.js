
const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  hashPassword,
  verifyPassword
} = require('../src/utils/passwords');

test('hashPassword creates a verifiable password hash', async () => {
  const password = 'FleetTrack-Test-Password-123!';
  const hashedPassword = await hashPassword(password);

  assert.notEqual(hashedPassword, password);
  assert.equal(
    await verifyPassword(password, hashedPassword),
    true
  );
});

test('hashPassword creates different hashes for the same password', async () => {
  const password = 'FleetTrack-Test-Password-123!';

  const firstHash = await hashPassword(password);
  const secondHash = await hashPassword(password);

  assert.notEqual(firstHash, secondHash);
  assert.equal(await verifyPassword(password, firstHash), true);
  assert.equal(await verifyPassword(password, secondHash), true);
});

test('verifyPassword rejects an incorrect password', async () => {
  const hashedPassword = await hashPassword('Correct-Test-Password');

  assert.equal(
    await verifyPassword('Wrong-Test-Password', hashedPassword),
    false
  );
});

test('verifyPassword rejects TEST placeholders and malformed hashes', async () => {
  assert.equal(await verifyPassword('anything', 'TEST'), false);
  assert.equal(await verifyPassword('anything', ''), false);
  assert.equal(await verifyPassword('anything', null), false);
});

test('hashPassword rejects an empty password', async () => {
  await assert.rejects(
    hashPassword(''),
    { name: 'TypeError' }
  );
});
