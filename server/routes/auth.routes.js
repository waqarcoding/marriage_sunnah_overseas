const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middlewares/validation.middleware');
const Joi = require('joi');
const { authenticate } = require('../middlewares/auth.middleware');

const upload = require('../middlewares/uploadfilemulter');


// routes/authRoutes.js
router.post(
  '/register',

  upload.single('profilePhoto'),   // ← multer middleware here

  validateBody(
    Joi.object({
      name: Joi.string().required(),
      gender: Joi.string().required(),
      email: Joi.string().email().required(),
      mobile: Joi.string().optional(),
      password_hash: Joi.string().required(),
      role: Joi.string().required()
    }).unknown(true)  // ← allows extra fields multer might add
  ),
  authController.signup
)

router.post(
  '/login',
  validateBody(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })
  ),
  authController.login
);


router.post(
  '/verify-otp',
  authenticate,
  validateBody(
    Joi.object({

      otp: Joi.string().required(),
    })
  ),
  authController.verifyOtp
);
router.post(
  '/send-otp',
  authenticate,
  authController.sendOtpById
);

router.post(
  "/send-otp-byemail",
  validateBody(
    Joi.object({
      email: Joi.string().email().required(),
    })
  ),
  authController.sendOTPbyEmail
);
router.post(
  "/forgot-password-reset",

  validateBody(
    Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().required(),
      newPassword: Joi.string().required(),
    })
  ),
  authController.ressetPassword
) // includes middleware for { email, otp, newPassword } required

module.exports = router;
