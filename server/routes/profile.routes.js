const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validation.middleware');

const Joi = require('joi');
const upload = require('../middlewares/upload');



// Create / update profile
router.post('/create-profile', authenticate, profileController.createProfile);
router.put('/update-prefs', authenticate, profileController.updatePrefs);
router.post('/upload-idcard', authenticate, profileController.uploadIdCard);
router.put('/update-profile', authenticate, profileController.updateProfile);
router.put('/update-guardian', authenticate, profileController.updateGuardian);


// Get my profile
router.get('/get-profile', authenticate, profileController.getMyProfile);

router.post(
  "/upload-image",
  authenticate,
  upload.single("image"),
  profileController.uploadImage
);



router.get('/last-seen', authenticate, profileController.updateLastSeen);
module.exports = router;
