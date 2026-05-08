'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Preference extends Model {
        static associate(models) {
            // FIX: added onDelete CASCADE — when a Profile is deleted, its Preference goes too
            Preference.belongsTo(models.Profile, {
                foreignKey: 'individual_id',
                targetKey: 'individual_id',
                as: 'profile',
                onDelete: 'CASCADE',
            });
        }
    }

    Preference.init({
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        individual_id: { type: DataTypes.BIGINT, allowNull: false },

        pref_gender: { type: DataTypes.STRING, allowNull: true },
        pref_age_min: { type: DataTypes.INTEGER, allowNull: true },
        pref_age_max: { type: DataTypes.INTEGER, allowNull: true },
        pref_marital_status: { type: DataTypes.TEXT, allowNull: true },
        pref_nationality: { type: DataTypes.TEXT, allowNull: true },
        pref_country: { type: DataTypes.TEXT, allowNull: true },
        pref_city: { type: DataTypes.STRING, allowNull: true },
        pref_religion: { type: DataTypes.STRING, allowNull: true },
        pref_sect: { type: DataTypes.TEXT, allowNull: true },
        pref_religious_practice_level: { type: DataTypes.STRING, allowNull: true },
        pref_height_min_inches: { type: DataTypes.TINYINT, allowNull: true },
        pref_height_max_inches: { type: DataTypes.TINYINT, allowNull: true },
        pref_body_type: { type: DataTypes.TEXT, allowNull: true },
        pref_caste: { type: DataTypes.TEXT, allowNull: true },
        pref_mother_tongue: { type: DataTypes.TEXT, allowNull: true },
        pref_education: { type: DataTypes.STRING, allowNull: true },
        pref_employment_type: { type: DataTypes.TEXT, allowNull: true },
        pref_monthly_salary: { type: DataTypes.STRING, allowNull: true },
        pref_has_children: { type: DataTypes.STRING, allowNull: true },
        pref_willing_to_relocate: { type: DataTypes.TINYINT(1), allowNull: true },
    }, {
        sequelize,
        modelName: 'Preference',
        tableName: 'Prefs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',

        // FIX: named index — prevents duplication on repeated sync() calls
        indexes: [
            { unique: true, fields: ['individual_id'], name: 'prefs_individual_id_unique' },
        ],
    });

    return Preference;
};
