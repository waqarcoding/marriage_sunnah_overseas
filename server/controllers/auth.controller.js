import 'dotenv/config';
import db from '../models/index.js';
const { sequelize, User, Profile, Match, Guardian, Interest, Message, Otp } = db;
import bcrypt from 'bcrypt';
import { sendMail } from '../mail/service.js';
import { otpTemplate } from '../mail/mailTemplates.js';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { getUploadedUrl } from '../middlewares/upload.middleware.js';

/**
 * Helper: Generate and store OTP for a user
 */
const createOtp = async (userId) => {
  // Generate a 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Invalidate any previous OTPs for this user (optional, for better robustness)
  await Otp.destroy({
    where: { user_id: userId }
  });

  // Store the new OTP with a 5-minute expiration
  await Otp.create({
    user_id: userId,
    otp: otpCode,
    expires_at: new Date(Date.now() + 10 * 60 * 1000)
  });

  return otpCode;
};

/**
 * Signup user
 */
export const signup = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);

  const t = await sequelize.transaction();
  try {
    const { name, email, mobile, password_hash, role, gender } = req.body;

    const photoFile = req.files?.['image']?.[0] || null;
    const photoPath = photoFile ? getUploadedUrl(photoFile) : null;
    console.log("avatar_url:", photoPath);

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          email ? { email } : null,
          mobile ? { mobile } : null,
        ].filter(Boolean),
      },
      transaction: t,
    });

    if (existingUser) {
      await t.rollback();
      if (existingUser.email === email)
        return res.status(400).json({ success: false, message: "Email already exists" });
      return res.status(400).json({ success: false, message: "Phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);

    const user = await User.create({
      name,
      email,
      mobile,
      avatar_url: photoPath,
      role: role?.trim() || "individual",
      password_hash: hashedPassword,
    }, { transaction: t });

    await Profile.create({
      name,
      guardian_id: user.id,
      individual_id: user.id,
      gender,
      phone: mobile,
      images: JSON.stringify(photoPath ? [photoPath] : []),
    }, { transaction: t });

    await t.commit();

    const otpCode = await createOtp(user.id);
    console.log(`OTP for user ${user.id}: ${otpCode}`);

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        avatar_url: photoPath,

        email: user.email,
        name: user.name,
        mobile: user.mobile
      },
      // @ts-ignore
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      userid: user.id,
      photo: photoPath,
      user: { ...user.toJSON(), password_hash: undefined },
    });

  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

/**
 * Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'password_hash', 'email', 'role', 'avatar_url'],
      include: [{ as: 'profile', model: Profile }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Email not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const otpCode = await createOtp(user.id);
    console.log(`OTP for user ${user.id}: ${otpCode}`);

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined in .env');

    // Populate avatar_url from profile if available, fallback to user.avatar_url
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name ?? null,
      avatar_url: (user.profile && Array.isArray(user.profile.images) && user.profile.images.length > 0)
        ? user.profile.images[0]
        : user.profile?.avatar_url || user.avatar_url || null,

      city: user.profile?.city ?? null,
      country: user.profile?.country ?? null,
      ts: Date.now(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful. OTP sent',
      token,
      user: payload
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const currentUser = await User.findByPk(req.user.id);
    const userid = currentUser.id;

    const record = await Otp.findOne({
      where: { user_id: userid, otp },
      order: [['created_at', 'DESC']],
    });

    if (!record || record.expires_at < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const profile = await Profile.findOne({ where: { individual_id: userid } });


    const user = await User.findOne({ where: { id: userid } });
    if (user) {

      return res.json({
        success: true,
        message: 'OTP Verified successfully',
        profile: profile
      });
    }

    res.status(400).json({ error: 'User not found' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Send OTP by JWT user id
 */
export const sendOtpById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otpCode = await createOtp(user.id);
    console.log(`OTP (by id) for user ${user.email}: ${otpCode}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      user: { id: user.id, email: user.email, otp: otpCode }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err });
  }
};

/**
 * Send OTP by email
 */
export const sendOTPbyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const otpCode = await createOtp(user.id);
    console.log(`OTP for ${email}: ${otpCode}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      user: { id: user.id, email: user.email, otp: otpCode }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err });
  }
};

/**
 * Reset Password
 */
export const ressetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP and new password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const otpRecord = await Otp.findOne({
      where: { user_id: user.id, otp },
      order: [["created_at", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hashedPassword });
    await otpRecord.destroy();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err });
  }
};

export default {
  signup,
  login,
  verifyOtp,
  sendOtpById,
  sendOTPbyEmail,
  ressetPassword,
};