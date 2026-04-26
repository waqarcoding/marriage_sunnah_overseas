// @ts-nocheck
// routes/guardian.routes.js

import express from 'express';
import guardianController from '../controllers/guardian.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

const g = [authenticate, authorizeRoles('guardian')]; // guardian only
const auth = [authenticate];                              // any logged in user

// ── Guardian only ─────────────────────────────────────────────────────────────
router.post('/guardian-approve-interest', ...auth, guardianController.guardianApproveInterest);
router.post('/guardian-reject-interest', ...auth, guardianController.guardianRejectInterest);
router.get('/guardian-pending-interests', ...auth, guardianController.getGuardianPendingInterests);
router.get('/guardian-my-wards', ...auth, guardianController.getMyWards);
router.post('/guardian-add-ward', ...auth, guardianController.addWard);
router.post('/guardian-remove-ward', ...auth, guardianController.removeWard);
router.get('/guardian-search-wards', ...auth, guardianController.searchWards);
router.get('/guardian-pending-count', ...auth, guardianController.getPendingCount);

// ── Individual (ward) only ────────────────────────────────────────────────────
router.get('/search', ...auth, guardianController.searchGuardians);
router.post('/assign', ...auth, guardianController.assignGuardian);
router.get('/my-guardian', ...auth, guardianController.getMyGuardian);
router.post('/remove', ...auth, guardianController.removeGuardian);

export default router;