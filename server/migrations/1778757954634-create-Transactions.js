
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
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
      stripe_invoice_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true
      },
      credits_added: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('subscription', 'one_time'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('succeeded', 'failed', 'pending'),
        allowNull: true
      },
      payment_processor: {
        type: Sequelize.ENUM('stripe', 'easypaisa', 'jazzcash'),
        allowNull: false
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payment_method_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Transactions');
  }
};
