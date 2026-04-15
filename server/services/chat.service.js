const pool = require('../config/db');

exports.getMessages = async (interestId) => {
  const [approval] = await pool.query(
    'SELECT guardian_approved FROM interests WHERE id = ?',
    [interestId]
  );

  if (!approval[0]?.guardian_approved) {
    throw new Error('Guardian approval required');
  }

  const [messages] = await pool.query(
    'SELECT * FROM messages WHERE interest_id = ? ORDER BY created_at ASC',
    [interestId]
  );

  return messages;
};

exports.sendMessage = async (interestId, senderId, message) => {
  const [approval] = await pool.query(
    'SELECT guardian_approved FROM interests WHERE id = ?',
    [interestId]
  );

  if (!approval[0]?.guardian_approved) {
    throw new Error('Chat not allowed');
  }

  await pool.query(
    'INSERT INTO messages (interest_id, sender_id, message) VALUES (?, ?, ?)',
    [interestId, senderId, message]
  );

  return true;
};
