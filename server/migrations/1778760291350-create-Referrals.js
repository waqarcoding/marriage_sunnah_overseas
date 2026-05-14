
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Referrals', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      referrer_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      referred_user_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      referral_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      commission_percentage: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      credits_earned_by_referred: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      commission_earned: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      activated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Referrals');
  }
};
