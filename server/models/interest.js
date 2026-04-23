'use strict';
const { Model } = require('sequelize');

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript type declarations
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} InterestAttributes
 * @property {number}  id
 * @property {string}  status                   - 'pending' | 'accepted' | 'declined'
 * @property {number}  from_user
 * @property {number}  from_guardian
 * @property {string}  from_guardian_status      - 'pending' | 'accepted' | 'declined'
 * @property {number}  to_user
 * @property {number}  to_guardian
 * @property {string}  to_guardian_status        - 'pending' | 'accepted' | 'declined'
 * @property {boolean} both_guardians_approved
 * @property {boolean} both_users_approved
 * @property {boolean} is_super_like
 * @property {boolean} is_mutual
 * @property {Date}    created_at
 * @property {Date}    updated_at
 */

module.exports = (sequelize, DataTypes) => {
  class Interest extends Model {

    // ── Declare instance fields for TypeScript/IDE support ─────────────────
    // Fields for IDE/TS only (declaration, not JS/TS-initialization):
    // @ts-ignore
    id; status; from_user; from_guardian; from_guardian_status;
    // @ts-ignore
    to_user; to_guardian; to_guardian_status;
    // @ts-ignore
    both_guardians_approved; both_users_approved;
    // @ts-ignore
    is_super_like; is_mutual; created_at; updated_at;

    static associate(models) {
      Interest.belongsTo(models.Profile, { foreignKey: 'from_user', targetKey: 'individual_id', as: 'fromProfile' });
      Interest.belongsTo(models.Profile, { foreignKey: 'to_user', targetKey: 'individual_id', as: 'toProfile' });
      Interest.hasMany(models.Message, { foreignKey: 'interest_id', as: 'messages' });
      Interest.hasOne(models.Match, { foreignKey: 'interest_id', as: 'match' });

      // ── Guardian associations ──────────────────────────────────────────
      Interest.belongsTo(models.Guardian, { foreignKey: 'from_guardian', as: 'fromGuardian' });
      Interest.belongsTo(models.Guardian, { foreignKey: 'to_guardian', as: 'toGuardian' });
    }

    // ─────────────────────────────────────────────────────────────────────
    // Instance Magic Methods
    // ─────────────────────────────────────────────────────────────────────

    // ── Get from_guardian data ───────────────────────────────────────────
    async getFromGuardian() {
      const { Guardian } = sequelize.models;
      return await Guardian.findOne({
        where: { individual_id: this.from_user },
        attributes: [
          'id', 'individual_id', 'guardian_id', 'contact_hidden',
          'guardian_name', 'guardian_phone', 'guardian_email',
          'guardian_relationship', 'guardian_image',
          'created_at', 'updated_at',
        ],
      });
    }

    // ── Get to_guardian data ─────────────────────────────────────────────
    async getToGuardian() {
      const { Guardian } = sequelize.models;
      return await Guardian.findOne({
        where: { individual_id: this.to_user },
        attributes: [
          'id', 'individual_id', 'guardian_id', 'contact_hidden',
          'guardian_name', 'guardian_phone', 'guardian_email',
          'guardian_relationship', 'guardian_image',
          'created_at', 'updated_at',
        ],
      });
    }

    // ── Get both guardians at once ───────────────────────────────────────
    async getBothGuardians() {
      const [fromGuardian, toGuardian] = await Promise.all([
        this.getFromGuardian(),
        this.getToGuardian(),
      ]);
      return { fromGuardian, toGuardian };
    }

    // ── Check if contact is hidden for from_user ─────────────────────────
    async isFromContactHidden() {
      const g = await this.getFromGuardian();
      return g?.contact_hidden === 1 || g?.contact_hidden === true;
    }

    // ── Check if contact is hidden for to_user ───────────────────────────
    async isToContactHidden() {
      const g = await this.getToGuardian();
      return g?.contact_hidden === 1 || g?.contact_hidden === true;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Computed Getters (no await needed)
    // ─────────────────────────────────────────────────────────────────────

    // ── Both guardians approved? ─────────────────────────────────────────
    get areBothGuardiansApproved() {
      return this.from_guardian_status === 'accepted' &&
        this.to_guardian_status === 'accepted';
    }

    // ── Both users approved? ─────────────────────────────────────────────
    get areBothUsersApproved() {
      return this.both_users_approved === true;
    }

    // ── Fully approved (users + guardians)? ─────────────────────────────
    get isFullyApproved() {
      return this.areBothUsersApproved && this.areBothGuardiansApproved;
    }

    // ── Is pending? ──────────────────────────────────────────────────────
    get isPending() {
      return this.status === 'pending';
    }

    // ── Is accepted? ─────────────────────────────────────────────────────
    get isAccepted() {
      return this.status === 'accepted';
    }

    // ── Is declined? ─────────────────────────────────────────────────────
    get isDeclined() {
      return this.status === 'declined';
    }


    // Fetch interests sent by the user that are still pending
    static async getInterestsSent(userId) {
      const { Profile } = sequelize.models;
      return await Interest.findAll({
        where: {
          from_user: userId,
          status: 'pending'
        },
        include: [
          { model: Profile, as: 'toProfile' }
        ]
      });
    }

    // Fetch interests received by the user that are still pending
    static async getInterestsReceived(userId) {
      const { Profile } = sequelize.models;
      return await Interest.findAll({
        where: {
          to_user: userId,
          status: 'pending'
        },
        include: [
          { model: Profile, as: 'fromProfile' }
        ]
      });
    }


    // ─────────────────────────────────────────────────────────────────────
    // Static Magic Methods
    // ─────────────────────────────────────────────────────────────────────

    // ── Find all interests with both guardians included ──────────────────
    static async findWithGuardians(where = {}) {
      const { Guardian } = sequelize.models;
      const guardianAttrs = [
        'id', 'individual_id', 'guardian_id', 'contact_hidden',
        'guardian_name', 'guardian_phone', 'guardian_email',
        'guardian_relationship', 'guardian_image',
      ];
      return await Interest.findAll({
        where,
        include: [
          { model: Guardian, as: 'fromGuardian', attributes: guardianAttrs.filter(attr => attr !== 'guardian_image') },
          { model: Guardian, as: 'toGuardian', attributes: guardianAttrs.filter(attr => attr !== 'guardian_image') },

        ],
      });
    }

    // ── Find one interest with both guardians included ───────────────────
    static async findOneWithGuardians(where = {}) {
      const { Guardian } = sequelize.models;
      const guardianAttrs = [
        'id', 'individual_id', 'guardian_id', 'contact_hidden',
        'guardian_name', 'guardian_phone', 'guardian_email',
        'guardian_relationship', 'guardian_image',
      ];
      return await Interest.findOne({
        where,
        include: [
          { model: Guardian, as: 'fromGuardian', attributes: guardianAttrs },
          { model: Guardian, as: 'toGuardian', attributes: guardianAttrs },
        ],
      });
    }

    // ── Find all pending interests for a user ────────────────────────────
    static async findPendingForUser(userId) {
      return await Interest.findWithGuardians({
        to_user: userId,
        status: 'pending',
      });
    }

    // ── Find all accepted interests for a user ───────────────────────────
    static async findAcceptedForUser(userId) {
      return await Interest.findWithGuardians({
        [sequelize.Sequelize.Op.or]: [
          { from_user: userId },
          { to_user: userId },
        ],
        status: 'accepted',
      });
    }
  }

  Interest.init(
    {
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        allowNull: false,
        defaultValue: 'pending',
      },
      from_user: { type: DataTypes.BIGINT, allowNull: false },
      from_guardian: { type: DataTypes.BIGINT, allowNull: true, defaultValue: null },
      from_guardian_status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        allowNull: true,   // ✅
        defaultValue: 'pending',
      },

      to_user: { type: DataTypes.BIGINT, allowNull: false },
      to_guardian: { type: DataTypes.BIGINT, allowNull: true, defaultValue: null },
      to_guardian_status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        allowNull: true,   // ✅
        defaultValue: 'pending',
      },
      both_guardians_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      both_users_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_super_like: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_mutual: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'Interest',
      tableName: 'Interests',
      underscored: true,
      timestamps: true,
    }
  );

  return Interest;
};