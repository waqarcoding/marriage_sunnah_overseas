'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // ── Self-referential many-to-many via Guardian junction ──────────────
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

      // 1️⃣ Profile — cascade delete when user is deleted
      User.hasOne(models.Profile, {
        foreignKey: 'individual_id',
        as: 'profile',
        onDelete: 'CASCADE',
        hooks: true,
      });

      // 2️⃣ Guardians — cascade delete both sides when user is deleted
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

      // 3️⃣ Matches — cascade delete when user is deleted
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

      // 4️⃣ Interests — cascade delete when user is deleted
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

      // 5️⃣ Messages — cascade delete when user is deleted
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

      // 6️⃣ Dislikes — cascade delete when user is deleted
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

      // 7️⃣ OTPs — cascade delete when user is deleted
      User.hasMany(models.Otp, {
        foreignKey: 'user_id',
        as: 'otps',
        onDelete: 'CASCADE',
        hooks: true,
      });

      // 8️⃣ Subscriptions — cascade delete when user is deleted
      User.hasMany(models.Subscription, {
        foreignKey: 'user_id',
        as: 'subscriptions',
        onDelete: 'CASCADE',
        hooks: true,
      });

      // 9️⃣ Transactions — cascade delete when user is deleted
      User.hasMany(models.Transaction, {
        foreignKey: 'user_id',
        as: 'transactions',
        onDelete: 'CASCADE',
        hooks: true,
      });

      // 🔟 Contact Reveals — cascade delete when user is deleted
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

    // Check if subscription is expired
    isSubscriptionExpired() {
      if (!this.isSubscriptionExpired) return true;
      // @ts-ignore
      return new Date() > new Date(this.isSubscriptionExpired);
    }

    // Check if credits are empty
    isCreditsEmpty() {
      return (this.getDataValue && typeof this.getDataValue === 'function'
        ? this.getDataValue('credits')
        // @ts-ignore
        : this.credits) <= 0;
    }

    // Check if user should see subscription page
    shouldShowSubscriptionPage() {
      return this.isSubscriptionExpired() && this.isCreditsEmpty();
    }

    // NEW: Check if user can reveal contacts
    canRevealContacts() {
      // Unlimited reveals if subscription is active
      // @ts-ignore
      if (!this.isSubscriptionExpired() && this.unlimited_contact_reveals) {
        return true;
      }
      // Check if user has reveals remaining
      // @ts-ignore
      return this.contact_reveals_remaining > 0;
    }

    // NEW: Get contact reveals info
    getContactRevealsInfo() {
      // @ts-ignore
      if (!this.isSubscriptionExpired() && this.unlimited_contact_reveals) {
        return {
          unlimited: true,
          remaining: 'unlimited'
        };
      }
      return {
        unlimited: false,
        // @ts-ignore
        remaining: this.contact_reveals_remaining || 0
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

    // ── Subscription & Credits Fields ────────────────────────────────────
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Available credits for premium features'
    },
    rcredits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Received from you referred subscriptions'

    },
    stripe_customer_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: 'users_stripe_customer_unique',
      comment: 'Stripe customer ID for billing'
    },
    subscription_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Subscription expiration timestamp'
    },

    // ── NEW: Contact Reveal Fields ────────────────────────────────────────
    contact_reveals_remaining: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Number of contact reveals remaining for current period'
    },
    unlimited_contact_reveals: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Whether user has unlimited contact reveals (premium tier)'
    },

    last_seen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Last activity timestamp'
    },
    show_last_seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Privacy setting for last seen visibility'
    },
    is_blurred_images: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether to blur profile images for non-pro users'
    },
    user_pin: {
      type: DataTypes.STRING(6),
      allowNull: true,
      comment: '6-digit numeric PIN for user verification or actions'
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
      // Sync after a new user is created
      afterCreate: async (user, options) => {
        try {
          const Profile = sequelize.models.Profile;
          const profile = await Profile.findOne({
            where: { individual_id: user.get('id') },
          });
          if (profile) {
            // Your existing logic
          }
        } catch (err) {
          console.error('[Hook] afterCreate sync is_pro error:', err);
        }
      },

      // Sync only when changes
      afterUpdate: async (user, options) => {
        try {
          const changed = user.changed();
          if (changed && changed.includes('is_pro')) {
            const Profile = sequelize.models.Profile;
            const profile = await Profile.findOne({
              where: { individual_id: user.get('id') },
            });
            if (profile) {
              // Your existing logic
            }
          }
        } catch (err) {
          console.error('[Hook] afterUpdate sync is_pro error:', err);
        }
      },

      // Auto-expire subscription and update is_pro if subscription expired
      beforeFind: async (options) => {
        try {
          const User = sequelize.models.User;
          await User.update(
            {
              is_pro: false,
              unlimited_contact_reveals: false // NEW: Reset unlimited reveals on expiry
            },
            {
              where: {
                subscription_expires_at: {
                  [sequelize.Sequelize.Op.lt]: new Date()
                },
                is_pro: true
              },
              hooks: false
            }
          );
        } catch (err) {
          console.error('[Hook] beforeFind auto-expire error:', err);
        }
      },
    },
  });

  return User;
};