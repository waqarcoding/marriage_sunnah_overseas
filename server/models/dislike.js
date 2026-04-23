'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Dislike extends Model {
        static associate(models) {
            // Dislike.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
            // Dislike.belongsTo(models.User, { foreignKey: 'target_user_id', as: 'targetUser' });
        }
    }

    Dislike.init(
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },

            target_user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },

            is_mutual: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
        },
        {
            sequelize,

            modelName: 'Dislike',

            // IMPORTANT: keep consistent naming everywhere
            tableName: 'Dislikes',

            timestamps: true,

            underscored: true,

            // IMPORTANT for DigitalOcean consistency
            freezeTableName: true,
        }
    );

    return Dislike;
};