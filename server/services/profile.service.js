const pool = require('../models/index');
const db = require('../models');
exports.createProfile = async (data) => {
  const {
    userid,
    name,
    gender,
    age,
    city,
    nationality,
    guardian_name,
    guardian_phone,
  } = data;

  await pool.query(
    `INSERT INTO profiles
     (userid, name, gender, age, city, nationality, guardian_name, guardian_phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userid,
      name,
      gender,
      age,
      city,
      nationality,
      guardian_name,
      guardian_phone,
    ]
  );

  return true;
};

exports.getProfileByUser = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM profiles WHERE userid = ?',
    [userId]
  );
  return rows[0];
};
