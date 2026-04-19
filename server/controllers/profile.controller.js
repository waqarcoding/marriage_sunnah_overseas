'use strict';

const db = require('../models');
const { User, Profile, Guardian, Match, Message, Interest, Dislike, Preference } = db;
const { Op } = require('sequelize');

module.exports = {
  // 1️⃣ Create or update profile
  createProfile: async (req, res) => {
    try {
      const { name, gender, age, city, nationality, guardianId } = req.body;
      const user = req.user; // user instance from auth middleware

      let profile = await user.getProfile();

      if (profile) {
        await profile.update({ name, gender, age, city, nationality, guardian_id: guardianId });
      } else {
        profile = await user.createProfile({ name, gender, age, city, nationality, guardian_id: guardianId });
      }

      res.json({ success: true, profile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },
  updatePrefs: async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      const b = req.body;

      // '' | null | undefined → null, otherwise parse as int
      const toInt = (v) => {
        if (v === '' || v == null) return null;
        const n = parseInt(v);
        return isNaN(n) ? null : n;
      };

      // Normalize any value to a JSON string array for longtext columns
      const toJson = (v) => {
        if (Array.isArray(v)) return JSON.stringify(v);
        if (typeof v === 'string') {
          try {
            const parsed = JSON.parse(v);
            return JSON.stringify(Array.isArray(parsed) ? parsed : [parsed]);
          } catch {
            return JSON.stringify(v.split(',').map((s) => s.trim()).filter(Boolean));
          }
        }
        return JSON.stringify([]);
      };

      const prefsData = {
        pref_gender: b.pref_gender || null,
        pref_age_min: toInt(b.pref_age_min),
        pref_age_max: toInt(b.pref_age_max),
        pref_height_min_inches: toInt(b.pref_height_min_inches),
        pref_height_max_inches: toInt(b.pref_height_max_inches),
        pref_willing_to_relocate: b.pref_willing_to_relocate === 'Yes' ? 1
          : b.pref_willing_to_relocate === 'No' ? 0
            : null,
        pref_city: b.pref_city || null,
        pref_religion: b.pref_religion || null,
        pref_religious_practice_level: b.pref_religious_practice_level || null,
        pref_education: b.pref_education || null,
        pref_monthly_salary: b.pref_monthly_salary || null,
        pref_has_children: b.pref_has_children || null,
        pref_marital_status: toJson(b.pref_marital_status),
        pref_nationality: toJson(b.pref_nationality),
        pref_country: toJson(b.pref_country),
        pref_sect: toJson(b.pref_sect),
        pref_body_type: toJson(b.pref_body_type),
        pref_caste: toJson(b.pref_caste),
        pref_mother_tongue: toJson(b.pref_mother_tongue),
        pref_employment_type: toJson(b.pref_employment_type),
      };

      let prefs = await Preference.findOne({ where: { individual_id: profile.id } });

      if (prefs) {
        prefs.set(prefsData);
        await prefs.save();
      } else {
        prefs = await Preference.create({ individual_id: profile.id, ...prefsData });
      }

      await prefs.reload();
      return res.json({ success: true, prefs });

    } catch (err) {
      console.error('updatePrefs error:', err);
      return res.status(500).json({ success: false, message: err || 'Server error' });
    }
  },
  // Multer must be set up externally and passed, but here's controller logic:
  uploadIdCard: async (req, res) => {
    try {
      // Files are uploaded using multer middleware and available in req.files or req.file
      // Expected fields: front_id and back_id (from client)
      // Field names in FormData: front_id, back_id

      // Validation: ensure files are present
      if (!req.files || !req.files.front_id || !req.files.back_id) {
        return res.status(400).json({ success: false, message: 'Both front id and back id are required.' });
      }

      const frontFile = req.files.front_id[0];
      const backFile = req.files.back_id[0];

      // Save the uploaded file paths to the corresponding profile fields
      // Assuming req.user holds the authenticated user's object with id
      const userId = req.user && req.user.id ? req.user.id : null;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Resolve path for saving (path exposed = `/uploads/identity/filename`)
      const frontPath = `/uploads/identity/${frontFile.filename}`;
      const backPath = `/uploads/identity/${backFile.filename}`;

      // Import your profile model here if not already imported
      // const { Profile } = require('../models'); <-- for CommonJS, or import Profile from ... for ES6


      // Find and update profile
      let profile = await Profile.findOne({ where: { userid: userId } });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }
      profile.front_id = frontPath;
      profile.back_id = backPath;
      await profile.save();

      return res.json({ success: true, message: 'Files uploaded and paths saved', front_id: frontPath, back_id: backPath });

    } catch (err) {
      console.error('uploadIdCard error:', err);
      return res.status(500).json({ success: false, message: err || 'Server error' });
    }
  },
  // Handles updating the user's profile with data fields as received from ProfileService.js (see client src/features/profile/api/ProfileService.js)
  // Use sample JSON to update profile on calling this function (COMMENT OUT after testing)
  updateProfile: async (req, res) => {
    try {
      const {
        name,
        gender,
        date_of_birth,
        age,
        marital_status,
        phone,
        country,
        city,
        nationality,
        religion,
        sect,
        religious_practice_level,
        caste,
        mother_tongue,
        height_inches,
        body_type,
        education,
        profession,
        employment_type,
        monthly_salary,
        bio,
        family_background,
        interests,
        has_children,
        willing_to_relocate,
        relationship,
        contact_hidden,
        is_guardian_required,
        guardian_name,
        guardian_phone,
        guardian_email,
        guardian_relationship,
        is_profile_completed,
      } = req.body;



      console.log("Backend:" + req.body.interests);
      // Convert interests to JSON array string e.g. ["one","two","three"]
      let parsedInterests = interests;

      if (typeof interests === "string") {
        try {
          const parsed = JSON.parse(interests);
          parsedInterests = JSON.stringify(Array.isArray(parsed) ? parsed : [parsed]);
        } catch (_) {
          // plain comma string → array → JSON string
          parsedInterests = JSON.stringify(interests.split(",").map(i => i.trim()).filter(Boolean));
        }
      } else if (Array.isArray(interests)) {
        parsedInterests = JSON.stringify(interests);
      } else {
        parsedInterests = "[]";
      }

      // Guard: ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: "Unauthorized: no user ID" });
      }

      const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
      if (!profile) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }

      // Assign all fields manually then save (schema-based per columns list)
      profile.name = name;
      profile.gender = gender;
      profile.date_of_birth = date_of_birth;
      profile.age = age !== undefined ? age : null;
      profile.marital_status = marital_status || null;
      profile.country = country || null;
      profile.city = city || null;
      profile.nationality = nationality || null;
      profile.education = education || null;
      profile.profession = profession || null;
      profile.religious_practice_level = religious_practice_level || null;
      profile.family_background = family_background || null;
      profile.bio = bio || null;
      profile.interests = parsedInterests || "[]";
      profile.relationship = relationship || null;
      // tinyint(1) fields: contact_hidden/is_guardian_required/has_children handled below,
      // see original code
      profile.phone = phone || null;
      profile.religion = religion || null;
      profile.sect = sect || null;
      profile.height_inches = height_inches !== undefined ? height_inches : null;
      profile.body_type = body_type || null;
      profile.caste = caste || null;
      profile.mother_tongue = mother_tongue || null;
      profile.employment_type = employment_type || null;
      profile.monthly_salary = monthly_salary || null;
      profile.has_children = has_children !== undefined ? Number(has_children) : null;
      profile.willing_to_relocate =
        willing_to_relocate === "Yes" ? 1
          : willing_to_relocate === "No" ? 0
            : willing_to_relocate === undefined ? null
              : willing_to_relocate;
      profile.relationship = relationship;
      profile.contact_hidden = contact_hidden !== undefined ? Number(contact_hidden) : profile.contact_hidden;
      profile.is_guardian_required = is_guardian_required !== undefined ? Number(is_guardian_required) : null;

      profile.is_profile_completed = is_profile_completed !== undefined ? Number(is_profile_completed) : null;
      await profile.save();

      console.log("Profile Updated");

      await profile.reload(); // refresh instance from DB to return latest data

      return res.json({ success: true, profile });

    } catch (err) {
      console.error("updateProfile error:", err);
      return res.status(500).json({ success: false, message: err || "Server error" });
    }
  },
  // controllers/profile.controller.js
  updateGuardian: async (req, res) => {
    try {
      const {
        guardian_name,
        guardian_phone,
        guardian_email,
        guardian_relationship,
      } = req.body;

      const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
      if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

      await profile.update({
        guardian_name,
        guardian_phone,
        guardian_email,
        guardian_relationship,
      });

      res.json({ success: true, profile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err });
    }
  },
  // 2️⃣ Get my profile
  getCurrentUser: async (req, res) => {

  },
  getMyProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {

        include: [
          { model: Profile, as: "profile" },
          { model: Guardian, as: "guardians" },
          { model: Guardian, as: "individuals" },
          { model: Match, as: "matchesSent", attributes: ["id", "createdAt"] },
          { model: Match, as: "matchesReceived", attributes: ["id", "createdAt"] },
          { model: Dislike, as: "dislikesSent", attributes: ["id", "createdAt"] },
          { model: Dislike, as: "dislikesReceived", attributes: ["id", "createdAt"] },

        ],
      });

      if (!user) return res.status(404).json({ error: "Profile not found" });

      const [likesSentCount, likesReceivedCount, matchesCount, dislikesSentCount, dislikesReceivedCount] = await Promise.all([
        Interest.count({ where: { from_user: req.user.id } }),
        Interest.count({ where: { to_user: req.user.id } }),
        Interest.count({ where: { is_mutual: true, [Op.or]: [{ from_user: req.user.id }, { to_user: req.user.id }] } }),
        Dislike.count({ where: { user_id: req.user.id } }),
        Dislike.count({ where: { target_user_id: req.user.id } }),
      ]);

      res.json({
        success: true,
        ...user.toJSON(),

        counts: {
          likes_sent: likesSentCount,
          likes_received: likesReceivedCount,
          matches: matchesCount,
          dislikes_sent: dislikesSentCount,
          dislikes_received: dislikesReceivedCount,
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // 4️⃣ Update interests
  updateInterests: async (req, res) => {
    try {
      const { interests } = req.body;
      const user = req.user;

      const profile = await user.getProfile();
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      profile.interests = interests; // array of strings
      await profile.save();

      res.json({ success: true, profile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // 5️⃣ Delete profile
  deleteProfile: async (req, res) => {
    try {
      const user = req.user;
      const profile = await user.getProfile();
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      await profile.destroy();
      res.json({ success: true, message: 'Profile deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // 6️⃣ Assign / change guardian
  assignGuardian: async (req, res) => {
    try {
      const { guardianId } = req.body;
      const user = req.user;

      const profile = await user.getProfile();
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      profile.guardian_id = guardianId;
      await profile.save();

      res.json({ success: true, profile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // 7️⃣ Get verified profiles (for suggestions)
  getVerifiedProfiles: async (req, res) => {
    try {
      const user = req.user;

      const profiles = await Profile.findAll({
        where: {
          is_verified: true,
          individual_id: { [Op.ne]: user.id },
        },
        include: [{ model: User, as: 'individual', attributes: ['id', 'email', 'role'] }],
      });

      res.json(profiles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },
  // controllers/profile.controller.js
  updateLastSeen: async (req, res) => {
    try {
      await Profile.update(
        { last_seen: new Date() },
        { where: { individual_id: req.user.id } }
      );

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err });
    }
  },
  // 8️⃣ Get all profiles (excluding current user)
  getAllProfiles: async (req, res) => {
    try {
      const user = req.user;

      const profiles = await Profile.findAll({
        where: {
          individual_id: { [Op.ne]: user.id },
        },
        include: [{ model: User, as: 'individual', attributes: ['id', 'email', 'role'] }],
      });

      res.json(profiles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // 9️⃣ Get my guardians
  getMyGuardians: async (req, res) => {
    try {
      const user = req.user;
      const guardians = await user.getGuardians(); // magic method
      res.json({ success: true, guardians });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  uploadImage: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
      if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

      let images = [];
      try { images = JSON.parse(profile.images || "[]"); } catch { images = []; }
      if (!Array.isArray(images)) images = [];

      // ✅ clean nulls first
      images = images.filter(Boolean);

      const index = parseInt(req.body.index);

      if (index < images.length) {
        images[index] = imageUrl; // replace existing
      } else {
        images.push(imageUrl); // always push to end, no gaps
      }

      await profile.update({ images: JSON.stringify(images) });

      res.json({ success: true, imageUrl, images });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err });
    }
  },
};