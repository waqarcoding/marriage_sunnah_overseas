'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
                onDelete: 'CASCADE',
            });
        }
    }

    Notification.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {        // ✅ ADD THIS
                model: 'Users',  // ✅ ADD THIS
                key: 'id'        // ✅ ADD THIS
            }
        },

        type: {
            type: DataTypes.ENUM(
                // Interest
                'interest_received',
                'interest_accepted',
                'interest_declined',
                'interest_cancelled',
                'interest_count',

                // Match
                'new_match',

                // Guardian
                'guardian_assigned',
                'guardian_removed',
                'ward_added',
                'ward_removed',
                'guardian_approved',
                'guardian_rejected',
                'guardian_pending_count',

                // Chat
                'new_message',
                'chat_count_update',

                // System
                'credit_update'
            ),
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        data: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

    }, {
        sequelize,
        modelName: 'Notification',
        tableName: 'Notifications',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',

        indexes: [
            { fields: ['user_id'], name: 'notifications_user_id_idx' },
            { fields: ['type'], name: 'notifications_type_idx' },
        ],
    });

    return Notification;
};