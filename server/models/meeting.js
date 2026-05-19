'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Meeting extends Model {
        static associate(models) {
            Meeting.belongsTo(models.Match, {
                foreignKey: 'match_id',
                as: 'match',
                onDelete: 'CASCADE'
            });

            Meeting.belongsTo(models.User, {
                foreignKey: 'user1_id',
                as: 'user1',
                onDelete: 'CASCADE'
            });

            Meeting.belongsTo(models.User, {
                foreignKey: 'user2_id',
                as: 'user2',
                onDelete: 'CASCADE'
            });

            Meeting.belongsTo(models.User, {
                foreignKey: 'user1_guardian_id',
                as: 'user1Guardian',
                onDelete: 'SET NULL'
            });

            Meeting.belongsTo(models.User, {
                foreignKey: 'user2_guardian_id',
                as: 'user2Guardian',
                onDelete: 'SET NULL'
            });

            Meeting.belongsTo(models.User, {
                foreignKey: 'platform_team_member_id',
                as: 'platformModerator',
                onDelete: 'SET NULL'
            });

            Meeting.belongsTo(models.User, {
                foreignKey: 'proposed_by',
                as: 'proposer',
                onDelete: 'SET NULL'
            });

            Meeting.belongsTo(models.User, {
                foreignKey: 'cancelled_by',
                as: 'canceller',
                onDelete: 'SET NULL'
            });
        }
    }

    Meeting.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },

        // Match reference
        match_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Matches',
                key: 'id'
            }
        },

        // Core participants
        user1_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        user2_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },

        // Optional guardians
        user1_guardian_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        user2_guardian_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        user1_guardian_attending: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        user2_guardian_attending: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        // Platform team
        platform_team_attending: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        platform_team_member_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        platform_team_role: {
            type: DataTypes.ENUM('moderator', 'observer', 'mediator'),
            allowNull: true
        },

        // Scheduling
        proposed_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        meeting_datetime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            defaultValue: 60
        },
        timezone: {
            type: DataTypes.STRING(50),
            defaultValue: 'Asia/Karachi'
        },

        // Meeting details
        meeting_type: {
            type: DataTypes.ENUM('video_call', 'phone', 'in_person'),
            defaultValue: 'video_call'
        },
        meeting_link: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Google Meet link'
        },
        meeting_password: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        google_calendar_event_id: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        // Location (for in-person)
        location_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        location_address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        location_lat: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true
        },
        location_lng: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true
        },

        // Status
        status: {
            type: DataTypes.ENUM('proposed', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
            defaultValue: 'proposed'
        },

        // Confirmations
        user1_confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        user2_confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        user1_guardian_confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        user2_guardian_confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        // Content
        agenda: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        admin_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Private admin notes'
        },

        // Post-meeting feedback
        feedback_user1: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feedback_user2: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rating_user1: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: { min: 1, max: 5 }
        },
        rating_user2: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: { min: 1, max: 5 }
        },

        // Cancellation
        cancelled_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        cancellation_reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        // Timestamps
        started_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        ended_at: {
            type: DataTypes.DATE,
            allowNull: true
        }

    }, {
        sequelize,
        modelName: 'Meeting',
        tableName: 'Meetings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['match_id'], name: 'meetings_match_id_idx' },
            { fields: ['user1_id'], name: 'meetings_user1_id_idx' },
            { fields: ['user2_id'], name: 'meetings_user2_id_idx' },
            { fields: ['meeting_datetime'], name: 'meetings_datetime_idx' },
            { fields: ['status'], name: 'meetings_status_idx' }
        ]
    });

    return Meeting;
};