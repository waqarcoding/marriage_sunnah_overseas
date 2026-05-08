'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ContactReveal extends Model {
        static associate(models) {
            // Who unlocked the contact
            ContactReveal.belongsTo(models.User, {
                foreignKey: 'revealer_user_id',
                as: 'revealer',
                onDelete: 'CASCADE',
            });

            // Whose contact was unlocked
            ContactReveal.belongsTo(models.User, {
                foreignKey: 'revealed_user_id',
                as: 'revealed',
                onDelete: 'CASCADE',
            });

            // Optional: link to the match
            ContactReveal.belongsTo(models.Match, {
                foreignKey: 'match_id',
                as: 'match',
                onDelete: 'SET NULL',
            });
        }
    }

    ContactReveal.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        revealer_user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            comment: 'User who unlocked the contact'
        },
        revealed_user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            comment: 'User whose contact was unlocked'
        },
        match_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'Matches',
                key: 'id'
            },
            onDelete: 'SET NULL',
            comment: 'Associated match ID'
        },
        reveal_type: {
            type: DataTypes.ENUM('phone', 'email', 'both'),
            allowNull: false,
            defaultValue: 'both',
            comment: 'Type of contact information revealed'
        },
        credits_used: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
            comment: 'Number of credits used for this reveal'
        },
        is_unlimited_plan: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether this was revealed using unlimited plan'
        }
    }, {
        sequelize,
        modelName: 'ContactReveal',
        tableName: 'ContactReveals',
        timestamps: true,
        createdAt: 'revealed_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['revealer_user_id'], name: 'contact_reveals_revealer_idx' },
            { fields: ['revealed_user_id'], name: 'contact_reveals_revealed_idx' },
            { fields: ['match_id'], name: 'contact_reveals_match_idx' },
            {
                unique: true,
                fields: ['revealer_user_id', 'revealed_user_id'],
                name: 'contact_reveals_unique_pair'
            },

        ]
    });

    return ContactReveal;
};