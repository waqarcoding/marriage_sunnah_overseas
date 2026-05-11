import express from 'express';
import * as subscriptionController from '../controllers/subscription.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.post('/webhook', subscriptionController.handleWebhook);
// ✅ NEW: Get available plans
router.get('/plans', subscriptionController.getPlans);

// ✅ NEW: Get available payment methods
router.get('/payment-methods', subscriptionController.getPaymentMethods);

// ✅ NEW: Universal payment session creation
router.post('/create-session', subscriptionController.createPaymentSession);

// Legacy Stripe endpoint (for backwards compatibility)
router.post('/create-checkout-session', subscriptionController.createPaymentSession);

// User subscription data
router.get('/my', authenticate, subscriptionController.getMySubscriptions);

// Get subscription status
router.get('/status/:userId', subscriptionController.getSubscriptionStatus);

// Restore purchases
router.post('/restore-purchases', subscriptionController.restorePurchases);

// Verify session (for success page)
router.get('/verify-session', subscriptionController.verifySession);

// ══════════════════════════════════════════════════════════════════════════════
// WEBHOOKS & CALLBACKS
// ══════════════════════════════════════════════════════════════════════════════



// ✅ NEW: EasyPaisa callback
router.post('/easypaisa/callback', subscriptionController.handleEasyPaisaCallback);

// ✅ NEW: JazzCash callback
router.post('/jazzcash/callback', subscriptionController.handleJazzCashCallback);

export default router;