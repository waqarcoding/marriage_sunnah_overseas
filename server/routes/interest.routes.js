// @ts-nocheck
// routes/interest.routes.js

import express from 'express';
import Joi from 'joi';
import interestController from '../controllers/interest.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';

const router = express.Router();

const interestIdSchema = Joi.object({ interestId: Joi.number().required() });

// ── Send / Cancel ─────────────────────────────────────────────────────────────
router.post('/send-interest',
    authenticate,
    validateBody(Joi.object({
        interestId: Joi.number().required(),
        isSuperLike: Joi.boolean().default(false),
    })),
    interestController.sendInterest
);

router.post('/cancel-interest',
    authenticate,
    validateBody(interestIdSchema),
    interestController.cancelInterest
);

// ── Accept / Decline ──────────────────────────────────────────────────────────
router.post('/accept-interest',
    authenticate,
    validateBody(interestIdSchema),
    interestController.acceptInterest
);

router.post('/decline-interest',
    authenticate,
    validateBody(interestIdSchema),
    interestController.declineInterest
);

// ── Dislike (alias for decline) ───────────────────────────────────────────────
router.post('/dislike',
    authenticate,
    validateBody(interestIdSchema),
    interestController.sendDislike
);

// ── Get interests ─────────────────────────────────────────────────────────────
router.get('/get-interests', authenticate, interestController.getInterests);
router.get('/pending-count', authenticate, interestController.getPendingCount);

export default router;