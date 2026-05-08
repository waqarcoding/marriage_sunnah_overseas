import db from '../models/index.js';
const { User, Profile, Guardian, Match, Message, Interest, Dislike, Preference, ContactReveal, sequelize } = db;
import { Op, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import { getUploadedUrl } from '../middlewares/upload.middleware.js';
// @ts-ignore
import { getVideoUrl } from '../middlewares/uploadvideos.middleware.js';
import { deductCredits, hasEnoughCredits } from '../utils/credits.js';
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
    if (!profile) return res.json({ success: false, message: 'Profile not found' });

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
      return res.json({ success: false, message: 'Both front and back ID images are required.' });
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
    if (!user) return res.json({ success: false, message: 'User not found' });

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
    if (!profile) return res.json({ success: false, message: "Profile not found" });

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
export const updateSettings = async (req, res) => {
  try {

    const allowed = [
      "is_show_last_seen",
      "is_blurred_images",
      "notifications",
      "email_updates"
    ];
    console.log("entered in backend");
    // Only pick allowed fields from body
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided"
      });
    }

    const profile = await Profile.findOne({
      where: { individual_id: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // ✅ Profile.update with where clause — skips full model validation
    await Profile.update(updates, {
      where: { individual_id: req.user.id }
    });
    console.log("Settings updated");
    return res.json({ success: true, message: "Settings updated" });

  } catch (err) {
    console.error("updateSettings error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update settings"
    });
  }

};
// ─── Update Guardian ──────────────────────────────────────────────────────────
export const updateGuardian = async (req, res) => {
  try {
    const { guardian_name, guardian_phone, guardian_email, guardian_relationship } = req.body;

    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.json({ success: false, message: "Profile not found" });

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


        { model: Match, as: 'matchesSent', attributes: ['id', 'created_at'] },
        { model: Match, as: 'matchesReceived', attributes: ['id', 'created_at'] },
        { model: Dislike, as: 'dislikesSent', attributes: ['id', 'created_at'] },
        { model: Dislike, as: 'dislikesReceived', attributes: ['id', 'created_at'] },
      ],
    });

    if (!user) return res.json({ error: "User not found" });

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
export const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Profile, as: "profile" },
        { model: Guardian, as: "guardians" },
        { model: Guardian, as: "individuals" },


        { model: Match, as: 'matchesSent', attributes: ['id', 'created_at'] },
        { model: Match, as: 'matchesReceived', attributes: ['id', 'created_at'] },
        { model: Dislike, as: 'dislikesSent', attributes: ['id', 'created_at'] },
        { model: Dislike, as: 'dislikesReceived', attributes: ['id', 'created_at'] },
      ],
    });

    if (!user) return res.json({ error: "User not found" });

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
    const userId = req.user.id;

    const user = await User.findByPk(req.user.id);

    // ✅ req.files['image'][0] — because we use upload.fields()
    const file = req.files?.['image']?.[0];
    if (!file) return res.json({ success: false, message: "No file uploaded" });

    const imageUrl = getUploadedUrl(file);

    const profile = await Profile.findOne({ where: { individual_id: userId } });
    if (!profile) return res.json({ success: false, message: "Profile not found" });

    // ✅ Deduct credits using utility, but do NOT deduct if uploading or replacing MAIN image (index 0)
    const PHOTO_COST = 5;


    let creditResult = { success: true }; // default: assume success if main image
    if (parseInt(req.body.index, 10) !== 0) {
      creditResult = await deductCredits(userId, PHOTO_COST, 'Photo upload');

      if (!creditResult.success) {
        if (creditResult.code === 'INSUFFICIENT_CREDITS') {
          return res.json({
            success: false,
            message: `Insufficient credits. You have ${creditResult.currentBalance} credits but need ${creditResult.required} credits to upload a photo or upgrade`,
            currentBalance: creditResult.currentBalance,
            required: creditResult.required,
            deficit: creditResult.deficit
          });
        }
        return res.status(500).json({
          success: false,
          message: creditResult.error || "Failed to deduct credits"
        });
      }
    }

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

    await user.update({ avatar_url: images[0] });
    await profile.update({ images: JSON.stringify(images) });

    return res.json({
      success: true,
      imageUrl,
      images,
      creditsRemaining: creditResult.newBalance,
      creditsDeducted: creditResult.deducted,
      previousBalance: creditResult.previousBalance
    });

  } catch (err) {
    console.error("uploadImage error:", err);
    return res.status(500).json({ success: false, message: err || "Server error" });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.files?.video?.[0];
    const index = parseInt(req.body.index ?? 0); // ✅ which slot to replace

    if (!file) {
      return res.json({ success: false, message: "No video file uploaded" });
    }

    const videoUrl = getVideoUrl(file);

    const profile = await Profile.findOne({ where: { individual_id: userId } });
    if (!profile) {
      return res.json({ success: false, message: "Profile not found" });
    }

    // ✅ Deduct credits using utility
    const VIDEO_COST = 20;
    const creditResult = await deductCredits(userId, VIDEO_COST, 'Video upload');

    if (!creditResult.success) {
      if (creditResult.code === 'INSUFFICIENT_CREDITS') {
        return res.json({
          success: false,
          message: `Insufficient credits. You have ${creditResult.currentBalance} credits but need ${creditResult.required} credits to upload a video.`,
          currentBalance: creditResult.currentBalance,
          required: creditResult.required,
          deficit: creditResult.deficit
        });
      }
      return res.status(500).json({
        success: false,
        message: creditResult.error || "Failed to deduct credits"
      });
    }

    let videos = [];
    try { videos = JSON.parse(profile.videos || "[]"); } catch { videos = []; }
    if (!Array.isArray(videos)) videos = [];

    // ✅ Max 4 slots — replace at index or push to next empty slot
    const slot = (index >= 0 && index < 4) ? index : videos.length;
    videos[slot] = videoUrl;
    videos = videos.slice(0, 4); // never exceed 4

    await profile.update({ videos: JSON.stringify(videos) });

    return res.json({
      success: true,
      videoUrl,
      videos,
      slot,
      creditsRemaining: creditResult.newBalance,
      creditsDeducted: creditResult.deducted,
      previousBalance: creditResult.previousBalance
    });
  } catch (err) {
    console.error("uploadVideo error:", err);
    return res.status(500).json({ success: false, message: err || "Server error" });
  }
};
// ─── Remaining controllers ────────────────────────────────────────────────────

