import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import videoupload from '../middlewares/uploadvideos.middleware.js';
const router = express.Router();

// Create / update profile
router.post('/create-profile', authenticate, profileController.createProfile);
router.put('/update-prefs', authenticate, profileController.updatePrefs);
router.put('/change-password', authenticate, profileController.changePassword);
router.put('/update-about', authenticate, profileController.updateAboutInterest);

router.put('/update-profile', authenticate, profileController.updateProfile);
router.put('/update-guardian', authenticate, profileController.updateGuardian);
router.patch('/settings', authenticate, profileController.updateSettings);
// Get my profile
router.get('/get-current-user', authenticate, profileController.getCurrentUser);
router.get('/get-user/:id', authenticate, profileController.getUserById);
router.get('/get-all-users', authenticate, profileController.getAllUsers);

// Delete image/video
router.delete('/delete-image/:index', authenticate, profileController.deleteImage);
router.delete('/delete-video/:index', authenticate, profileController.deleteVideo);

// Verified users
router.get('/get-verified-users', authenticate, profileController.getVerifiedUsers);

// Upload video
router.post(
  "/upload-video",
  authenticate,
  videoupload.fields([{ name: "video", maxCount: 1 }]),
  profileController.uploadVideo
);

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

// Last seen
router.get('/last-seen', authenticate, profileController.updateLastSeen);

// ── Contact Reveal Routes ─────────────────────────────────────────────────────
router.post('/reveal-contact/:userId', authenticate, profileController.revealContact);
router.get('/contact-reveal-status/:userId', authenticate, profileController.checkContactRevealStatus);
router.get('/contact-reveal-stats', authenticate, profileController.getContactRevealStats);

// Delete account
router.delete("/delete-account", authenticate, profileController.deleteAccount);

export default router;