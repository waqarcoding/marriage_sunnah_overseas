
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Prefs', {
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
      pref_gender: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pref_age_min: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      pref_age_max: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      pref_marital_status: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pref_nationality: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pref_country: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pref_city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pref_religion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pref_sect: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pref_religious_practice_level: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pref_height_min_inches: {
        type: Sequelize.TINYINT,
        allowNull: true
      },
      pref_height_max_inches: {
        type: Sequelize.TINYINT,
        allowNull: true
      },
      pref_body_type: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pref_caste: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pref_mother_tongue: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pref_education: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pref_employment_type: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pref_monthly_salary: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pref_has_children: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pref_willing_to_relocate: {
        type: Sequelize.TINYINT,
        allowNull: true
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Prefs');
  }
};
