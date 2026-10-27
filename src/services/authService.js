
const pool = require('../db');
const { verifyPassword } = require('../utils/passwords');

async function login(username, password) {
  if (
    typeof username !== 'string' ||
    username.trim() === '' ||
    typeof password !== 'string' ||
    password.length === 0
  ) {
    return null;
  }

  const query = `
    SELECT
      ua.user_id,
      ua.username,
      ua.password_hash,
      ua.account_status,
      r.role_id,
      r.role_name
    FROM public.user_account AS ua
    JOIN public.role AS r
      ON r.role_id = ua.role_id
    WHERE ua.username = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [username.trim()]);
  const user = result.rows[0];

  if (!user || user.account_status !== 'Active') {
    return null;
  }

  const passwordIsValid = await verifyPassword(
    password,
    user.password_hash
  );

  if (!passwordIsValid) {
    return null;
  }

  return {
    userId: user.user_id,
    username: user.username,
    roleId: user.role_id,
    roleName: user.role_name
  };
}

module.exports = { login };
