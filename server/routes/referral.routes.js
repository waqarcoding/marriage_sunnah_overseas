// routes/referral.routes.js

import express from 'express';
import {
    applyReferralReward,
    createReferral,
    awardCredits,
    getReferredUsers,
    getUserReferrer,
    checkReferralExists,
    getReferredUsersWithDetails,
    getUserReferrerWithDetails
} from '../controllers/referral.controller.js';

const router = express.Router();

/**
 * @route   POST /api/referrals
 * @desc    Create a new referral when User B signs up via User A's link
 * @access  Public
 */
router.post('/', createReferral);

/**
 * @route   POST /api/referrals/award-credits
 * @desc    Award credits to referred user and auto-calculate commission for referrer
 * @access  Private
 */
router.post('/award-credits', awardCredits);

/**
 * @route   GET /api/referrals/referrer/:referrer_id
 * @desc    Get all users referred by a specific referrer (basic)
 * @access  Private
 */
router.get('/referrer/:referrer_id', getReferredUsers);

/**
 * @route   GET /api/referrals/referrer/:referrer_id/details
 * @desc    Get all users referred by a specific referrer with avatars and full details
 * @access  Private
 */
router.get('/referrer/:referrer_id/details', getReferredUsersWithDetails);

/**
 * @route   GET /api/referrals/user/:user_id/referrer
 * @desc    Get who referred a specific user (basic)
 * @access  Private
 */
router.get('/user/:user_id/referrer', getUserReferrer);

/**
 * @route   GET /api/referrals/user/:user_id/referrer/details
 * @desc    Get who referred a specific user with avatar and full details
 * @access  Private
 */
router.get('/user/:user_id/referrer/details', getUserReferrerWithDetails);

/**
 * @route   POST /api/referrals/check
 * @desc    Check if a referral relationship exists between two users
 * @access  Private
 */
router.post('/check', checkReferralExists);

export default router;