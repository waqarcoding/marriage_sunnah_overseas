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
    name: { type: DataTypes.STRING(255), allowNull: false },
    gender: { type: DataTypes.STRING(255), allowNull: false },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
    age: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    marital_status: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    country: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    city: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    nationality: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    education: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    profession: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    religious_practice_level: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    family_background: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },
    bio: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },
    interests: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },

    relationship: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    contact_hidden: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },

    last_seen: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    images: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },


    is_guardian_required: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },

    phone: { type: DataTypes.STRING(20), allowNull: true, defaultValue: null },
    religion: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    sect: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    height_inches: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      comment: 'Total inches e.g. 68 = 5ft 8in',
    },
    body_type: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    caste: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    mother_tongue: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    employment_type: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    monthly_salary: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    has_children: { type: DataTypes.TINYINT(1), allowNull: true, defaultValue: null },
    willing_to_relocate: { type: DataTypes.TINYINT(1), allowNull: true, defaultValue: 0 },
    is_profile_completed: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },
    is_pro: { type: DataTypes.TINYINT(1), allowNull: true, defaultValue: 0 },

    front_id: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    back_id: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    isblurred_images: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'Profiles',
    timestamps: true,
    underscored: true,

    hooks: {
      afterCreate: async (profile, options) => {
        try {
          const User = sequelize.models.User;
          const user = await User.findOne({ where: { id: profile.get('individual_id') } });
          if (user) {
            profile.set('is_pro', user.get('is_premium') ? 1 : 0);
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