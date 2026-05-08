'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Option extends Model {
        static associate(models) { }

        // ── Get global options row (country IS NULL) ───────────────────────
        static async getGlobal() {
            const row = await Option.findOne({ where: { country: null } });
            if (!row) return null;
            const g = (k) => row.getDataValue ? row.getDataValue(k) : row[k];
            return {
                religions: Option._parse(g('religions')),
                sects: Option._parse(g('sects')),
                castes: Option._parse(g('castes')),
                marital_statuses: Option._parse(g('marital_statuses')),
                education_levels: Option._parse(g('education_levels')),
                body_types: Option._parse(g('body_types')),
                employment_types: Option._parse(g('employment_types')),
                has_children: Option._parse(g('has_children')),
                practice_levels: Option._parse(g('practice_levels')),
                willing_to_relocate: Option._parse(g('willing_to_relocate')),
                interests: Option._parse(g('interests')),
                monthly_salary: Option._parse(g('monthly_salary')),
                professions: Option._parse(g('professions')),
                all_countries: Option._parse(g('all_countries')),
                mother_tongues: Option._parse(g('mother_tongues')),
                nationalities: Option._parse(g('nationalities')),
                // ✅ new constants fields
                family_backgrounds: Option._parse(g('family_backgrounds')),
                about_me: Option._parse(g('about_me')),
                relationship_options: Option._parse(g('relationship_options')),
            };
        }

        // ── Get country-specific row ───────────────────────────────────────
        static async getCountry(countryName) {
            const row = await Option.findOne({ where: { country: countryName } });
            if (!row) return null;
            const g = (k) => row.getDataValue ? row.getDataValue(k) : row[k];
            return {
                country: g('country'),
                flag: g('flag'),
                currency: g('currency'),
                nationalities: Option._parse(g('nationalities')),
                cities: Option._parse(g('cities')),
                mother_tongues: Option._parse(g('mother_tongues')),
                monthly_salary: Option._parse(g('monthly_salary')),
            };
        }

        // ── Get all app countries (non-null country rows) ──────────────────
        static async getAllCountries() {
            const rows = await Option.findAll({
                where: { country: { [sequelize.Sequelize.Op.not]: null } },
                attributes: ['country', 'flag', 'currency', 'nationalities', 'mother_tongues', 'cities', 'monthly_salary'],
            });
            return rows.map(r => {
                const g = (k) => r.getDataValue ? r.getDataValue(k) : r[k];
                return {
                    country: g('country'),
                    flag: g('flag'),
                    currency: g('currency'),
                    nationalities: Option._parse(g('nationalities')),
                    mother_tongues: Option._parse(g('mother_tongues')),
                    cities: Option._parse(g('cities')),
                    monthly_salary: Option._parse(g('monthly_salary')),
                };
            });
        }

        // ── Helper: safely parse JSON string → array/object ───────────────
        static _parse(value) {
            if (!value) return [];
            try { return typeof value === 'string' ? JSON.parse(value) : value; }
            catch { return []; }
        }

        // ── Helper: stringify for saving ──────────────────────────────────
        static _stringify(value) {
            if (!value) return null;
            return typeof value === 'string' ? value : JSON.stringify(value);
        }
    }

    Option.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        // ── Country identity (NULL = global row) ──────────────────────────
        country: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: 'options_country_unique',
            comment: 'NULL for global options row, country name for country rows',
        },

        // ── Country-specific fields ────────────────────────────────────────
        flag: { type: DataTypes.STRING(10), allowNull: true },
        currency: { type: DataTypes.STRING(10), allowNull: true },
        nationalities: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        cities: { type: DataTypes.TEXT('long'), allowNull: true, comment: 'JSON array of city names' },
        mother_tongues: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array of languages' },

        // ── Global options fields ──────────────────────────────────────────
        religions: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        sects: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        castes: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        professions: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array of professions' },
        all_countries: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array of 197 world countries' },
        marital_statuses: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        education_levels: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        body_types: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        employment_types: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        has_children: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        practice_levels: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        willing_to_relocate: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        interests: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON array' },
        monthly_salary: { type: DataTypes.TEXT('long'), allowNull: true, comment: 'JSON object { PKR:[...], AED:[...], ... }' },


        family_backgrounds: { type: DataTypes.TEXT('long'), allowNull: true, comment: 'JSON object {muslim:[...], other:[...]}' },
        about_me: { type: DataTypes.TEXT('long'), allowNull: true, comment: 'JSON object {muslim:{Doctor:[...], default:[]}, other:{...}}' },
        relationship_options: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON object {muslim:[...], other:[...]}' },
    }, {
        sequelize,
        modelName: 'Option',
        tableName: 'Options',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            { unique: true, fields: ['country'], name: 'options_country_unique' },
        ],
    });

    return Option;
};