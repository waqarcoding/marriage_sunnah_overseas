const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const Joi = require('joi');

// ===============================
// Validation Schemas
// ===============================



// ===============================
// Routes
// ===============================


// Get matches (mutual + guardian approved)
router.get(
    '/get-matches',
    authenticate,
    matchController.getMatches
);


module.exports = router;