// models/FcmToken.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FcmToken extends Model {
    static associate(models) {
      FcmToken.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  }

  FcmToken.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      platform: {
        type: DataTypes.ENUM('android', 'ios'),
        allowNull: false,
        defaultValue: 'android',
      },
    },
    {
      sequelize,
      modelName: 'FcmToken',
      tableName: 'FcmTokens',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { fields: ['user_id'], name: 'fcm_tokens_user_id_idx' },
        { unique: true, fields: ['user_id', 'token'], name: 'fcm_tokens_unique' },
      ],
    }
  );

  return FcmToken;
};
