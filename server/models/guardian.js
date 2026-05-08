// @ts-nocheck
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Guardian extends Model {
    static associate(models) {
      // FIX: added onDelete CASCADE so when a User row is deleted, all
      // Guardian rows where they are the individual OR the guardian are removed

      Guardian.belongsTo(models.User, {
        foreignKey: 'guardian_id',
        as: 'guardianUser', // ✅ Changed from 'guardian' to avoid conflict
        onDelete: 'CASCADE',
      });

      // Association with the individual/ward (User)
      Guardian.belongsTo(models.User, {
        foreignKey: 'individual_id',
        as: 'individual',
        onDelete: 'CASCADE',
      });

      // Association with individual's profile
      Guardian.belongsTo(models.Profile, {
        foreignKey: 'individual_id',
        targetKey: 'individual_id',
        as: 'individualProfile',
        onDelete: 'CASCADE',
      });

    }
  }

  Guardian.init({
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    individual_id: { type: DataTypes.BIGINT, allowNull: false },
    guardian_id: { type: DataTypes.BIGINT, allowNull: false },

    guardian_name: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    guardian_phone: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
    guardian_email: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    guardian_relationship: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
    guardian_image: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    contact_hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, {
    sequelize,
    modelName: 'Guardian',
    tableName: 'Guardians',
    timestamps: true,
    created_at: 'created_at',
    updated_at: 'updated_at',

    // FIX: stable index names prevent duplicate index creation on repeated sync()
    // Previously these were unnamed and Sequelize would add guardians_individual_id_guardian_id_unique_2,
    // guardians_individual_id_2, guardians_guardian_id_2, etc. on every restart
    indexes: [
      {
        unique: true,
        fields: ['individual_id', 'guardian_id'],
        name: 'guardians_individual_guardian_unique',
      },
      { fields: ['individual_id'], name: 'guardians_individual_id_idx' },
      { fields: ['guardian_id'], name: 'guardians_guardian_id_idx' },
    ],
  });

  return Guardian;
};
