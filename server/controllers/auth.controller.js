require('dotenv').config(); // load env variables
const db = require('../models');
const { sequelize, User, Profile, Match, Guardian, Interest, Message, Otp } = db; // ✅ use initialized models

const bcrypt = require('bcrypt');
const { sendMail } = require('../mail/service');
const { otpTemplate } = require('../mail/mailTemplates');


const { Op, where } = require('sequelize');
const jwt = require('jsonwebtoken');


/**
 * Signup user
 */
exports.signup = async (req, res) => {
  console.log("req.body:", req.body)
  console.log("req.file:", req.file)
  const t = await sequelize.transaction()
  try {
    const { name, email, mobile, password_hash, role, gender } = req.body
    const photoPath = req.file ? `/uploads/profile/${req.file.filename}` : null

    // 1️⃣ Check if email OR phone already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          email ? { email } : null,
          mobile ? { mobile } : null,
        ].filter(Boolean),
      },
      transaction: t,
    })

    if (existingUser) {
      await t.rollback()
      if (existingUser.email === email) {
        return res.status(400).json({ success: false, message: "Email already exists" })
      }
      return res.status(400).json({ success: false, message: "Phone number already exists" })
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password_hash, 10)

    // 3️⃣ Create user
    const user = await User.create(
      {
        name,
        email,
        mobile,
        role: role?.trim() || "individual",
        password_hash: hashedPassword,
      },
      { transaction: t }
    )

    // 4️⃣ Create profile
    const images = photoPath ? [photoPath] : []

    await Profile.create(
      {
        name: user.name,
        guardian_id: user.id,
        individual_id: user.id,
        gender,
        phone: mobile,
        images: JSON.stringify(images),
      },
      { transaction: t }
    )
    // 5️⃣ Commit transaction
    await t.commit()

    // 6️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      // @ts-ignore
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user,
      userid: user.id,
      photo: photoPath,
    })
  } catch (err) {
    await t.rollback()
    console.error(err)
    res.status(500).json({ success: false, message: "Server error", error: err })
  }
}

/**
 * Login / request OTP
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate request
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2️⃣ Check if user exists
    const user = await User.findOne({
      as: 'profile',
      where: { email },
      attributes: ['id', 'password_hash', 'email', 'role'],
      include: [
        {
          as: 'profile',
          model: Profile,

        }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Email not found' });
    }



    // 3️⃣ Check password (assuming stored in plain text or hashed)
    // If hashed, use bcrypt.compare(password, user.password)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    // 4️⃣ Generate OTP for two-step verification (optional)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({
      user_id: user.id,
      otp: otpCode,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });


    /*
    
    const html = otpTemplate({ otp: otpCode });
    await sendMail({
      to: "waqarcoding@gmail.com",
      subject: "Your OTP Code",
      // @ts-ignore
      html: html, // Template generates layout & OTP
      text: `Your OTP is ${otpCode}. Valid for 10 minutes.`,
    });

    */
    console.log(`OTP for user ${user.id}: ${otpCode}`);

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in .env');
    }


    console.log("User object before signing JWT:", user);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.Profile?.name ?? null,
      image: user.Profile?.image ?? null,
      city: user.Profile?.city ?? null,
      country: user.Profile?.country ?? null,
      ts: Date.now(),
    };

    console.log("Payload:", payload); // log the actual object you are signing

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    console.log("Generated JWT Token:", token);

    // 6️⃣ Respond with success
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
exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const currentUser = await User.findByPk(req.user.id);
    const userid = currentUser.id;
    // 1️⃣ Find OTP record
    const record = await Otp.findOne({
      where: { user_id: userid, otp },
      order: [['created_at', 'DESC']],
    });

    if (!record || record.expires_at < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // 2️⃣ Update user's profile to mark as verified
    const profile = await Profile.findOne({ where: { individual_id: userid } });
    if (profile) {
      profile.is_verified = true; // mark as verified
      await profile.save();
    }

    const user = await User.findOne({ where: { id: userid } });
    if (user) {
      user.is_verified = true; // mark as verified
      await user.save();

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in .env');
      }

      // 4️⃣ Return success + token
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

// controllers/authController.js
/**
 * Send OTP (by JWT user id)
 * Used for 2-step verification when logged in (payload: { otp } in body, user ID from JWT)
 */
exports.sendOtpById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      user_id: user.id,
      otp: otpCode,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

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

exports.sendOTPbyEmail = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" })
    }

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" })
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    await Otp.create({
      user_id: user.id,
      otp: otpCode,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    })

    console.log(`OTP for ${email}: ${otpCode}`)

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      user: { id: user.id, email: user.email, otp: otpCode }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Internal Server Error", error: err })
  }
}

exports.ressetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP and new password are required" })
    }

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" })
    }

    const otpRecord = await Otp.findOne({
      where: { user_id: user.id, otp },
      order: [["created_at", "DESC"]],
    })

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP" })
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ success: false, message: "OTP has expired" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await user.update({ password_hash: hashedPassword })
    await otpRecord.destroy()

    res.status(200).json({ success: true, message: "Password reset successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Internal Server Error", error: err })
  }
}