export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.json({ error: 'Profile not found' });
    profile.interests = Array.isArray(interests) ? JSON.stringify(interests) : interests;
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
// ── DELETE /auth/delete-account ───────────────────────────────────────────────
// GDPR compliant — deletes user + profile + all associated data
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Sequelize cascade handles related records if associations set up
    // Otherwise delete manually in order
    await Profile.destroy({ where: { individual_id: userId } });
    await User.destroy({ where: { id: userId } });

    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error:", err);
    return res.status(500).json({ success: false, message: err || "Server error" });
  }
};

export const assignGuardian = async (req, res) => {
  try {
    const { guardianId } = req.body;
    const profile = await Profile.findOne({ where: { individual_id: req.user.id } });
    if (!profile) return res.json({ error: 'Profile not found' });
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
    await User.update({ last_seen: new Date() }, { where: { id: req.user.id } });
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
// ── Delete Image ──────────────────────────────────────────────────────────────
export const deleteImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const index = parseInt(req.params.index);

    const profile = await Profile.findOne({ where: { individual_id: userId } });
    if (!profile) {
      return res.json({ success: false, message: 'Profile not found' });
    }

    // Parse images array
    let images = [];
    try {
      images = typeof profile.images === 'string'
        ? JSON.parse(profile.images)
        : (Array.isArray(profile.images) ? profile.images : []);
    } catch {
      images = [];
    }

    // Check if index is valid
    if (index < 0 || index >= images.length) {
      return res.json({ success: false, message: 'Invalid image index' });
    }

    // Remove the image at the specified index
    const deletedImage = images[index];
    images.splice(index, 1);

    // Update profile with new images array
    await profile.update({ images: JSON.stringify(images) });

    // Optional: Delete the actual file from disk/storage
    // if (deletedImage) {
    //     const fs = require('fs');
    //     const path = require('path');
    //     const filePath = path.join(__dirname, '../../', deletedImage);
    //     if (fs.existsSync(filePath)) {
    //         fs.unlinkSync(filePath);
    //     }
    // }

    return res.json({
      success: true,
      message: 'Image deleted successfully',
      images: images
    });
  } catch (err) {
    console.error('deleteImage error:', err);
    return res.status(500).json({ success: false, message: err });
  }
};

