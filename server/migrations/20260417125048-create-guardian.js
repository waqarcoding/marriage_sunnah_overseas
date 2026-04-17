'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Guardians', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      individual_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      guardian_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      relationship: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
    await queryInterface.addIndex('Guardians', ['individual_id', 'guardian_id'], {
      unique: true,
      name: 'guardians_individual_id_guardian_id_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Guardians');
  }
};
