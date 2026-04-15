const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interest.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const Joi = require('joi');

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



module.exports = router;