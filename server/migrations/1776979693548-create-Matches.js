
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Matches', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      user1: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      user2: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      interest_id: {
        type: Sequelize.BIGINT,
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
    await queryInterface.dropTable('Matches');
  }
};
