
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

      name: {
        type: Sequelize.STRING,
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
        type: Sequelize.ENUM('individual', 'guardian', 'admin', 'staff'),
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
      is_pro: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      frontid_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      backid_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      credits: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rcredits: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      stripe_customer_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      subscription_expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      contact_reveals_remaining: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unlimited_contact_reveals: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      last_seen: {
        type: Sequelize.DATE,
        allowNull: true
      },
      show_last_seen: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      is_blurred_images: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      user_pin: {
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
    await queryInterface.dropTable('Users');
  }
};
