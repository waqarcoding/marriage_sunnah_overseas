'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Guardians', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      individual_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      guardian_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      image: {
        type: Sequelize.STRING,
        allowNull: true,
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

    // Foreign key → Users table for individual
    await queryInterface.addConstraint('Guardians', {
      fields: ['individual_id'],
      type: 'foreign key',
      name: 'fk_guardians_individual',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Foreign key → Users table for guardian
    await queryInterface.addConstraint('Guardians', {
      fields: ['guardian_id'],
      type: 'foreign key',
      name: 'fk_guardians_guardian',
      references: {
        table: 'Users',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Unique constraint to prevent duplicates
    await queryInterface.addConstraint('Guardians', {
      fields: ['individual_id', 'guardian_id'],
      type: 'unique',
      name: 'unique_individual_guardian',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Guardians');
  },
};