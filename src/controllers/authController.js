
const authService = require('../services/authService');
const { createAccessToken } = require('../utils/tokens');

async function login(req, res) {
  const { username, password } = req.body || {};

  // Validate the request body.
  if (
    typeof username !== 'string' ||
    username.trim() === '' ||
    typeof password !== 'string' ||
    password.length === 0
  ) {
    return res.status(400).json({
      error: 'Username and password are required'
    });
  }

  try {
    const user = await authService.login(username, password);

    // Use the same response for an unknown username,
    // incorrect password, or account that is not Active.
    if (!user) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    const token = createAccessToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        username: user.username,
        roleId: user.roleId,
        roleName: user.roleName
      }
    });
  } catch (error) {
    console.error('Login failed:', error.message);

    return res.status(500).json({
      error: 'Unable to process login'
    });
  }
}

module.exports = { login };
