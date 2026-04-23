'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    static associate(models) {
      Match.belongsTo(models.User, { foreignKey: 'user1', as: 'user_one' });
      Match.belongsTo(models.User, { foreignKey: 'user2', as: 'user_two' });
      Match.belongsTo(models.Interest, { foreignKey: 'interest_id', as: 'interest' });
    }
  }

  Match.init({
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user1: { type: DataTypes.BIGINT, allowNull: false },
    user2: { type: DataTypes.BIGINT, allowNull: false },
    interest_id: { type: DataTypes.BIGINT, allowNull: true }, // ← was missing
  }, {
    sequelize,
    modelName: 'Match',
    tableName: 'Matches',
    timestamps: true,
    underscored: true,
  });

  return Match;
};