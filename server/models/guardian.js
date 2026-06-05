// Guardian.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Guardian extends Model {
    static associate(models) {
      Guardian.belongsTo(models.User, {
        foreignKey: 'guardian_id',
        as: 'guardianUser',
        onDelete: 'CASCADE',
      });

      Guardian.belongsTo(models.User, {
        foreignKey: 'individual_id',
        as: 'individual',
        onDelete: 'CASCADE',
      });

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
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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