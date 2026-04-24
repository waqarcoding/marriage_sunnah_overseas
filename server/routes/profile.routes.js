import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Create / update profile
router.post('/create-profile', authenticate, profileController.createProfile);
router.put('/update-prefs', authenticate, profileController.updatePrefs);
router.post('/upload-idcard', authenticate, profileController.uploadIdCard);
router.put('/update-profile', authenticate, profileController.updateProfile);
router.put('/update-guardian', authenticate, profileController.updateGuardian);

// Get my profile
router.get('/get-profile', authenticate, profileController.getMyProfile);

router.post(
  '/upload-image',
  authenticate,
  upload.single('image'),
  profileController.uploadImage
);

router.get('/last-seen', authenticate, profileController.updateLastSeen);

export default router;