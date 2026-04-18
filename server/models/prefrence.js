'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Preference extends Model {
        static associate(models) {
            Preference.belongsTo(models.Profile, { foreignKey: 'individual_id', as: 'profile' });
        }
    }

    Preference.init({
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        individual_id: { type: DataTypes.BIGINT, allowNull: false },
        pref_gender: { type: DataTypes.STRING, allowNull: true },
        pref_age_min: { type: DataTypes.INTEGER, allowNull: true },
        pref_age_max: { type: DataTypes.INTEGER, allowNull: true },
        pref_marital_status: { type: DataTypes.TEXT, allowNull: true }, // stored as JSON string
        pref_nationality: { type: DataTypes.TEXT, allowNull: true }, // stored as JSON string
        pref_country: { type: DataTypes.TEXT, allowNull: true }, // stored as JSON string
        pref_city: { type: DataTypes.STRING, allowNull: true },
        pref_religion: { type: DataTypes.STRING, allowNull: true },
        pref_sect: { type: DataTypes.TEXT, allowNull: true }, // stored as JSON string
        pref_religious_practice_level: { type: DataTypes.STRING, allowNull: true },
        pref_height_min_inches: { type: DataTypes.TINYINT, allowNull: true },
        pref_height_max_inches: { type: DataTypes.TINYINT, allowNull: true },
        pref_body_type: { type: DataTypes.TEXT, allowNull: true }, // stored as JSON string
        pref_caste: { type: DataTypes.TEXT, allowNull: true }, // stored as JSON string
        pref_mother_tongue: { type: DataTypes.TEXT, allowNull: true }, // stored as JSON string
        pref_education: { type: DataTypes.STRING, allowNull: true },
        pref_employment_type: { type: DataTypes.TEXT, allowNull: true }, // stored as JSON string
        pref_monthly_salary: { type: DataTypes.STRING, allowNull: true },
        pref_has_children: { type: DataTypes.STRING, allowNull: true },
        pref_willing_to_relocate: { type: DataTypes.TINYINT(1), allowNull: true },

    }, {
        sequelize,
        modelName: 'Preference',
        tableName: 'Prefs',
        timestamps: true,
        underscored: true,
    });

    return Preference;
};