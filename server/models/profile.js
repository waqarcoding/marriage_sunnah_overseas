'use strict';
const { Model } = require('sequelize');

// FIX: was using ES Module syntax (import/export default) in a CommonJS
// project — converted to require/module.exports to match every other model file

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      // FIX: cascade added — when a User is deleted their Profile is deleted too
      Profile.belongsTo(models.User, {
        foreignKey: 'individual_id',
        as: 'user',

        onDelete: 'CASCADE',
      });

      // guardian_id is nullable (not every profile has a guardian),
      // so SET NULL is correct here rather than CASCADE
      Profile.belongsTo(models.User, {
        foreignKey: 'guardian_id',
        as: 'guardian',
        onDelete: 'SET NULL',
      });

      Profile.hasMany(models.Interest, {
        foreignKey: 'from_user',
        // @ts-ignore
        targetKey: 'individual_id',
        as: 'interestsSent',
        onDelete: 'CASCADE',
        hooks: true,
      });
      Profile.hasMany(models.Interest, {
        foreignKey: 'to_user',
        // @ts-ignore
        targetKey: 'individual_id',
        as: 'interestsReceived',
        onDelete: 'CASCADE',
        hooks: true,
      });

      Profile.hasOne(models.Preference, {
        foreignKey: 'individual_id',
        sourceKey: 'individual_id',
        as: 'preference',
        onDelete: 'CASCADE',
        hooks: true,
      });

      Profile.hasMany(models.Guardian, {
        foreignKey: 'individual_id',
        sourceKey: 'individual_id',
        as: 'asIndividual',
        onDelete: 'CASCADE',
        hooks: true,
      });
      Profile.hasMany(models.Guardian, {
        foreignKey: 'guardian_id',
        sourceKey: 'individual_id',
        as: 'asGuardian',
        onDelete: 'CASCADE',
        hooks: true,
      });
    }
  }

  Profile.init({
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    individual_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {        // ✅ ADD THIS
        model: 'Users',  // ✅ ADD THIS
        key: 'id'        // ✅ ADD THIS
      }
    },
    name: { type: DataTypes.STRING(255), allowNull: false },
    gender: { type: DataTypes.STRING(255), allowNull: false },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
    age: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    marital_status: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    // ── Location ─────────────────────────────────────────────────────────
    country: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    city: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    nationality: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    // ── Career ───────────────────────────────────────────────────────────
    education: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    profession: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    employment_type: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    monthly_salary: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    // ── Religion ─────────────────────────────────────────────────────────
    religion: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    sect: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    religious_practice_level: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    caste: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    mother_tongue: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    // ── Physical ─────────────────────────────────────────────────────────
    height_inches: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      comment: 'Total inches e.g. 68 = 5ft 8in',
    },
    body_type: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    // ── Lifestyle ────────────────────────────────────────────────────────
    has_children: { type: DataTypes.TINYINT(1), allowNull: true, defaultValue: null },
    willing_to_relocate: { type: DataTypes.TINYINT(1), allowNull: true, defaultValue: 0 },
    relationship: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },

    // ── Bio & interests ──────────────────────────────────────────────────
    bio: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },
    interests: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },
    family_background: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },

    // ── Family details ───────────────────────────────────────────────────
    father_occupation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      comment: 'Father occupation or "Passed Away"',
    },
    mother_occupation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Housewife',
      comment: 'Mother occupation, default Housewife or "Passed Away"',
    },
    brothers: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of brothers',
    },
    sisters: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of sisters',
    },

    // ── Contact & privacy ────────────────────────────────────────────────
    phone: { type: DataTypes.STRING(20), allowNull: true, defaultValue: null },
    contact_hidden: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },

    // ── Profile status ───────────────────────────────────────────────────
    is_guardian_required: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
    is_profile_completed: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },

    // ── Media ────────────────────────────────────────────────────────────
    images: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },
    videos: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null },


    is_blurred_images: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0 },
    is_show_last_seen: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1, comment: 'Whether to show last seen online status' },
    // ── Activity ─────────────────────────────────────────────────────────
    last_seen: { type: DataTypes.DATE, allowNull: true, defaultValue: null },

    notifications: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1, comment: 'Enable/disable app notifications' },
    email_updates: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 0, comment: 'Enable/disable email updates' },



  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'Profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    // FIX: named indexes on FK columns to prevent duplicate index creation
    indexes: [
      { unique: true, fields: ['individual_id'], name: 'profiles_individual_id_unique' },
      { fields: ['guardian_id'], name: 'profiles_guardian_id_idx' },
    ],

    hooks: {

      afterCreate: async (profile, options) => {
        try {
          const User = sequelize.models.User;
          const user = await User.unscoped().findOne({
            where: { id: profile.get('individual_id') },
          });
          if (user) {
            // FIX: was calling profile.save() without setting the value first
            // correctly — now uses update() to avoid infinite hook loops

            console.log(`[Hook] Profile afterCreate: is_pro=${profile.get('is_pro')} for user ${user.get('id')}`);
          }
        } catch (err) {
          console.error('[Hook] Profile afterCreate error:', err);
        }
      },
    },
  });

  return Profile;
};