// ── Delete Video ──────────────────────────────────────────────────────────────
export const deleteVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const index = parseInt(req.params.index);

    const profile = await Profile.findOne({ where: { individual_id: userId } });
    if (!profile) {
      return res.json({ success: false, message: 'Profile not found' });
    }

    // Parse videos array
    let videos = [];
    try {
      videos = typeof profile.videos === 'string'
        ? JSON.parse(profile.videos)
        : (Array.isArray(profile.videos) ? profile.videos : []);
    } catch {
      videos = [];
    }

    // Check if index is valid
    if (index < 0 || index >= videos.length) {
      return res.json({ success: false, message: 'Invalid video index' });
    }

    // Remove the video at the specified index
    const deletedVideo = videos[index];
    videos.splice(index, 1);

    // Update profile with new videos array
    await profile.update({ videos: JSON.stringify(videos) });

    // Optional: Delete the actual file from disk/storage
    // if (deletedVideo) {
    //     const fs = require('fs');
    //     const path = require('path');
    //     const filePath = path.join(__dirname, '../../', deletedVideo);
    //     if (fs.existsSync(filePath)) {
    //         fs.unlinkSync(filePath);
    //     }
    // }

    return res.json({
      success: true,
      message: 'Video deleted successfully',
      videos: videos
    });
  } catch (err) {
    console.error('deleteVideo error:', err);
    return res.status(500).json({ success: false, message: err });
  }
};
// controllers/profileController.js




