'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Interests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'declined'),
        allowNull: false,
        defaultValue: 'pending'
      },
      guardian_approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      from_user: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      to_user: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      is_super_like: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addConstraint('Interests', {
      fields: ['from_user'],
      type: 'foreign key',
      name: 'fk_interests_from_user_profiles_individual_id',
      references: {
        table: 'Profiles',
        field: 'individual_id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('Interests', {
      fields: ['to_user'],
      type: 'foreign key',
      name: 'fk_interests_to_user_profiles_individual_id',
      references: {
        table: 'Profiles',
        field: 'individual_id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  async down(queryInterface, Sequelize) {
    // To drop ENUM fields in postgres, need to explicitly drop type after dropping the table
    await queryInterface.dropTable('Interests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Interests_status";');
  }
};
