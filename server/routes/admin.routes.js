import express from 'express';
import adminController from '../controllers/admin.controller.js';
import profileController from '../controllers/profile.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/get-profile', authenticate, profileController.getCurrentUser);
router.get('/get-verified-users', authenticate, profileController.getVerifiedUsers);
router.get('/pending-profiles', authenticate, authorizeRoles('admin'), adminController.getPendingProfiles);
router.get('/get-all-users', authenticate, profileController.getAllUsers);
// Suspend user
router.delete('/suspend/:userId', authenticate, authorizeRoles('admin'), adminController.suspendUser);

export default router;