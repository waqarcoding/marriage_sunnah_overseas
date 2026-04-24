import express from 'express';
import Joi from 'joi';
import authController from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/uploadfilemulter.js';

const router = express.Router();

router.post(
  '/register',
  upload.single('profilePhoto'),
  validateBody(
    Joi.object({
      name: Joi.string().required(),
      gender: Joi.string().required(),
      email: Joi.string().email().required(),
      mobile: Joi.string().optional(),
      password_hash: Joi.string().required(),
      role: Joi.string().required()
    }).unknown(true)
  ),
  authController.signup
);

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
  '/send-otp-byemail',
  validateBody(
    Joi.object({
      email: Joi.string().email().required(),
    })
  ),
  authController.sendOTPbyEmail
);

router.post(
  '/forgot-password-reset',
  validateBody(
    Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().required(),
      newPassword: Joi.string().required(),
    })
  ),
  authController.ressetPassword
);

export default router;