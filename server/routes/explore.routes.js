import express from 'express';
import exploreController from '../controllers/explore.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// ── Explore feed ──────────────────────────────────────────────────────────────
router.get('/get-explore', authenticate, exploreController.getExplore);

// ── Options (from Options table) ──────────────────────────────────────────────
router.get('/options', authenticate, exploreController.getOptions);
router.get('/country/:country', authenticate, exploreController.getCountryOptions);

// ── Preferences ───────────────────────────────────────────────────────────────
router.get('/get-preferences', authenticate, exploreController.getPreferences);
router.post('/save-preferences', authenticate, exploreController.savePreferences);

// ── Admin: update any option field ───────────────────────────────────────────
router.post('/update-option', authenticate, authorizeRoles('admin'), exploreController.updateOption);

export default router;