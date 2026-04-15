const pool = require('../config/db');

exports.getPendingProfiles = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM profiles WHERE verified = 0'
  );
  return rows;
};

exports.verifyProfile = async (profileId) => {
  await pool.query(
    'UPDATE profiles SET verified = 1 WHERE id = ?',
    [profileId]
  );
  return true;
};

exports.suspendUser = async (userId) => {
  await pool.query(
    'DELETE FROM users WHERE id = ?',
    [userId]
  );
  return true;
};
