'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: 'individual_id', as: 'individual' });
      Profile.belongsTo(models.User, { foreignKey: 'guardian_id', as: 'guardian' });
      Profile.hasMany(models.Interest, { foreignKey: 'from_user', as: 'interestsSent' });
      Profile.hasMany(models.Interest, { foreignKey: 'to_user', as: 'interestsReceived' });
      Profile.hasOne(models.Preference, { foreignKey: 'individual_id', as: 'preference' });
    }
  }

  Profile.init({
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    individual_id: { type: DataTypes.BIGINT, allowNull: false },
    guardian_id: { type: DataTypes.BIGINT, allowNull: true },

    name: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
    age: { type: DataTypes.INTEGER, allowNull: true },
    marital_status: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    nationality: { type: DataTypes.STRING, allowNull: true },

    religion: {
      type: DataTypes.ENUM('Islam', 'Christian', 'Hindu', 'Other'),
      allowNull: true,
    },
    sect: {
      type: DataTypes.ENUM('Sunni', 'Shia', 'Deobandi', 'Barelvi', 'Ahmadiyya', 'Other'),
      allowNull: true,
    },
    religious_practice_level: { type: DataTypes.STRING, allowNull: true },
    caste: { type: DataTypes.STRING(60), allowNull: true },
    mother_tongue: {
      type: DataTypes.ENUM('Urdu', 'Pashto', 'Punjabi', 'Sindhi', 'Balochi', 'Other'),
      allowNull: true,
    },
    height_inches: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      comment: 'Total inches e.g. 68 = 5ft 8in',
    },
    body_type: {
      type: DataTypes.ENUM('Slim', 'Athletic', 'Average', 'Curvy', 'Heavy'),
      allowNull: true,
    },

    education: { type: DataTypes.STRING, allowNull: true },
    profession: { type: DataTypes.STRING, allowNull: true },
    employment_type: {
      type: DataTypes.ENUM('Government', 'Private', 'Self-Employed', 'Business', 'Unemployed', 'Other'),
      allowNull: true,
    },
    monthly_salary: {
      type: DataTypes.ENUM('No preference', 'Less than PKR 100,000', 'PKR 100,000 - 200,000', 'Above PKR 200,000'),
      allowNull: true,
    },

    bio: { type: DataTypes.TEXT, allowNull: true },
    family_background: { type: DataTypes.TEXT, allowNull: true },
    interests: { type: DataTypes.TEXT, allowNull: true },

    has_children: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
    },
    willing_to_relocate: { type: DataTypes.TINYINT(1), allowNull: true, defaultValue: 0 },

    relationship: { type: DataTypes.STRING, allowNull: true },
    contact_hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

    last_seen: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    images: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },

    guardian_name: { type: DataTypes.STRING, allowNull: true },
    guardian_phone: { type: DataTypes.STRING(50), allowNull: true },
    guardian_email: { type: DataTypes.STRING, allowNull: true },
    guardian_relationship: { type: DataTypes.STRING(100), allowNull: true },
    is_guardian_required: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
    is_profile_completed: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },
    is_pro: { type: DataTypes.TINYINT(1), allowNull: true, defaultValue: 0 },

    front_id: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    back_id: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'Profiles',
    timestamps: true,
    underscored: true,

    // ✅ Hook added here
    hooks: {
      afterCreate: async (profile, options) => {
        try {
          const User = sequelize.models.User;
          const user = await User.findOne({ where: { id: profile.get('individual_id') } });
          if (user) {
            profile.set('is_pro', user.get('is_premium') ? 1 : 0); // ✅ use .set()
            await profile.save();
            console.log(`[Hook] Profile afterCreate: is_pro set to ${profile.get('is_pro')} for user ${user.get('id')}`);
          } else {
            console.log(`[Hook] Profile afterCreate: No user found for individual_id ${profile.get('individual_id')}`);
          }
        } catch (err) {
          console.error('[Hook] Profile afterCreate sync is_pro error:', err);
        }
      },
    },

  });

  return Profile;
};