'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Option extends Model {
        static associate(models) {
            // no associations needed
        }

        // ── Get global options row (country IS NULL) ───────────────────────
        static async getGlobal() {
            const row = await Option.findOne({ where: { country: null } });
            if (!row) return null;
            // @ts-ignore
            return {
                // @ts-ignore
                religions: Option._parse(row['religions']),
                // @ts-ignore
                sects: Option._parse(row['sects']),
                // @ts-ignore
                castes: Option._parse(row['castes']),
                // @ts-ignore
                marital_statuses: Option._parse(row['marital_statuses']),
                // @ts-ignore
                education_levels: Option._parse(row['education_levels']),
                // @ts-ignore
                body_types: Option._parse(row['body_types']),
                // @ts-ignore
                employment_types: Option._parse(row['employment_types']),
                // @ts-ignore
                has_children: Option._parse(row['has_children']),
                // @ts-ignore
                practice_levels: Option._parse(row['practice_levels']),
                // @ts-ignore
                willing_to_relocate: Option._parse(row['willing_to_relocate']),
                // @ts-ignore
                interests: Option._parse(row['interests']),
                // @ts-ignore
                monthly_salary: Option._parse(row['monthly_salary']),
            };
        }

        // ── Get country-specific row ───────────────────────────────────────
        static async getCountry(countryName) {
            const row = await Option.findOne({ where: { country: countryName } });
            if (!row) return null;
            // @ts-ignore
            return {
                // @ts-ignore
                country: row['country'],
                // @ts-ignore
                flag: row['flag'],
                // @ts-ignore
                currency: row['currency'],
                // @ts-ignore
                nationalities: Option._parse(row['nationalities']),
                // @ts-ignore
                cities: Option._parse(row['cities']),
                // @ts-ignore
                mother_tongues: Option._parse(row['mother_tongues']),
            };
        }

        // ── Get all countries list ─────────────────────────────────────────
        static async getAllCountries() {
            const rows = await Option.findAll({
                where: { country: { [sequelize.Sequelize.Op.not]: null } },
                attributes: ['country', 'flag', 'currency', 'nationalities', 'mother_tongues'],
            });
            // @ts-ignore
            return rows.map(r => ({
                // @ts-ignore
                country: r['country'],
                // @ts-ignore
                flag: r['flag'],
                // @ts-ignore
                currency: r['currency'],
                // @ts-ignore
                nationalities: Option._parse(r['nationalities']),
                // @ts-ignore
                mother_tongues: Option._parse(r['mother_tongues']),
            }));
        }

        // ── Helper: safely parse JSON string → array/object ───────────────
        static _parse(value) {
            if (!value) return [];
            try {
                return typeof value === 'string' ? JSON.parse(value) : value;
            } catch {
                return [];
            }
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
            unique: true,
            comment: 'NULL for global options row, country name for country rows',
        },

        // ── Country-specific fields ────────────────────────────────────────
        flag: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        nationalities: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array e.g. ["Pakistani"]',
        },
        cities: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
            comment: 'JSON array of city names',
        },
        mother_tongues: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array of languages',
        },

        // ── Global options fields (only on country = NULL row) ─────────────
        religions: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        sects: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        castes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        professions: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array of professions',
        },

        marital_statuses: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        all_countries: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        education_levels: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        body_types: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        employment_types: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        has_children: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        practice_levels: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        willing_to_relocate: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        interests: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array',
        },
        monthly_salary: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
            comment: 'JSON object { PKR: [...], AED: [...], ... }',
        },
    }, {
        sequelize,
        modelName: 'Option',
        tableName: 'Options',
        timestamps: true,
        underscored: true,
    });

    return Option;
};