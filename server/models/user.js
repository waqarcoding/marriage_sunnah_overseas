'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(User, {
        through: 'Guardian',
        as: 'Children',
        foreignKey: 'guardian_id',
        otherKey: 'individual_id'
      });

      User.belongsToMany(User, {
        through: 'Guardian',
        as: 'Guardians',
        foreignKey: 'individual_id',
        otherKey: 'guardian_id'
      });

      // 1️⃣ Profiles
      User.hasOne(models.Profile, { foreignKey: 'individual_id', as: 'profile' });

      // 2️⃣ Guardians
      User.hasMany(models.Guardian, { foreignKey: 'individual_id', as: 'guardians' });
      User.hasMany(models.Guardian, { foreignKey: 'guardian_id', as: 'individuals' });

      // 3️⃣ Matches
      User.hasMany(models.Match, { foreignKey: 'user1', as: 'matchesSent' });
      User.hasMany(models.Match, { foreignKey: 'user2', as: 'matchesReceived' });

      // 4️⃣ Interests
      User.hasMany(models.Interest, { foreignKey: 'from_user', as: 'interestsSent' });
      User.hasMany(models.Interest, { foreignKey: 'to_user', as: 'interestsReceived' });

      // 5️⃣ Messages
      User.hasMany(models.Message, { foreignKey: 'sender_id', as: 'sentMessages' });
      User.hasMany(models.Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });

      // 6️⃣ Dislikes
      User.hasMany(models.Dislike, { foreignKey: 'user_id', as: 'dislikesSent' });
      User.hasMany(models.Dislike, { foreignKey: 'target_user_id', as: 'dislikesReceived' });
    }
  }

  User.init({
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
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
    is_premium: { type: DataTypes.BOOLEAN, defaultValue: false },
    frontid_url: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    backid_url: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    defaultScope: {
      where: { is_deleted: false },
    },
    scopes: {
      withDeleted: { where: {} },
    },

    hooks: {
      // ✅ After new user is created → sync is_premium to profile.is_pro
      afterCreate: async (user, options) => {  // ❌ was: async (User user, options)
        try {
          const Profile = sequelize.models.Profile;
          const profile = await Profile.findOne({ where: { individual_id: user.get('id') } });
          if (profile) {
            profile.is_pro = user.get('is_premium') ? 1 : 0;
            await profile.save();
            console.log(`[Hook] afterCreate: is_pro synced to ${profile.is_pro} for user ${user.get('id')}`);
          } else {
            console.log(`[Hook] afterCreate: No profile found for user ${user.get('id')}`);
          }
        } catch (err) {
          console.error('[Hook] afterCreate sync is_pro error:', err);
        }
      },

      // ✅ After user is updated → sync is_pro only if is_premium changed
      afterUpdate: async (user, options) => {
        try {
          const changed = user.changed(); // returns array of changed field names or false
          if (changed && changed.includes('is_premium')) {
            const Profile = sequelize.models.Profile;
            const profile = await Profile.findOne({ where: { individual_id: user.get('id') } });
            if (profile) {
              profile.is_pro = user.get('is_premium') ? 1 : 0;
              await profile.save();
              console.log(`[Hook] afterUpdate: is_pro synced to ${profile.is_pro} for user ${user.get('id')}`);
            }
          }
        } catch (err) {
          console.error('[Hook] afterUpdate sync is_pro error:', err);
        }
      },
    },
  });

  return User;
};