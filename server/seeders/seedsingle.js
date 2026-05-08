'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    let userId = 1;
    let profileId = 1;
    let matchId = 1;
    let interestId = 1;
    let guardianTableId = 1;

    const users = [];
    const profiles = [];
    const guardians = [];
    const matches = [];
    const interests = [];

    // 1️⃣ Admin user
    users.push({
      id: userId++,
      email: 'admin@gmail.com',
      mobile: '97150000000',
      role: 'admin',
      password_hash: '$2a$12$NU5AaRnpuxYX3OPEoRuy7.Fjod6SmvR12kO9MUjV/ZGXcRTP5cVnW',
      created_at: now,
      updated_at: now
    });

    // 2️⃣ Guardians (Users table)
    const guardianStartId = userId;
    for (let i = 1; i <= 20; i++) {
      users.push({
        id: userId++,
        email: `guardian${i}@example.com`,
        mobile: `9715000${100 + i}`,
        role: 'guardian',
        password_hash: await bcrypt.hash('guardian123', 12),
        created_at: now,
        updated_at: now
      });

      // 2a️⃣ Guardians table
      guardians.push({
        id: guardianTableId++,
        guardian_id: guardianStartId + i - 1, // reference Users.id
        profile_id: null,                      // optional, can link profiles if needed
        name: `Guardian ${i}`,
        image: 'guardian-default-profile.png',
        relationship: i % 2 === 0 ? 'Mother' : 'Father',
        contact_hidden: 1,
        is_verified: 1,
        created_at: now,
        updated_at: now
      });
    }

    // 3️⃣ Individual users (Users table)
    const individualStartId = userId;
    for (let i = 1; i <= 20; i++) {
      const isMale = i <= 10; // first 10 males, next 10 females
      users.push({
        id: userId++,
        email: isMale ? `male${i}@example.com` : `female${i - 10}@example.com`,
        mobile: `9715100${i}`,
        role: 'individual',
        password_hash: await bcrypt.hash('password123', 12),
        created_at: now,
        updated_at: now
      });

      // 3a️⃣ Profiles
      const guardianIndex = guardianStartId + Math.floor((i - 1) / 2); // each guardian manages 2 individuals
      profiles.push({
        id: profileId++,
        user_id: individualStartId + i - 1,  // Users.id of individual
        guardian_id: guardianIndex,          // guardian user id
        name: isMale ? `Male User ${i}` : `Female User ${i - 10}`,
        image: 'default-profile.png',
        gender: isMale ? 'Male' : 'Female',
        date_of_birth: isMale ? '1996-05-10' : '1998-08-15',
        age: isMale ? 28 : 26,
        marital_status: 'Single',
        country: 'UAE',
        city: 'Dubai',
        nationality: 'Pakistani',
        education: 'Bachelors',
        profession: isMale ? 'Engineer' : 'Teacher',
        religious_practice_level: 'Moderate',
        family_background: 'Respectable practicing family',
        is_verified: 1,
        created_at: now,
        updated_at: now
      });
    }

    // 4️⃣ Matches & Interests (male-female pairs)
    for (let i = 1; i <= 10; i++) {
      const maleProfileId = i;
      const femaleProfileId = i + 10;

      // Match table
      matches.push({
        id: matchId++,
        user1: maleProfileId,
        user2: femaleProfileId,
        created_at: now,
        updated_at: now
      });

      // Interests table
      interests.push({
        id: interestId++,
        status: 'pending',
        guardian_approved: 0,
        from_user: maleProfileId,
        to_user: femaleProfileId,
        created_at: now,
        updated_at: now
      });

      interests.push({
        id: interestId++,
        status: 'pending',
        guardian_approved: 0,
        from_user: femaleProfileId,
        to_user: maleProfileId,
        created_at: now,
        updated_at: now
      });
    }

    // 5️⃣ Bulk insert
    await queryInterface.bulkInsert('Users', users);
    await queryInterface.bulkInsert('Profiles', profiles);
    await queryInterface.bulkInsert('Guardians', guardians);
    await queryInterface.bulkInsert('Matches', matches);
    await queryInterface.bulkInsert('Interests', interests);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Interests', null, {});
    await queryInterface.bulkDelete('Matches', null, {});
    await queryInterface.bulkDelete('Guardians', null, {});
    await queryInterface.bulkDelete('Profiles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
