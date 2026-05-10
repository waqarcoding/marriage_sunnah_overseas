
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Subscriptions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stripe_subscription_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stripe_price_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      plan_type: {
        type: Sequelize.ENUM('weekly', 'monthly', 'yearly'),
        allowNull: false
      },
      credits_amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'canceled', 'past_due', 'incomplete', 'upgraded', 'expired'),
        allowNull: true
      },
      payment_processor: {
        type: Sequelize.ENUM('stripe', 'easypaisa', 'jazzcash'),
        allowNull: false
      },
      current_period_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      current_period_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cancel_at_period_end: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      previous_credits_carried: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      is_auto_renewal: {
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
    await queryInterface.dropTable('Subscriptions');
  }
};
