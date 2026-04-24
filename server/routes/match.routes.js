import express from 'express';
import * as matchController from '../controllers/match.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get matches (mutual + guardian approved)
router.get(
    '/get-matches',
    authenticate,
    matchController.getMatches
);

export default router;