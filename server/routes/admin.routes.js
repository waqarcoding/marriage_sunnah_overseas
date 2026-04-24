import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// Get pending profiles
router.get('/pending-profiles', authenticate, authorizeRoles('admin'), adminController.getPendingProfiles);

// Suspend user
router.delete('/suspend/:userId', authenticate, authorizeRoles('admin'), adminController.suspendUser);

export default router;