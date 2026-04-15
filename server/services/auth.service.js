const pool = require('../config/db');

exports.loginOrRegister = async (email) => {
  // check existing user
  const [users] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  // users is an array of rows
  if (users.length > 0) {
    return users[0];
  }

  // create new user
  const [result] = await pool.query(
    'INSERT INTO users (email, role) VALUES (?, ?)',
    [email, 'individual']
  );

  // result is an object with insertId
  return {
    id: result.insertId,
    email,
    role: 'individual',
  };
};
