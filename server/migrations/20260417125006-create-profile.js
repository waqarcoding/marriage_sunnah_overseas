'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      individual_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      guardian_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      marital_status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: true
      },
      religion: {
        type: Sequelize.ENUM('Islam', 'Christian', 'Hindu', 'Other'),
        allowNull: true
      },
      sect: {
        type: Sequelize.ENUM('Sunni', 'Shia', 'Deobandi', 'Barelvi', 'Ahmadiyya', 'Other'),
        allowNull: true
      },
      religious_practice_level: {
        type: Sequelize.STRING,
        allowNull: true
      },
      caste: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      mother_tongue: {
        type: Sequelize.ENUM('Urdu', 'Pashto', 'Punjabi', 'Sindhi', 'Balochi', 'Other'),
        allowNull: true
      },
      height_inches: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true,
        comment: 'Total inches e.g. 68 = 5ft 8in'
      },
      body_type: {
        type: Sequelize.ENUM('Slim', 'Athletic', 'Average', 'Curvy', 'Heavy'),
        allowNull: true
      },
      education: {
        type: Sequelize.STRING,
        allowNull: true
      },
      profession: {
        type: Sequelize.STRING,
        allowNull: true
      },
      employment_type: {
        type: Sequelize.ENUM('Government', 'Private', 'Self-Employed', 'Business', 'Unemployed', 'Other'),
        allowNull: true
      },
      monthly_salary: {
        type: Sequelize.ENUM('No preference', 'Less than PKR 100,000', 'PKR 100,000 - 200,000', 'Above PKR 200,000'),
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      family_background: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      interests: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      has_children: {
        type: Sequelize.TINYINT,
        allowNull: true
      },
      willing_to_relocate: {
        type: Sequelize.TINYINT,
        allowNull: true,
        defaultValue: 0
      },
      relationship: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      last_seen: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
      images: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      guardian_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      guardian_phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      guardian_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      guardian_relationship: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      is_guardian_required: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1
      },
      is_profile_completed: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0
      },
      is_pro: {
        type: Sequelize.TINYINT,
        allowNull: true,
        defaultValue: 0
      },
      front_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      back_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Profiles');
    // Clean up enums if necessary
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Profiles_religion";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Profiles_sect";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Profiles_mother_tongue";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Profiles_body_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Profiles_employment_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Profiles_monthly_salary";');
  }
};
