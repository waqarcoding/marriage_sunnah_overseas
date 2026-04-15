const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Get pending profiles
router.get('/pending-profiles', authenticate, authorizeRoles('admin'), adminController.getPendingProfiles);

// Suspend user
router.delete('/suspend/:userId', authenticate, authorizeRoles('admin'), adminController.suspendUser);

module.exports = router;
