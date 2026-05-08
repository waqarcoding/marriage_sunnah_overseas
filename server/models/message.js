'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, {
        as: 'sender',
        foreignKey: 'sender_id',
        onDelete: 'CASCADE',
      });
      Message.belongsTo(models.User, {
        as: 'receiver',
        foreignKey: 'receiver_id',
        onDelete: 'CASCADE',
      });

      Message.belongsTo(models.Interest, {
        as: 'interest',
        foreignKey: 'interest_id',
        onDelete: 'CASCADE',
      });
    }
  }

  Message.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    interest_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.TEXT, // ✅ Changed from JSON to TEXT
      defaultValue: null,
      allowNull: true,
    },
    is_seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'Messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
      { fields: ['sender_id'], name: 'messages_sender_id_idx' },
      { fields: ['receiver_id'], name: 'messages_receiver_id_idx' },
      { fields: ['interest_id'], name: 'messages_interest_id_idx' },
    ],
  });

  return Message;
};