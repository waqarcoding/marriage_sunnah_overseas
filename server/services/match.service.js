const pool = require('../config/db');

exports.getSuggestions = async (currentUserId) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id AS profile_id,
      p.userid,
      p.name,
      p.age,
      p.city,
      p.nationality
    FROM profiles p
    WHERE p.verified = 1
      AND p.userid != ?
      AND p.userid NOT IN (
        SELECT to_user FROM interests WHERE from_user = ?
      )
    `,
    [currentUserId, currentUserId]
  );

  return rows;
};

exports.sendInterest = async (fromUser, toUser) => {
  await pool.query(
    'INSERT INTO interests (from_user, to_user) VALUES (?, ?)',
    [fromUser, toUser]
  );

  return true;
};

exports.getMatches = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.name,
      p.age,
      i.guardian_approved
    FROM interests i
    JOIN profiles p ON p.userid = i.to_user
    WHERE i.from_user = ?
      AND i.status = 'accepted'
    `,
    [userId]
  );

  return rows;
};

exports.guardianApprove = async (interestId) => {
  await pool.query(
    'UPDATE interests SET guardian_approved = 1 WHERE id = ?',
    [interestId]
  );

  return true;
};
