// @ts-nocheck
// routes/guardian.routes.js

import express from 'express';
import guardianController from '../controllers/guardian.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();
const auth = [authenticate];

// ── Guardian interest approval (uses interest controller internally) ───────────
router.post('/guardian-approve-interest', ...auth, guardianController.guardianApproveInterest);
router.post('/guardian-reject-interest', ...auth, guardianController.guardianRejectInterest);
router.get('/guardian-pending-interests', ...auth, guardianController.getGuardianPendingInterests);

// ── Guardian ward management ──────────────────────────────────────────────────
router.post('/verify-pin', ...auth, guardianController.verifyGuardianPin);
router.post('/link-with-pin', ...auth, guardianController.linkGuardianWithPin);
router.get('/guardian-my-wards', ...auth, guardianController.getMyWards);
router.post('/guardian-remove-ward', ...auth, guardianController.removeWard);
router.get('/guardian-search-wards', ...auth, guardianController.searchWards);
router.get('/guardian-pending-count', ...auth, guardianController.getPendingCount);

// ── Ward (individual) guardian management ────────────────────────────────────
router.post('/generate-pin', ...auth, guardianController.generateGuardianPin);
router.get('/my-pin', ...auth, guardianController.getMyPin);
router.get('/search', ...auth, guardianController.searchGuardians);
router.post('/assign', ...auth, guardianController.assignGuardian);
router.get('/my-guardian', ...auth, guardianController.getMyGuardian);
router.delete('/remove', ...auth, guardianController.removeGuardian);





export default router;