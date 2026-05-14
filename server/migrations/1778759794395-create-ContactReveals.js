
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ContactReveals', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      revealer_user_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      revealed_user_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      match_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      reveal_type: {
        type: Sequelize.ENUM('phone', 'email', 'both'),
        allowNull: false
      },
      credits_used: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_unlimited_plan: {
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
    await queryInterface.dropTable('ContactReveals');
  }
};
