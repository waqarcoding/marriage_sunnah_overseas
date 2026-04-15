'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Guardian extends Model {
    static associate(models) {
      Guardian.belongsTo(models.User, { foreignKey: 'individual_id', as: 'individual' });
      Guardian.belongsTo(models.User, { foreignKey: 'guardian_id', as: 'guardian' });
    }
  }

  Guardian.init({
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },

    individual_id: { type: DataTypes.BIGINT, allowNull: false },
    guardian_id: { type: DataTypes.BIGINT, allowNull: false },

    name: { type: DataTypes.STRING, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: true },
    relationship: { type: DataTypes.STRING, allowNull: true },
    contact_hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

  }, {
    sequelize,
    modelName: 'Guardian',
    tableName: 'Guardians',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['individual_id', 'guardian_id'],
      },
    ],
  });

  return Guardian;
};