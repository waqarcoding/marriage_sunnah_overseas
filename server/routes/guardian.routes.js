'use strict';

const express = require('express');
const router = express.Router();
const guardian = require('../controllers/guardian.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const g = [authenticate, authorizeRoles('guardian')];
const auth = [authenticate]; // individual routes — any logged in user

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
router.post('/remove', ...auth, guardian.removeGuardian); // POST not DELETE

module.exports = router;