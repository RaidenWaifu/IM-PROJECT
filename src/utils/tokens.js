
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET must be configured with at least 32 characters'
  );
}

function createAccessToken(user) {
  return jwt.sign(
    {
      roleId: user.roleId,
      roleName: user.roleName
    },
    JWT_SECRET,
    {
      subject: String(user.userId),
      expiresIn: '15m',
      issuer: 'fleettrack-api',
      audience: 'fleettrack-client'
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'fleettrack-api',
    audience: 'fleettrack-client',
    algorithms: ['HS256']
  });
}

module.exports = {
  createAccessToken,
  verifyAccessToken
};
