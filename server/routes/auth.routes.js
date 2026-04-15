const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middlewares/validation.middleware');
const Joi = require('joi');
const { authenticate } = require('../middlewares/auth.middleware');




router.post(
  '/register',
  validateBody(
    Joi.object({
      name: Joi.string().required(),
      gender: Joi.string().required(),
      email: Joi.string().email().required(),
      mobile: Joi.string().optional(),
      password_hash: Joi.string().min(6).required(),
      role: Joi.string().required()
    })
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
  '/verify-otp', authenticate,
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
  validateBody(
    Joi.object({



    })
  ),
  authController.sendOtp
);

router.post(
  '/change-password',
  validateBody(
    Joi.object({
      userid: Joi.string().required(),
      otp: Joi.string().required(),
      newPassword: Joi.string().required(),
    })
  ),
  authController.changePassword
);


module.exports = router;
