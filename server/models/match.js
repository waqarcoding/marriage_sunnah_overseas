'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    static associate(models) {
      Match.belongsTo(models.User, {
        foreignKey: 'user1',
        as: 'user_one',
        onDelete: 'CASCADE',
      });
      Match.belongsTo(models.User, {
        foreignKey: 'user2',
        as: 'user_two',
        onDelete: 'CASCADE',
      });

      Match.belongsTo(models.Interest, {
        foreignKey: 'interest_id',
        as: 'interest',
        onDelete: 'CASCADE',
      });

      // NEW: Association with ContactReveal
      Match.hasMany(models.ContactReveal, {
        foreignKey: 'match_id',
        as: 'contactReveals',
        onDelete: 'SET NULL',
      });
    }
  }

  Match.init({
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user1: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {        // ✅ ADD THIS
        model: 'Users',  // ✅ ADD THIS
        key: 'id'        // ✅ ADD THIS
      }
    },
    user2: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {        // ✅ ADD THIS
        model: 'Users',  // ✅ ADD THIS
        key: 'id'        // ✅ ADD THIS
      }
    },
    interest_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {           // ✅ ADD THIS
        model: 'Interests', // ✅ ADD THIS (capital I)
        key: 'id'           // ✅ ADD THIS
      }
    },
    is_seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Match',
    tableName: 'Matches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
      { fields: ['user1'], name: 'matches_user1_idx' },
      { fields: ['user2'], name: 'matches_user2_idx' },
      { fields: ['interest_id'], name: 'matches_interest_id_idx' },
    ],
  });

  return Match;
};