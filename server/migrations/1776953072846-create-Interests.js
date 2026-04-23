
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Interests', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'declined'),
        allowNull: false
      },
      from_user: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      from_guardian: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      from_guardian_status: {
        type: Sequelize.ENUM('pending', 'accepted', 'declined'),
        allowNull: true
      },
      to_user: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      to_guardian: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      to_guardian_status: {
        type: Sequelize.ENUM('pending', 'accepted', 'declined'),
        allowNull: true
      },
      both_guardians_approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      both_users_approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      is_super_like: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      is_mutual: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('Interests');
  }
};
