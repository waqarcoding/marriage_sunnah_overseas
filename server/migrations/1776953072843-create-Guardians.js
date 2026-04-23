
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Guardians', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      individual_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      guardian_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      guardian_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      guardian_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      guardian_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      guardian_relationship: {
        type: Sequelize.STRING,
        allowNull: true
      },
      guardian_image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false
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
    await queryInterface.dropTable('Guardians');
  }
};
