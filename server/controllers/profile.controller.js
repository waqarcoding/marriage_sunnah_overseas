import db from '../models/index.js';
const { User, Profile, Guardian, Match, Message, Interest, Dislike, Preference } = db;
import { Op } from 'sequelize';
import { getUploadedUrl } from '../middlewares/upload.middleware.js';

// ─── Create Profile ───────────────────────────────────────────────────────────
export const createProfile = async (req, res) => {
  try {
    const { name, gender, age, city, nationality, guardianId } = req.body;
    const user = req.user;

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
};

// ─── Update Preferences ───────────────────────────────────────────────────────
export const updatePrefs = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const b = req.body;

    const toInt = (v) => {
      if (v === '' || v == null) return null;
      const n = parseInt(v);
      return isNaN(n) ? null : n;
    };

    const toJson = (v) => {
      if (Array.isArray(v)) return JSON.stringify(v);
      if (typeof v === 'string') {
        try {
          const parsed = JSON.parse(v);
          return JSON.stringify(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          return JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean));
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
      pref_willing_to_relocate: b.pref_willing_to_relocate === 'Yes' ? 1 : b.pref_willing_to_relocate === 'No' ? 0 : null,
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

    // ✅ Fix: use individual_id from user not profile.id
    let prefs = await Preference.findOne({ where: { individual_id: req.user.id } });

    if (prefs) {
      prefs.set(prefsData);
      await prefs.save();
    } else {
      prefs = await Preference.create({ individual_id: req.user.id, ...prefsData });
    }

    await prefs.reload();
    return res.json({ success: true, prefs });

  } catch (err) {
    console.error('updatePrefs error:', err);
    return res.status(500).json({ success: false, message: err || 'Server error' });
  }
};

// ─── Upload ID Card ───────────────────────────────────────────────────────────
export const uploadIdCard = async (req, res) => {
  try {
    if (!req.files || !req.files.front_id || !req.files.back_id) {
      return res.status(400).json({ success: false, message: 'Both front and back ID images are required.' });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const frontFile = req.files.front_id[0];
    const backFile = req.files.back_id[0];

    // ✅ Use helper — works for both local disk and DO Spaces
    const frontPath = getUploadedUrl(frontFile);
    const backPath = getUploadedUrl(backFile);

    // ✅ Save to User table (frontid_url / backid_url)
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.frontid_url = frontPath;
    user.backid_url = backPath;
    await user.save();

    console.log(`✅ ID uploaded — user ${userId}: front=${frontPath}, back=${backPath}`);

    return res.json({
      success: true,
      message: 'ID uploaded successfully',
      frontid_url: frontPath,
      backid_url: backPath,
    });

  } catch (err) {
    console.error('uploadIdCard error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const {
      name, gender, date_of_birth, age, marital_status, phone,
      country, city, nationality, religion, sect, religious_practice_level,
      caste, mother_tongue, height_inches, body_type, education, profession,
      employment_type, monthly_salary, bio, family_background, interests,
      has_children, willing_to_relocate, relationship, contact_hidden,
      is_guardian_required, is_profile_completed,
      // ✅ new family fields
      father_occupation, mother_occupation, brothers, sisters,
      no_of_children,
    } = req.body;

    // Parse interests
    let parsedInterests = "[]";
    if (typeof interests === "string") {
      try {
        const parsed = JSON.parse(interests);
        parsedInterests = JSON.stringify(Array.isArray(parsed) ? parsed : [parsed]);
      } catch {
        parsedInterests = JSON.stringify(interests.split(",").map(i => i.trim()).filter(Boolean));
      }
    } else if (Array.isArray(interests)) {
      parsedInterests = JSON.stringify(interests);
    }

    if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });

    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    await profile.update({
      name,
      gender,
      date_of_birth: date_of_birth || null,
      age: age ?? null,
      marital_status: marital_status || null,
      country: country || null,
      city: city || null,
      nationality: nationality || null,
      education: education || null,
      profession: profession || null,
      religious_practice_level: religious_practice_level || null,
      family_background: family_background || null,
      bio: bio || null,
      interests: parsedInterests,
      relationship: relationship || null,
      phone: phone || null,
      religion: religion || null,
      sect: sect || null,
      height_inches: height_inches ?? null,
      body_type: body_type || null,
      caste: caste || null,
      mother_tongue: mother_tongue || null,
      employment_type: employment_type || null,
      monthly_salary: monthly_salary || null,
      // ✅ new family fields
      father_occupation: father_occupation || null,
      mother_occupation: mother_occupation || "Housewife",
      brothers: brothers ?? 0,
      sisters: sisters ?? 0,
      no_of_children: no_of_children ?? null,
      // toggles
      has_children: has_children != null ? Number(has_children) : null,
      willing_to_relocate: willing_to_relocate === "Yes" ? 1 : willing_to_relocate === "No" ? 0 : null,
      contact_hidden: contact_hidden != null ? Number(contact_hidden) : profile.contact_hidden,
      is_guardian_required: is_guardian_required != null ? Number(is_guardian_required) : null,
      is_profile_completed: is_profile_completed != null ? Number(is_profile_completed) : null,
    });

    await profile.reload();
    console.log("Profile Updated ✅");
    return res.json({ success: true, profile });

  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ success: false, message: err || "Server error" });
  }
};

