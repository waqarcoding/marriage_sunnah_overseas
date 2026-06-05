// User.js
'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(User, {
        through: 'Guardian',
        as: 'Children',
        foreignKey: 'guardian_id',
        otherKey: 'individual_id',
      });

      User.belongsToMany(User, {
        through: 'Guardian',
        as: 'Guardians',
        foreignKey: 'individual_id',
        otherKey: 'guardian_id',
      });

      User.hasOne(models.Profile, {
        foreignKey: 'individual_id',
        as: 'profile',
        onDelete: 'CASCADE',
        hooks: true,
      });

      User.hasMany(models.Guardian, {
        foreignKey: 'individual_id',
        as: 'guardians',
        onDelete: 'CASCADE',
        hooks: true,
      });
      User.hasMany(models.Guardian, {
        foreignKey: 'guardian_id',
        as: 'individuals',
        onDelete: 'CASCADE',
        hooks: true,
      });

      User.hasMany(models.Match, {
        foreignKey: 'user1',
        as: 'matchesSent',
        onDelete: 'CASCADE',
        hooks: true,
      });
      User.hasMany(models.Match, {
        foreignKey: 'user2',
        as: 'matchesReceived',
        onDelete: 'CASCADE',
        hooks: true,
      });

      User.hasMany(models.Interest, {
        foreignKey: 'from_user',
        as: 'interestsSent',
        onDelete: 'CASCADE',
        hooks: true,
      });
      User.hasMany(models.Interest, {
        foreignKey: 'to_user',
        as: 'interestsReceived',
        onDelete: 'CASCADE',
        hooks: true,
      });

      User.hasMany(models.Message, {
        foreignKey: 'sender_id',
        as: 'sentMessages',
        onDelete: 'CASCADE',
        hooks: true,
      });
      User.hasMany(models.Message, {
        foreignKey: 'receiver_id',
        as: 'receivedMessages',
        onDelete: 'CASCADE',
        hooks: true,
      });

      User.hasMany(models.Dislike, {
        foreignKey: 'user_id',
        as: 'dislikesSent',
        onDelete: 'CASCADE',
        hooks: true,
      });
      User.hasMany(models.Dislike, {
        foreignKey: 'target_user_id',
        as: 'dislikesReceived',
        onDelete: 'CASCADE',
        hooks: true,
      });

      User.hasMany(models.Otp, {
        foreignKey: 'user_id',
        as: 'otps',
        onDelete: 'CASCADE',
        hooks: true,
      });

      User.hasMany(models.Subscription, {
        foreignKey: 'user_id',
        as: 'subscriptions',
        onDelete: 'CASCADE',
        hooks: true,
      });

      User.hasMany(models.Transaction, {
        foreignKey: 'user_id',
        as: 'transactions',
        onDelete: 'CASCADE',
        hooks: true,
      });

      User.hasMany(models.ContactReveal, {
        foreignKey: 'revealer_user_id',
        as: 'contactRevealsGiven',
        onDelete: 'CASCADE',
        hooks: true,
      });
      User.hasMany(models.ContactReveal, {
        foreignKey: 'revealed_user_id',
        as: 'contactRevealsReceived',
        onDelete: 'CASCADE',
        hooks: true,
      });
    }

    // ── Instance Methods ──────────────────────────────────────────────────

    isSubscriptionExpired() {
      const exp = this.getDataValue('subscription_expires_at');
      if (!exp) return true;
      return new Date() > new Date(exp);
    }

    isCreditsEmpty() {
      const credits = this.getDataValue('credits');
      return (credits || 0) <= 0;
    }

    shouldShowSubscriptionPage() {
      return this.isSubscriptionExpired() && this.isCreditsEmpty();
    }

    canRevealContacts() {
      if (!this.isSubscriptionExpired() && this.getDataValue('unlimited_contact_reveals')) {
        return true;
      }
      return (this.getDataValue('contact_reveals_remaining') || 0) > 0;
    }

    getContactRevealsInfo() {
      if (!this.isSubscriptionExpired() && this.getDataValue('unlimited_contact_reveals')) {
        return { unlimited: true, remaining: 'unlimited' };
      }
      return {
        unlimited: false,
        remaining: this.getDataValue('contact_reveals_remaining') || 0,
      };
    }
  }

  User.init({
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'users_email_unique',
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'users_mobile_unique',
    },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('individual', 'guardian', 'admin', 'staff'),
      defaultValue: 'individual',
    },
    avatar_url: { type: DataTypes.STRING, allowNull: true },
    is_online: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_suspended: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_pro: { type: DataTypes.BOOLEAN, defaultValue: false },
    frontid_url: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    backid_url: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    rcredits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    stripe_customer_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: 'users_stripe_customer_unique',
    },
    subscription_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // ── Virtual: is subscription currently active ─────────────────────
    // Use this instead of is_pro for expiry checks — no DB writes needed
    is_subscription_active: {
      type: DataTypes.VIRTUAL,
      get() {
        const exp = this.getDataValue('subscription_expires_at');
        return exp ? new Date() < new Date(exp) : false;
      },
    },

    contact_reveals_remaining: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    unlimited_contact_reveals: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    last_seen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    show_last_seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_blurred_images: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_pin: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
      { unique: true, fields: ['email'], name: 'users_email_unique' },
      { unique: true, fields: ['mobile'], name: 'users_mobile_unique' },
      { unique: true, fields: ['stripe_customer_id'], name: 'users_stripe_customer_unique' },
      { fields: ['subscription_expires_at'], name: 'users_subscription_expires_idx' },
      { fields: ['credits'], name: 'users_credits_idx' },
      { fields: ['contact_reveals_remaining'], name: 'users_contact_reveals_idx' },
      { fields: ['unlimited_contact_reveals'], name: 'users_unlimited_reveals_idx' },
    ],

    defaultScope: {
      where: { is_deleted: false },
    },
    scopes: {
      withDeleted: { where: {} },
    },

    hooks: {
      // ✅ afterCreate: sync profile if needed
      afterCreate: async (user, options) => {
        try {
          const Profile = sequelize.models.Profile;
          const profile = await Profile.findOne({
            where: { individual_id: user.get('id') },
          });
          if (profile) {
            // your existing logic
          }
        } catch (err) {
          console.error('[Hook] afterCreate error:', err);
        }
      },

      // ✅ afterUpdate: sync is_pro to profile
      afterUpdate: async (user, options) => {
        try {
          const changed = user.changed();
          if (changed && changed.includes('is_pro')) {
            const Profile = sequelize.models.Profile;
            const profile = await Profile.findOne({
              where: { individual_id: user.get('id') },
            });
            if (profile) {
              // your existing logic
            }
          }
        } catch (err) {
          console.error('[Hook] afterUpdate error:', err);
        }
      },

      // ✅ REMOVED beforeFind — it caused infinite recursion
      // Subscription expiry is now handled by:
      // 1. is_subscription_active virtual field (for checks)
      // 2. Cron job in app.js (for DB cleanup)
    },
  });

  return User;
};