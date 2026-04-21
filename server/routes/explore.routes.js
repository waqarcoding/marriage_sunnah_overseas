const express = require('express');
const router = express.Router();

const exploreController = require('../controllers/explore.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// ── Explore feed ──────────────────────────────────────────────────────────────
router.get('/get-explore', authenticate, exploreController.getExplore);

// ── Options (from Options table) ──────────────────────────────────────────────
router.get('/options', authenticate, exploreController.getOptions);
router.get('/country/:country', authenticate, exploreController.getCountryOptions);

// ── Preferences ───────────────────────────────────────────────────────────────
router.get('/get-preferences', authenticate, exploreController.getPreferences);
router.post('/save-preferences', authenticate, exploreController.savePreferences);

// ── Admin: update any option field ───────────────────────────────────────────
// Body: { country: "Pakistan" | null, field: "religions", value: [...] }
router.post('/update-option', authenticate, authorizeRoles('admin'), exploreController.updateOption);

module.exports = router;