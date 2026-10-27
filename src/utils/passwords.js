
const {
  randomBytes,
  scrypt,
  timingSafeEqual
} = require('node:crypto');

const { promisify } = require('node:util');

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new TypeError('Password must be a non-empty string');
  }

  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);

  return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  if (
    typeof password !== 'string' ||
    typeof storedHash !== 'string'
  ) {
    return false;
  }

  const parts = storedHash.split('$');

  if (
    parts.length !== 3 ||
    parts[0] !== 'scrypt' ||
    !/^[a-f0-9]{32}$/i.test(parts[1]) ||
    !/^[a-f0-9]{128}$/i.test(parts[2])
  ) {
    return false;
  }

  const salt = Buffer.from(parts[1], 'hex');
  const expectedHash = Buffer.from(parts[2], 'hex');

  const actualHash = await scryptAsync(
    password,
    salt,
    KEY_LENGTH
  );

  return timingSafeEqual(actualHash, expectedHash);
}

module.exports = {
  hashPassword,
  verifyPassword
};
