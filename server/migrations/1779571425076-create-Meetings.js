
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Meetings', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      match_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      user1_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      user2_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      user1_guardian_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      user2_guardian_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      user1_guardian_attending: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      user2_guardian_attending: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      platform_team_attending: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      platform_team_member_id: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      platform_team_role: {
        type: Sequelize.ENUM('moderator', 'observer', 'mediator'),
        allowNull: true
      },
      proposed_by: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      meeting_datetime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      meeting_type: {
        type: Sequelize.ENUM('video_call', 'phone', 'in_person'),
        allowNull: true
      },
      meeting_link: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      meeting_password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      google_calendar_event_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location_lat: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      location_lng: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('proposed', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
        allowNull: true
      },
      user1_confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      user2_confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      user1_guardian_confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      user2_guardian_confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      agenda: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      feedback_user1: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      feedback_user2: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rating_user1: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      rating_user2: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cancelled_by: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ended_at: {
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
    await queryInterface.dropTable('Meetings');
  }
};
