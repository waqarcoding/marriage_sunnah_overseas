// @ts-nocheck
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Guardian extends Model {
    static associate(models) {
      // Guardian belongs to both the individual user and the guardian user
      Guardian.belongsTo(models.User, { foreignKey: 'individual_id', as: 'individual' });
      Guardian.belongsTo(models.User, { foreignKey: 'guardian_id', as: 'guardian' });

      // ✅ Guardian → Profile via individual_id (to get ward's profile)
      Guardian.belongsTo(models.Profile, { foreignKey: 'individual_id', targetKey: 'individual_id', as: 'individualProfile' });


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
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['individual_id', 'guardian_id'] },
      { fields: ['individual_id'] },
      { fields: ['guardian_id'] },
    ],
  });

  return Guardian;
};