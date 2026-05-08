'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Subscription extends Model {
        static associate(models) {
            Subscription.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
            });
        }
    }

    Subscription.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        // ✅ NEW: Universal transaction reference
        transaction_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Reference to transaction ID (for EasyPaisa/JazzCash orders)'
        },
        // ✅ UPDATED: Made optional since only Stripe uses this
        stripe_subscription_id: {
            type: DataTypes.STRING(255),
            allowNull: true, // ✅ Changed to nullable
            unique: 'subscriptions_stripe_sub_unique',
            comment: 'Stripe subscription ID (Stripe only)'
        },
        // ✅ UPDATED: Made optional for non-Stripe processors
        stripe_price_id: {
            type: DataTypes.STRING(255),
            allowNull: true, // ✅ Changed to nullable
            comment: 'Stripe price ID for the plan (Stripe only)'
        },
        plan_type: {
            type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
            allowNull: false,
            comment: 'Subscription plan type'
        },
        credits_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Credits included in this plan'
        },
        status: {
            type: DataTypes.ENUM('active', 'canceled', 'past_due', 'incomplete', 'upgraded', 'expired'), // ✅ Added 'expired'
            defaultValue: 'active',
            comment: 'Current subscription status'
        },
        // ✅ NEW: Payment processor identifier
        payment_processor: {
            type: DataTypes.ENUM('stripe', 'easypaisa', 'jazzcash'),
            defaultValue: 'stripe',
            allowNull: false,
            comment: 'Payment processor used for this subscription'
        },
        current_period_start: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Current billing period start'
        },
        current_period_end: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Current billing period end'
        },
        cancel_at_period_end: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether subscription cancels at period end (Stripe only)'
        },
        previous_credits_carried: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Credits carried over from previous subscription during upgrade'
        },
        // ✅ NEW: Auto-renewal flag (for non-Stripe processors)
        is_auto_renewal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether this subscription auto-renews (false for one-time payments like EasyPaisa/JazzCash)'
        }
    }, {
        sequelize,
        modelName: 'Subscription',
        tableName: 'Subscriptions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { unique: true, fields: ['stripe_subscription_id'], name: 'subscriptions_stripe_sub_unique', where: { stripe_subscription_id: { [sequelize.Sequelize.Op.ne]: null } } }, // ✅ Updated with conditional unique
            { fields: ['user_id'], name: 'subscriptions_user_id_idx' },
            { fields: ['status'], name: 'subscriptions_status_idx' },
            { fields: ['payment_processor'], name: 'subscriptions_processor_idx' }, // ✅ NEW
            { fields: ['transaction_id'], name: 'subscriptions_txn_id_idx' }, // ✅ NEW
            { fields: ['current_period_end'], name: 'subscriptions_period_end_idx' },
        ]
    });

    return Subscription;
};