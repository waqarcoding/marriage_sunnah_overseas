
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM,
        allowNull: true
      },
      avatar_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_online: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      is_suspended: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      is_premium: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('Users');
  }
};