// ──────────────────────────────────────────────────────────────────────────
// Reveal Contact Information (Using Credits System)
// ──────────────────────────────────────────────────────────────────────────
export const revealContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = parseInt(req.params.userId);
    const { revealType = 'both' } = req.body;

    console.log(`🔍 revealContact: userId=${userId}, targetUserId=${targetUserId}, revealType=${revealType}`);

    const CREDIT_COST = {
      phone: 500,
      email: 500,
      both: 1000
    };

    const creditsRequired = CREDIT_COST[revealType];

    // Validate reveal type
    if (!['phone', 'email', 'both'].includes(revealType)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_reveal_type',
        message: 'Reveal type must be: phone, email, or both'
      });
    }

    // Check self-reveal
    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'self_reveal',
        message: 'Cannot reveal your own contact'
      });
    }

    // ✅ Check if already revealed FIRST (no transaction needed for read)
    const existingReveal = await ContactReveal.findOne({
      where: {
        revealer_user_id: userId,
        revealed_user_id: targetUserId
      }
    });

    if (existingReveal) {
      console.log(`✅ Already revealed - returning cached`);

      const targetUser = await User.unscoped().findByPk(targetUserId, {
        attributes: ['id', 'name', 'mobile', 'email']
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: 'user_not_found',
          message: 'Target user not found'
        });
      }

      const contactInfo = { name: targetUser.name };
      if (revealType === 'phone' || revealType === 'both') {
        contactInfo.phone = targetUser.mobile;
      }
      if (revealType === 'email' || revealType === 'both') {
        contactInfo.email = targetUser.email;
      }

      const currentUser = await User.findByPk(userId, {
        attributes: ['credits', 'unlimited_contact_reveals']
      });

      return res.json({
        success: true,
        alreadyRevealed: true,
        data: {
          contactInfo,
          creditsRemaining: currentUser.credits,
          unlimitedReveals: currentUser.unlimited_contact_reveals
        }
      });
    }

    // ✅ Check interest (no transaction needed for read)
    const interest = await Interest.findOne({
      where: {
        [Op.or]: [
          { from_user: userId, to_user: targetUserId },
          { from_user: targetUserId, to_user: userId }
        ]
      }
    });

    if (!interest) {
      return res.status(403).json({
        success: false,
        error: 'no_interest',
        message: 'You need to send an interest to this user first before revealing contact details.'
      });
    }

    if (interest.status !== 'accepted') {
      return res.status(403).json({
        success: false,
        error: 'interest_not_accepted',
        message: `Interest is currently ${interest.status}. Both users must accept the interest before revealing contact details.`
      });
    }

    if (!interest.both_guardians_approved && (interest.from_guardian || interest.to_guardian)) {
      const pendingApprovals = [];
      if (interest.from_guardian && interest.from_guardian_status !== 'accepted') {
        pendingApprovals.push('sender\'s guardian');
      }
      if (interest.to_guardian && interest.to_guardian_status !== 'accepted') {
        pendingApprovals.push('receiver\'s guardian');
      }

      const waitingFor = pendingApprovals.length > 0
        ? `Waiting for approval from: ${pendingApprovals.join(' and ')}.`
        : 'Waiting for family approval.';

      return res.status(403).json({
        success: false,
        error: 'guardian_approval_required',
        message: `Contact details can only be revealed after both families approve the match. ${waitingFor}`
      });
    }

    if (!interest.both_users_approved) {
      return res.status(403).json({
        success: false,
        error: 'users_approval_required',
        message: 'Both users must approve the interest before contact details can be revealed.'
      });
    }

    // ✅ Get current user
    const currentUser = await User.findByPk(userId);

    if (!currentUser.unlimited_contact_reveals) {
      // Check credits
      if (currentUser.credits < creditsRequired) {
        return res.status(400).json({
          success: false,
          error: 'insufficient_credits',
          message: `Insufficient credits. Need ${creditsRequired} credits to reveal ${revealType}.`,
          data: {
            creditsRequired,
            currentCredits: currentUser.credits,
            deficit: creditsRequired - currentUser.credits
          }
        });
      }

      console.log(`💳 Deducting ${creditsRequired} credits...`);

      // ✅ Deduct credits directly (faster than function call)
      await User.update(
        { credits: sequelize.literal(`credits - ${creditsRequired}`) },
        { where: { id: userId } }
      );

      console.log(`✅ Credits deducted`);
    }

    // ✅ Get target user
    const targetUser = await User.unscoped().findByPk(targetUserId, {
      attributes: ['id', 'name', 'mobile', 'email']
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'user_not_found',
        message: 'Target user not found'
      });
    }

    // ✅ Record reveal
    await ContactReveal.create({
      revealer_user_id: userId,
      revealed_user_id: targetUserId,
      match_id: null,
      reveal_type: revealType,
      credits_used: currentUser.unlimited_contact_reveals ? 0 : creditsRequired,
      is_unlimited_plan: currentUser.unlimited_contact_reveals
    });

    // Prepare contact info
    const contactInfo = { name: targetUser.name };
    if (revealType === 'phone' || revealType === 'both') {
      contactInfo.phone = targetUser.mobile;
    }
    if (revealType === 'email' || revealType === 'both') {
      contactInfo.email = targetUser.email;
    }

    const newCredits = currentUser.credits - (currentUser.unlimited_contact_reveals ? 0 : creditsRequired);

    console.log(`✅ Reveal complete - sending response`);

    return res.json({
      success: true,
      alreadyRevealed: false,
      data: {
        contactInfo,
        creditsUsed: currentUser.unlimited_contact_reveals ? 0 : creditsRequired,
        creditsRemaining: newCredits,
        unlimitedReveals: currentUser.unlimited_contact_reveals
      }
    });

  } catch (error) {
    console.error('❌ Contact reveal error:', error);

    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to reveal contact information',
      details: error
    });
  }
};

