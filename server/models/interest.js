'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Interest extends Model {
    static associate(models) {
      Interest.belongsTo(models.Profile, { foreignKey: 'from_user', targetKey: 'individual_id', as: 'fromProfile' });
      Interest.belongsTo(models.Profile, { foreignKey: 'to_user', targetKey: 'individual_id', as: 'toProfile' });

      Interest.hasMany(models.Message, { foreignKey: 'interest_id', as: 'messages' });
      Interest.hasOne(models.Match, {
        foreignKey: 'interest_id',
        as: 'match'
      });
    }
  }

  Interest.init(
    {
      status: { type: DataTypes.ENUM('pending', 'accepted', 'declined'), allowNull: false, defaultValue: 'pending' },
      guardian_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      from_user: { type: DataTypes.BIGINT, allowNull: false },
      to_user: { type: DataTypes.BIGINT, allowNull: false },
      is_super_like: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_mutual: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Interest',
      tableName: 'Interests',
      underscored: true,
      timestamps: true,
    }
  );

  return Interest;
};
