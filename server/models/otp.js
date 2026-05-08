'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    static associate(models) {
      // FIX: added onDelete CASCADE — when a User is deleted their OTPs go too
      Otp.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
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

    // FIX: named index on user_id FK column
    indexes: [
      { fields: ['user_id'], name: 'otps_user_id_idx' },
    ],
  });

  return Otp;
};
