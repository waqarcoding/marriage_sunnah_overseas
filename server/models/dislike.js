'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Dislike extends Model {
        static associate(models) {
            // FIX: associations were commented out — restored with onDelete CASCADE
            // so that when a User is deleted, all their Dislike records are removed
            Dislike.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
                onDelete: 'CASCADE',
            });
            Dislike.belongsTo(models.User, {
                foreignKey: 'target_user_id',
                as: 'targetUser',
                onDelete: 'CASCADE',
            });
        }
    }

    Dislike.init(
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {        // ✅ ADD THIS
                    model: 'Users',  // ✅ ADD THIS
                    key: 'id'        // ✅ ADD THIS
                }
            },
            target_user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {        // ✅ ADD THIS
                    model: 'Users',  // ✅ ADD THIS
                    key: 'id'        // ✅ ADD THIS
                }
            },
            is_mutual: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            is_seen: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'Dislike',
            tableName: 'Dislikes',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            freezeTableName: true,

            // FIX: added named indexes on FK columns and a unique constraint
            // to prevent a user from disliking the same target twice
            indexes: [
                {
                    unique: true,
                    fields: ['user_id', 'target_user_id'],
                    name: 'dislikes_user_target_unique',
                },
                { fields: ['user_id'], name: 'dislikes_user_id_idx' },
                { fields: ['target_user_id'], name: 'dislikes_target_user_id_idx' },
            ],
        }
    );

    return Dislike;
};