export const checkContactRevealStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = parseInt(req.params.userId);

    // Check if already revealed
    const reveal = await ContactReveal.findOne({
      where: {
        revealer_user_id: userId,
        revealed_user_id: targetUserId
      },
      attributes: ['reveal_type', 'created_at', 'credits_used'] // ✅ Changed revealed_at to created_at
    });

    // Check interest status
    const interest = await Interest.findOne({
      where: {
        [Op.or]: [
          { from_user: userId, to_user: targetUserId },
          { from_user: targetUserId, to_user: userId }
        ]
      }
    });

    console.log({
      isRevealed: !!reveal,
      revealType: reveal?.reveal_type || null,
      revealedAt: reveal?.created_at || null, // ✅ Changed to created_at
      creditsUsed: reveal?.credits_used || 0,

      // Approval status
      interestExists: !!interest,
      interestAccepted: interest?.status === 'accepted',
      guardiansInvolved: !!(interest?.from_guardian || interest?.to_guardian),
      guardiansApproved: interest?.both_guardians_approved || false
    })

    return res.json({
      success: true,
      data: {
        isRevealed: !!reveal,
        revealType: reveal?.reveal_type || null,
        revealedAt: reveal?.created_at || null, // ✅ Changed to created_at
        creditsUsed: reveal?.credits_used || 0,

        // Approval status
        interestExists: !!interest,
        interestAccepted: interest?.status === 'accepted',
        guardiansInvolved: !!(interest?.from_guardian || interest?.to_guardian),
        guardiansApproved: interest?.both_guardians_approved || false
      }
    });

  } catch (error) {
    console.error('Check reveal status error:', error);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to check reveal status'
    });
  }
};

export const getContactRevealStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['credits', 'unlimited_contact_reveals', 'subscription_expires_at']
    });

    if (!user) {
      return res.json({
        success: false,
        error: 'user_not_found',
        message: 'User not found'
      });
    }

    // Count total reveals used
    const totalRevealsUsed = await ContactReveal.count({
      where: { revealer_user_id: userId }
    });

    // Sum total credits spent on reveals
    const totalCreditsSpent = await ContactReveal.sum('credits_used', {
      where: { revealer_user_id: userId }
    }) || 0;

    // Check if subscription is active
    const isSubscriptionActive = user.subscription_expires_at &&
      new Date(user.subscription_expires_at) > new Date();

    console.log(user.credits)

    return res.json({
      success: true,
      data: {
        creditsRemaining: user.credits,
        unlimitedReveals: user.unlimited_contact_reveals,
        totalRevealsUsed,
        totalCreditsSpent,
        isSubscriptionActive,
        subscriptionExpiresAt: user.subscription_expires_at,
        creditCosts: {
          phone: 500,
          email: 500,
          both: 1000
        }
      }
    });

  } catch (error) {
    console.error('Get reveal stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to get reveal stats'
    });
  }
};


// profile.controller.js

export const updateAboutInterest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, interests } = req.body;

    const profile = await Profile.findOne({ where: { individual_id: userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    await profile.update({ bio, interests });

    return res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("updateAboutInterest error:", err);
    return res.status(500).json({ message: err });
  }
};
export const changePassword = async (req, res) => {
  try {
    const oldPassword = req.body.current_password;
    const newPassword = req.body.new_password;
    const userId = req.user.id;

    console.log("oldPassword:", oldPassword);
    console.log("newPassword:", newPassword);
    console.log("userId:", userId);

    // Find user by ID — explicitly include password field
    const user = await User.findByPk(userId, {
      attributes: { include: ["password_hash"] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'user_not_found',
        message: 'User not found'
      });
    }

    console.log(" old password:", user?.password_hash);

    if (!oldPassword || !user.password_hash) {
      return res.status(400).json({
        success: false,
        error: 'missing_fields',
        message: 'Current password is required'
      });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'invalid_old_password',
        message: 'Old password is incorrect'
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'same_password',
        message: 'New password must be different from current password'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password_hash: hashedPassword });

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to change password'
    });
  }
};
export default {
  createProfile, updatePrefs, uploadIdCard, updateProfile,
  updateGuardian, uploadImage, getCurrentUser,
  updateInterests, deleteAccount, assignGuardian,
  getVerifiedUsers, updateLastSeen, getAllUsers, getMyGuardians, deleteVideo, deleteImage, getContactRevealStats, checkContactRevealStatus, revealContact
};


