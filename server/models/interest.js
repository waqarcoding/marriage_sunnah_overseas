'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Interest extends Model {

    // ✅ REMOVED class field declarations — they shadow Sequelize's dataValues
    // proxy and cause interest.from_user to return undefined.
    // Use interest.from_user directly after this fix.

    static associate(models) {
      Interest.belongsTo(models.User, { foreignKey: 'from_user', as: 'fromUser', onDelete: 'CASCADE' });
      Interest.belongsTo(models.User, { foreignKey: 'to_user', as: 'toUser', onDelete: 'CASCADE' });
      Interest.belongsTo(models.Profile, { foreignKey: 'from_user', targetKey: 'individual_id', as: 'fromProfile' });
      Interest.belongsTo(models.Profile, { foreignKey: 'to_user', targetKey: 'individual_id', as: 'toProfile' });
      Interest.hasMany(models.Message, { foreignKey: 'interest_id', as: 'messages', onDelete: 'CASCADE', hooks: true });
      Interest.hasOne(models.Match, { foreignKey: 'interest_id', as: 'match', onDelete: 'CASCADE', hooks: true });
      Interest.belongsTo(models.Guardian, { foreignKey: 'from_guardian', as: 'fromGuardian', onDelete: 'SET NULL' });
      Interest.belongsTo(models.Guardian, { foreignKey: 'to_guardian', as: 'toGuardian', onDelete: 'SET NULL' });
    }

    // ── Instance helpers ──────────────────────────────────────────────────────

    async getFromGuardianRow() {
      const { Guardian } = sequelize.models;
      const fromUserId = this.getDataValue('from_user');
      return await Guardian.findOne({ where: { individual_id: fromUserId } });
    }

    async getToGuardianRow() {
      const { Guardian } = sequelize.models;
      const toUserId = this.getDataValue('to_user');
      return await Guardian.findOne({ where: { individual_id: toUserId } });
    }

    async getBothGuardians() {
      const [fromGuardian, toGuardian] = await Promise.all([
        this.getFromGuardianRow(),
        this.getToGuardianRow(),
      ]);
      return { fromGuardian, toGuardian };
    }

    // ── Computed getters ──────────────────────────────────────────────────────
    get areBothGuardiansApproved() {
      // Checks if both guardians have approved the interest
      return this.getDataValue('from_guardian_status') === 'accepted' &&
        this.getDataValue('to_guardian_status') === 'accepted';
    }
    get areBothUsersApproved() {
      // Checks if both users have approved the interest
      return this.getDataValue('both_users_approved') === true;
    }
    get isFullyApproved() {
      // An interest is fully approved if both users and both guardians approved
      return this.areBothUsersApproved && this.areBothGuardiansApproved;
    }
    get isPending() {
      // Checks if the interest status is 'pending'
      return this.getDataValue('status') === 'pending';
    }
    get isAccepted() {
      // Checks if the interest status is 'accepted'
      return this.getDataValue('status') === 'accepted';
    }
    get isDeclined() {
      // Checks if the interest status is 'declined'
      return this.getDataValue('status') === 'declined';
    }

    // ── Static helpers ────────────────────────────────────────────────────────
    static async getInterestsSent(userId) {
      const { Profile } = sequelize.models;
      return await Interest.findAll({
        where: { from_user: userId, status: 'pending' },
        include: [{ model: Profile, as: 'toProfile' }],
      });
    }

    static async getInterestsReceived(userId) {
      const { Profile } = sequelize.models;
      return await Interest.findAll({
        where: { to_user: userId, status: 'pending' },
        include: [{ model: Profile, as: 'fromProfile' }],
      });
    }
  }

  Interest.init(
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      status: { type: DataTypes.ENUM('pending', 'accepted', 'declined'), allowNull: false, defaultValue: 'pending' },

      from_user: { type: DataTypes.BIGINT, allowNull: false },
      from_guardian: { type: DataTypes.BIGINT, allowNull: true, defaultValue: null },
      from_guardian_status: { type: DataTypes.ENUM('pending', 'accepted', 'declined'), allowNull: true, defaultValue: 'pending' },

      to_user: { type: DataTypes.BIGINT, allowNull: false },
      to_guardian: { type: DataTypes.BIGINT, allowNull: true, defaultValue: null },
      to_guardian_status: { type: DataTypes.ENUM('pending', 'accepted', 'declined'), allowNull: true, defaultValue: 'pending' },

      both_guardians_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      both_users_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_super_like: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_mutual: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_seen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Interest',
      tableName: 'Interests',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { fields: ['from_user'], name: 'interests_from_user_idx' },
        { fields: ['to_user'], name: 'interests_to_user_idx' },
        { fields: ['from_guardian'], name: 'interests_from_guardian_idx' },
        { fields: ['to_guardian'], name: 'interests_to_guardian_idx' },
      ],
    }
  );

  return Interest;
};