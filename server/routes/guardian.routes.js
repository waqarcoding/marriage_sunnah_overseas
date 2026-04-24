'use strict';

import express from 'express';
import guardian from '../controllers/guardian.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

const g = [authenticate, authorizeRoles('guardian')];
const auth = [authenticate];

// ── Guardian only ─────────────────────────────────────────────
router.post('/assign-children', ...g, guardian.assignChildren);
router.put('/guardian-approve/:interestId', ...g, guardian.guardianApprove);
router.get('/pending-interests', ...g, guardian.getPendingInterests);
router.put('/interests/:interestId/approve', ...g, guardian.approveInterest);
router.put('/interests/:interestId/reject', ...g, guardian.rejectInterest);

// ── Individual only ───────────────────────────────────────────
router.get('/search', ...auth, guardian.searchGuardians);
router.post('/assign', ...auth, guardian.assignGuardian);
router.get('/my-guardian', ...auth, guardian.getMyGuardian);
router.post('/remove', ...auth, guardian.removeGuardian);

export default router;