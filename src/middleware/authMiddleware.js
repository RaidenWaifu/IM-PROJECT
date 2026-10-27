
const { verifyAccessToken } = require('../utils/tokens');

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication token required'
    });
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({
      error: 'Authentication token required'
    });
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.sub,
      roleId: payload.roleId,
      roleName: payload.roleName
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired authentication token'
    });
  }
}

module.exports = { authenticateToken };
