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
  const t = await sequelize.transaction(); // start transaction
  try {
    const { name, email, mobile, password_hash, role, gender } = req.body;


    // 1️⃣ Check if email OR phone already exists in a single query
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


      if (existingUser.email === email && existingUser.phone === mobile) {
        return res.status(400).json({ error: 'Email and phone already exist' });
      } else if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already exists' });
      } else if (existingUser.phone === mobile) {
        return res.status(400).json({ error: 'Phone number already exists' });
      }
    }

    // 2️⃣ Hash password if provided
    const hashedPassword = password_hash ? await bcrypt.hash(password_hash, 10) : null;


    // 3️⃣ Create user
    const user = await User.create(
      {
        name,
        email,
        mobile,
        role: role && role.trim() !== '' ? role : 'individual',
        password_hash: hashedPassword,
      },
      { transaction: t }
    );

    user.userid = user.id;
    await user.save();


    // 4️⃣ Create default profile  individual or guardian
    if (user.role === 'individual') {
      await Profile.create(
        {
          name: user.name || 'Anonymous',
          individual_id: user.id,
          gender: gender,

        },
        { transaction: t }
      );
    } else if (user.role === 'guardian') {
      await Profile.create(
        {
          name: user.name || 'Anonymous',
          guardian_id: user.id,
          individual_id: user.id,
          gender: gender
        },
        { transaction: t }
      );

    }


    // 5️⃣ Commit transaction
    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      userid: user.id,
    });
  } catch (err) {
    await t.rollback(); // rollback on error
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

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

exports.sendOtp = async (req, res) => {

  const currentUser = await User.findByPk(req.user.id);

  try {
    const userid = currentUser.id;
    const email = currentUser.email;

    // 1️⃣ Validate request
    if (!userid) {
      return res.status(400).json({ error: 'User Id is required' });
    }


    // 4️⃣ Generate OTP for two-step verification (optional)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();




    await Otp.create({
      user_id: userid,
      otp: otpCode,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    const html = otpTemplate({ otp: otpCode });

    await sendMail({
      to: email,
      subject: "Your OTP Code",
      html,
      text: `Your OTP is ${otpCode}. Valid for 10 minutes.`,
    });

    console.log(`OTP for user ${userid}: ${otpCode}`);
    // 6️⃣ Respond with success
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      user: { id: userid, email: email, otp: otpCode }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

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



/**
 * Change Password
 */

exports.changePassword = async (req, res) => {
  try {
    const { userid, otp, newPassword } = req.body;

    // 1️⃣ Validate request
    if (!userid || !otp || !newPassword) {
      return res.status(400).json({ error: 'UserId, OTP, and new password are required' });
    }

    // 2️⃣ Verify OTP
    const otpRecord = await Otp.findOne({
      where: {
        user_id: userid,
        otp: otp,
        expires_at: { [Op.gt]: new Date() } // Only non-expired OTP
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // 3️⃣ Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 4️⃣ Update user password
    await User.update(
      { password_hash: hashedPassword },
      { where: { id: userid } }
    );

    // 5️⃣ Optional: delete used OTP
    await Otp.destroy({ where: { id: otpRecord.id } });

    // 6️⃣ Respond success
    res.json({ success: true, message: 'Password changed successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};



