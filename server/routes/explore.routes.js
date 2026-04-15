const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/explore.controller')
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Get Explore
router.get('/get-explore', authenticate, exploreController.getExplore);


module.exports = router;