// ─── Update Guardian ──────────────────────────────────────────────────────────
export const updateGuardian = async (req, res) => {
  try {
    const { guardian_name, guardian_phone, guardian_email, guardian_relationship } = req.body;

    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    await profile.update({ guardian_name, guardian_phone, guardian_email, guardian_relationship });
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};

// ─── Get My Profile ───────────────────────────────────────────────────────────
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }, // ✅ never send password
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

    if (!user) return res.status(404).json({ error: "User not found" });

    const [likesSent, likesReceived, matches, dislikesSent, dislikesReceived] = await Promise.all([
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
        likes_sent: likesSent,
        likes_received: likesReceived,
        matches,
        dislikes_sent: dislikesSent,
        dislikes_received: dislikesReceived,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const uploadImage = async (req, res) => {
  try {
    // ✅ req.files['image'][0] — because we use upload.fields()
    const file = req.files?.['image']?.[0];
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const imageUrl = getUploadedUrl(file);

    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    let images = [];
    try { images = JSON.parse(profile.images || "[]"); } catch { images = []; }
    if (!Array.isArray(images)) images = [];
    images = images.filter(Boolean);

    const index = parseInt(req.body.index ?? images.length);

    if (index < images.length) {
      images[index] = imageUrl;
    } else {
      images.push(imageUrl);
    }

    await profile.update({ images: JSON.stringify(images) });

    return res.json({ success: true, imageUrl, images });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err });
  }
};

// ─── Remaining controllers ────────────────────────────────────────────────────

export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.interests = Array.isArray(interests) ? JSON.stringify(interests) : interests;
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    await profile.destroy();
    res.json({ success: true, message: 'Profile deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const assignGuardian = async (req, res) => {
  try {
    const { guardianId } = req.body;
    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.guardian_id = guardianId;
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVerifiedUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        is_verified: true,
        is_deleted: false,
        id: { [Op.ne]: req.user.id },
      },
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: Profile,
        as: 'profile',
        required: false,
      }],
      order: [['created_at', 'DESC']],
    });

    return res.json({ success: true, users });
  } catch (err) {
    console.error('getVerifiedUsers error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateLastSeen = async (req, res) => {
  try {
    await Profile.update({ last_seen: new Date() }, { where: { individual_id: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id },
        is_deleted: false,
      },
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: Profile,
        as: 'profile',
        required: false,
      }],
      order: [['created_at', 'DESC']],
    });

    return res.json({ success: true, users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getMyGuardians = async (req, res) => {
  try {
    const guardians = await Guardian.findAll({
      where: { individual_id: req.user.id },
      include: [{
        model: User,
        as: 'guardianUser',
        attributes: { exclude: ['password_hash'] },
      }],
    });

    return res.json({ success: true, guardians });
  } catch (err) {
    console.error('getMyGuardians error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export default {
  createProfile, updatePrefs, uploadIdCard, updateProfile,
  updateGuardian, uploadImage, getCurrentUser,
  updateInterests, deleteProfile, assignGuardian,
  getVerifiedUsers, updateLastSeen, getAllUsers, getMyGuardians,
};