
function authorizeRole(...allowedRoles) {
  return function (req, res, next) {
    // Authentication middleware must run before this middleware.
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return res.status(403).json({
        error: 'You do not have permission to perform this action'
      });
    }

    return next();
  };
}

module.exports = { authorizeRole };
