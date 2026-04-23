'use strict';

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.BIGINT,        // ← BIGINT
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: DataTypes.BIGINT,        // ← BIGINT
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.BIGINT,        // ← BIGINT
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    interest_id: {
      type: DataTypes.BIGINT,        // ← BIGINT
      allowNull: true,
    },
    is_seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'Messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Message.associate = (db) => {
    Message.belongsTo(db.User, { as: 'sender', foreignKey: 'sender_id' });
    Message.belongsTo(db.User, { as: 'receiver', foreignKey: 'receiver_id' });
    Message.belongsTo(db.Interest, { as: 'interest', foreignKey: 'interest_id' }); // ← was missing
  };

  return Message;
};