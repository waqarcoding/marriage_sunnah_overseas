import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import upload from '../middlewares/upload.middleware.js';
const router = express.Router();

// Create / update profile
router.post('/create-profile', authenticate, profileController.createProfile);
router.put('/update-prefs', authenticate, profileController.updatePrefs);

router.put('/update-profile', authenticate, profileController.updateProfile);
router.put('/update-guardian', authenticate, profileController.updateGuardian);

// Get my profile
router.get('/get-current-user', authenticate, profileController.getCurrentUser);
router.get('/get-all-users', authenticate, profileController.getAllUsers);

router.get('/get-verified-users', authenticate, profileController.getVerifiedUsers);

// ── ID card — two fields ──────────────────────────────────────────────────────
router.post('/upload-idcard',
  authenticate,
  upload.fields([
    { name: 'front_id', maxCount: 1 },
    { name: 'back_id', maxCount: 1 },
  ]),
  profileController.uploadIdCard
);

// ── Profile image — single field ──────────────────────────────────────────────
router.post('/upload-image',
  authenticate,
  upload.fields([{ name: 'image', maxCount: 1 }]),
  profileController.uploadImage
);

router.get('/last-seen', authenticate, profileController.updateLastSeen);

export default router;