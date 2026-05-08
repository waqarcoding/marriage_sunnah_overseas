'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Referral extends Model {
        static associate(models) {
            // User who shared the referral link (earns commission)
            Referral.belongsTo(models.User, {
                foreignKey: 'referrer_id',
                as: 'referrer',
                onDelete: 'CASCADE',
            });

            // User who signed up using the referral link
            Referral.belongsTo(models.User, {
                foreignKey: 'referred_user_id',
                as: 'referredUser',
                onDelete: 'CASCADE',
            });
        }
    }

    Referral.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        referrer_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            comment: 'User who shared the referral link (earns commission)'
        },
        referred_user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            comment: 'User who signed up using the referral link'
        },
        referral_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Unique referral code for record keeping'
        },
        commission_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 10.00,
            comment: 'Percentage of commission (0-100)'
        },
        credits_earned_by_referred: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: 'Total credits earned by the referred user'
        },
        commission_earned: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: 'Commission credits earned by referrer (added to rcredit)'
        },
        activated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'When the referred user completed activation'
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Expiration date for commission eligibility'
        }
    }, {
        sequelize,
        modelName: 'Referral',
        tableName: 'Referrals',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['referrer_id'], name: 'referrals_referrer_idx' },
            { fields: ['referred_user_id'], name: 'referrals_referred_idx' },
            { fields: ['referral_code'], name: 'referrals_code_idx' },
            {
                unique: true,
                fields: ['referred_user_id'],
                name: 'referrals_unique_referred_user'
            }
        ],
        hooks: {
            beforeSave: async (referral) => {
                // Auto-calculate commission based on percentage
                // @ts-ignore
                if (referral.changed('credits_earned_by_referred') || referral.changed('commission_percentage')) {
                    // @ts-ignore
                    referral.commission_earned = (
                        // @ts-ignore
                        (referral.credits_earned_by_referred * referral.commission_percentage) / 100
                    ).toFixed(2);
                }
            }
        }
    });

    return Referral;
};