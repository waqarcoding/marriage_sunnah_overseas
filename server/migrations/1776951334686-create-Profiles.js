
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      individual_id: {
        type: Sequelize.BIGINT,
        allowNull: false
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
      education: {
        type: Sequelize.STRING,
        allowNull: true
      },
      profession: {
        type: Sequelize.STRING,
        allowNull: true
      },
      religious_practice_level: {
        type: Sequelize.STRING,
        allowNull: true
      },
      family_background: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      interests: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      relationship: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_hidden: {
        type: Sequelize.TINYINT,
        allowNull: false
      },
      last_seen: {
        type: Sequelize.DATE,
        allowNull: true
      },
      images: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_guardian_required: {
        type: Sequelize.TINYINT,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      religion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sect: {
        type: Sequelize.STRING,
        allowNull: true
      },
      height_inches: {
        type: Sequelize.TINYINT,
        allowNull: true
      },
      body_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      caste: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mother_tongue: {
        type: Sequelize.STRING,
        allowNull: true
      },
      employment_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      monthly_salary: {
        type: Sequelize.STRING,
        allowNull: true
      },
      has_children: {
        type: Sequelize.TINYINT,
        allowNull: true
      },
      willing_to_relocate: {
        type: Sequelize.TINYINT,
        allowNull: true
      },
      is_profile_completed: {
        type: Sequelize.TINYINT,
        allowNull: false
      },
      is_pro: {
        type: Sequelize.TINYINT,
        allowNull: true
      },
      front_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      back_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isblurred_images: {
        type: Sequelize.TINYINT,
        allowNull: false
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Profiles');
  }
};
