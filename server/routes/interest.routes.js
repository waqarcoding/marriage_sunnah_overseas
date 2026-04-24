import express from 'express';
import Joi from 'joi';
import interestController from '../controllers/interest.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';

const router = express.Router();

// ===============================
// Validation Schemas
// ===============================

const interestIdSchema = Joi.object({
    interestId: Joi.number().required(),
});

// ===============================
// Routes
// ===============================

// Send interest
router.post(
    '/send-interest',
    authenticate,
    validateBody(Joi.object({
        interestId: Joi.number().required(),
        isSuperLike: Joi.boolean().default(false),
    })),
    interestController.sendInterest
);

router.post(
    '/dislike',
    authenticate,
    validateBody(Joi.object({
        interestId: Joi.number().required(),
    })),
    interestController.sendDislike
);

// Cancel interest
router.post(
    '/cancel-interest',
    authenticate,
    validateBody(interestIdSchema),
    interestController.cancelInterest
);

// Get user interests
router.get(
    '/get-interests',
    authenticate,
    interestController.getInterests
);

// Accept interest
router.post(
    '/accept-interest',
    authenticate,
    validateBody(interestIdSchema),
    interestController.acceptInterest
);

// Decline interest
router.post(
    '/decline-interest',
    authenticate,
    validateBody(interestIdSchema),
    interestController.declineInterest
);

export default router;