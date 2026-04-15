'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      individual_id: { // profile owner
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      guardian_id: { // optional guardian reference
        type: Sequelize.BIGINT,
        allowNull: true,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      image: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      gender: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      age: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      marital_status: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      country: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      nationality: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      education: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      profession: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      religious_practice_level: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      family_background: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      interests: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },

      relationship: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      contact_hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });

    // Foreign key → Users (individual)
    await queryInterface.addConstraint('Profiles', {
      fields: ['individual_id'],
      type: 'foreign key',
      name: 'fk_profiles_individual',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Foreign key → Users (guardian)
    await queryInterface.addConstraint('Profiles', {
      fields: ['guardian_id'],
      type: 'foreign key',
      name: 'fk_profiles_guardian',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Profiles');
  },
};