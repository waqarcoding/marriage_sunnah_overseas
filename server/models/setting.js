'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Setting extends Model {
        static associate(models) {
            // no associations needed — global settings table
        }

        // ── Helper: get parsed profile_options ────────────────────────────
        static async getOptions() {
            const row = await this.findOne({ order: [['id', 'ASC']] });
            if (!row) return null;
            try {
                const value = row.get('profile_options');
                return typeof value === 'string' ? JSON.parse(value) : value;
            } catch {
                return null;
            }
        }


        // ── Helper: update profile_options ────────────────────────────────
        static async setOptions(value) {
            const stringified = typeof value === 'string' ? value : JSON.stringify(value);
            const row = await Setting.findOne({ order: [['id', 'ASC']] });
            if (row) {
                await row.update({ profile_options: stringified });
            } else {
                await Setting.create({ profile_options: stringified });
            }
        }
    }

    Setting.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        profile_options: {
            type: DataTypes.TEXT('long'),  // ✅ correct — not LONGTEXT
            allowNull: false,
            comment: 'JSON stringified — contains OPTIONS, COUNTRY_OPTIONS, SALARY_BY_CURRENCY',
        },
    }, {
        sequelize,
        modelName: 'Setting',
        tableName: 'Settings',
        timestamps: true,
        underscored: true,
    });

    return Setting;
};