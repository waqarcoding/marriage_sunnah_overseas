
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Options', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      flag: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nationalities: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cities: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      mother_tongues: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      religions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sects: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      castes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      professions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      all_countries: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      marital_statuses: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      education_levels: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      body_types: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      employment_types: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      has_children: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      practice_levels: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      willing_to_relocate: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      interests: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      monthly_salary: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      family_backgrounds: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      about_me: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      relationship_options: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('Options');
  }
};
