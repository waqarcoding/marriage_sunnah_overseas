
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
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
      type: {
        type: Sequelize.ENUM('interest_received', 'interest_accepted', 'interest_declined', 'interest_cancelled', 'interest_count', 'new_match', 'guardian_assigned', 'guardian_removed', 'ward_added', 'ward_removed', 'guardian_approved', 'guardian_rejected', 'guardian_pending_count', 'new_message', 'chat_count_update', 'credit_update'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_read: {
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
    await queryInterface.dropTable('Notifications');
  }
};
