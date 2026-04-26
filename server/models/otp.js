'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    static associate(models) {
      Otp.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  }

  Otp.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    otp: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

  }, {
    sequelize,
    modelName: 'Otp',
    tableName: 'Otps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Otp;
};
