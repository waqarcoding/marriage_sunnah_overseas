'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
            });
        }
    }

    Transaction.init({
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
        // ✅ NEW: Universal transaction ID (for all processors)
        transaction_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
            comment: 'Universal transaction ID (order ID for EasyPaisa/JazzCash, payment intent for Stripe)'
        },
        // ✅ UPDATED: Made optional since not all processors use this
        stripe_invoice_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Stripe invoice ID for recurring payments (Stripe only)'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Transaction amount'
        },
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'PKR', // ✅ Changed default to PKR
            comment: 'Currency code (USD, PKR, etc.)'
        },
        credits_added: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Number of credits added in this transaction'
        },
        type: {
            type: DataTypes.ENUM('subscription', 'one_time'),
            allowNull: false,
            comment: 'Transaction type'
        },
        status: {
            type: DataTypes.ENUM('succeeded', 'failed', 'pending'),
            defaultValue: 'pending',
            comment: 'Transaction status'
        },
        // ✅ NEW: Payment processor identifier
        payment_processor: {
            type: DataTypes.ENUM('stripe', 'easypaisa', 'jazzcash'),
            defaultValue: 'stripe',
            allowNull: false,
            comment: 'Payment processor used for this transaction'
        },
        // ✅ NEW: Store additional metadata
        metadata: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON string containing additional transaction data (plan type, credits, duration, etc.)'
        },
        // ✅ NEW: Payment method specific details
        payment_method_details: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON string containing payment method specific details (response codes, transaction IDs, etc.)'
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Transaction description'
        }
    }, {
        sequelize,
        modelName: 'Transaction',
        tableName: 'Transactions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { fields: ['user_id'], name: 'transactions_user_id_idx' },
            { fields: ['status'], name: 'transactions_status_idx' },
            { fields: ['type'], name: 'transactions_type_idx' },
            { fields: ['payment_processor'], name: 'transactions_processor_idx' }, // ✅ NEW
            { fields: ['transaction_id'], name: 'transactions_txn_id_idx' }, // ✅ NEW
            { fields: ['created_at'], name: 'transactions_created_at_idx' },
        ]
    });

    return Transaction;
};