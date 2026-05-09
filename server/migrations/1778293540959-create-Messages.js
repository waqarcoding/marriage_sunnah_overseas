
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      sender_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      receiver_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      interest_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      deletedBy: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_seen: {
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
    await queryInterface.dropTable('Messages');
  }
};
