
const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const originalLoad = Module._load;

let mockLogin;
let mockCreateAccessToken;

function loadController() {
  Module._load = function (request, parent, isMain) {
    if (request === '../services/authService') {
      return { login: mockLogin };
    }

    if (request === '../utils/tokens') {
      return { createAccessToken: mockCreateAccessToken };
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  delete require.cache[require.resolve('../src/controllers/authController')];

  return require('../src/controllers/authController');
}

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

afterEach(() => {
  Module._load = originalLoad;
  delete require.cache[require.resolve('../src/controllers/authController')];
});

test('returns a token and safe user details after successful login', async () => {
  mockLogin = async () => ({
    userId: 9001,
    username: 'testadmin',
    roleId: 9001,
    roleName: 'Admin'
  });

  mockCreateAccessToken = () => 'mock-access-token';

  const controller = loadController();
  const req = {
    body: { username: 'testadmin', password: 'correct-password' }
  };
  const res = makeResponse();

  await controller.login(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.token, 'mock-access-token');
  assert.equal(res.body.user.username, 'testadmin');
  assert.equal(res.body.user.roleName, 'Admin');
  assert.equal('password' in res.body.user, false);
  assert.equal('password_hash' in res.body.user, false);
});

test('rejects missing username or password', async () => {
  mockLogin = async () => {
    throw new Error('Should not call login service');
  };
  mockCreateAccessToken = () => 'unused';

  const controller = loadController();
  const res = makeResponse();

  await controller.login({ body: { username: 'testadmin' } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Username and password are required');
});

test('returns a generic error for invalid credentials', async () => {
  mockLogin = async () => null;
  mockCreateAccessToken = () => 'unused';

  const controller = loadController();
  const res = makeResponse();

  await controller.login(
    { body: { username: 'testadmin', password: 'wrong-password' } },
    res
  );

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'Invalid username or password');
});

test('returns a generic server error if login fails unexpectedly', async () => {
  mockLogin = async () => {
    throw new Error('Simulated database failure');
  };
  mockCreateAccessToken = () => 'unused';

  const controller = loadController();
  const res = makeResponse();

  await controller.login(
    { body: { username: 'testadmin', password: 'some-password' } },
    res
  );

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, 'Unable to process login');
});
