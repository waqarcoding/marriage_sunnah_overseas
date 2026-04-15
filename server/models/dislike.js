'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Dislike extends Model {
        static associate(models) {
            Dislike.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
            Dislike.belongsTo(models.User, { foreignKey: 'target_user_id', as: 'target_user' });
        }
    }

    Dislike.init({
        id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT, allowNull: false },
        target_user_id: { type: DataTypes.BIGINT, allowNull: false },
    }, {
        sequelize,
        modelName: 'Dislike',
        tableName: 'Dislikes',
        timestamps: true,
        underscored: true,
    });

    return Dislike;
};
