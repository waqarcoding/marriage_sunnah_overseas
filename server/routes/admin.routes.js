import express from 'express';
import { authenticate, isAdmin, isSuperAdmin } from '../middlewares/auth.middleware.js';
import * as AdminController from '../controllers/admin.controller.js';
import * as MeetingController from '../controllers/meeting.controller.js'

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION (No auth required)
// ═══════════════════════════════════════════════════════════════════════════
router.post('/login', AdminController.login);

// ═══════════════════════════════════════════════════════════════════════════
// ALL ROUTES BELOW REQUIRE ADMIN AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════
router.use(authenticate, isAdmin);

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
router.get('/dashboard/stats', AdminController.getDashboardStats);
router.get('/dashboard/charts', AdminController.getDashboardCharts);
router.get('/dashboard/recent-activity', AdminController.getRecentActivity);

// ═══════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserDetailsByAdmin);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.post('/users/:id/ban', AdminController.banUser);
router.post('/users/:id/unban', AdminController.unbanUser);
router.post('/users/:id/verify', AdminController.verifyUser);
router.post('/users/:id/credits', AdminController.adjustCredits);
router.post('/users/:id/subscription', AdminController.adjustSubscription);
router.get('/users/:id/activity', AdminController.getUserActivity);

// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION QUEUE
// ═══════════════════════════════════════════════════════════════════════════
router.get('/verifications/pending', AdminController.getPendingVerifications);
router.post('/verifications/:userId/approve', AdminController.approveVerification);
router.post('/verifications/:userId/reject', AdminController.rejectVerification);

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/profiles', AdminController.getProfiles);
router.get('/profiles/:id', AdminController.getProfileDetails);
router.put('/profiles/:id', AdminController.updateProfile);
router.delete('/profiles/:id/photo/:index', AdminController.deleteProfilePhoto);
router.delete('/profiles/:id/video/:index', AdminController.deleteProfileVideo);

// ═══════════════════════════════════════════════════════════════════════════
// GUARDIAN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/guardians', AdminController.getGuardians);
router.get('/guardians/:id', AdminController.getGuardianDetails);
router.delete('/guardians/:id', AdminController.removeGuardian);

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/subscriptions', AdminController.getSubscriptions);
router.get('/subscriptions/:id', AdminController.getSubscriptionDetails);
router.post('/subscriptions/:id/cancel', AdminController.cancelSubscription);
router.post('/subscriptions/:id/extend', AdminController.extendSubscription);
router.post('/subscriptions/:id/refund', AdminController.refundSubscription);

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/transactions', AdminController.getTransactions);
router.get('/transactions/:id', AdminController.getTransactionDetails);
router.post('/transactions/:id/refund', AdminController.refundTransaction);

// ═══════════════════════════════════════════════════════════════════════════
// REFERRAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/referrals', AdminController.getReferrals);
router.get('/referrals/stats', AdminController.getReferralStats);
router.get('/referrals/:id', AdminController.getReferralDetails);

// ═══════════════════════════════════════════════════════════════════════════
// INTEREST & MATCH MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/interests', AdminController.getInterests);
router.delete('/interests/:id', AdminController.deleteInterest);
router.get('/matches', AdminController.getMatches);
router.delete('/matches/:id', AdminController.deleteMatch);

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/messages', AdminController.getMessages);
router.delete('/messages/:id', AdminController.deleteMessage);

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT REVEAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/contact-reveals', AdminController.getContactReveals);
router.get('/contact-reveals/stats', AdminController.getContactRevealStats);

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/notifications', AdminController.getNotifications);
router.post('/notifications/send', AdminController.sendNotification);
router.post('/notifications/broadcast', AdminController.broadcastNotification);

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS MANAGEMENT (READ: admin, WRITE: superadmin only)
// ═══════════════════════════════════════════════════════════════════════════
router.get('/settings', AdminController.getSettings);
router.put('/settings', isSuperAdmin, AdminController.updateSettings);

// ═══════════════════════════════════════════════════════════════════════════
// OPTIONS MANAGEMENT (READ: admin, WRITE: superadmin only)
// ═══════════════════════════════════════════════════════════════════════════
router.get('/options', AdminController.getOptions);
router.put('/options/global', isSuperAdmin, AdminController.updateGlobalOptions);
router.get('/options/countries', AdminController.getCountryOptions);
router.put('/options/countries/:country', isSuperAdmin, AdminController.updateCountryOptions);

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS & REPORTS
// ═══════════════════════════════════════════════════════════════════════════
router.get('/analytics/users', AdminController.getUserAnalytics);
router.get('/analytics/revenue', AdminController.getRevenueAnalytics);
router.get('/analytics/engagement', AdminController.getEngagementAnalytics);
router.get('/analytics/referrals', AdminController.getReferralAnalytics);

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT REPORTS
// ═══════════════════════════════════════════════════════════════════════════
router.get('/export/users', AdminController.exportUsers);
router.get('/export/transactions', AdminController.exportTransactions);
router.get('/export/referrals', AdminController.exportReferrals);

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN USER MANAGEMENT (SUPERADMIN ONLY)
// ═══════════════════════════════════════════════════════════════════════════
router.get('/admins', isSuperAdmin, AdminController.getAdmins);
router.post('/admins', isSuperAdmin, AdminController.createAdmin);
router.put('/admins/:id', isSuperAdmin, AdminController.updateAdmin);
router.delete('/admins/:id', isSuperAdmin, AdminController.deleteAdmin);
// Add these routes to your admin.routes.js

// ═══════════════════════════════════════════════════════════════════════════
router.get('/matches', AdminController.getMatches);
router.get('/interests/pending', AdminController.getPendingInterests);
// ═══════════════════════════════════════════════════════════════════════════
// User detail routes
router.put('/users/:userId/profile', authenticate, isAdmin, AdminController.updateUserProfile);
router.delete('/users/:userId/image', authenticate, isAdmin, AdminController.deleteUserImage);
router.delete('/users/:userId/video', authenticate, isAdmin, AdminController.deleteUserVideo);
router.delete('/users/:userId/guardian/:guardianId', authenticate, isAdmin, AdminController.removeGuardianByAdmin);
router.delete('/users/:userId/ward/:wardId', authenticate, isAdmin, AdminController.removeWard);


// ═══════════════════════════════════════════════════════════════════════════
// MEETINGS MANAGEMENT (READ/WRITE: admin)
// ═══════════════════════════════════════════════════════════════════════════
router.get('/meetings', AdminController.adminGetAllMeetings);
router.get('/meetings/stats', AdminController.adminGetMeetingStats);
router.get('/meetings/:meeting_id', MeetingController.getMeetingDetails);
router.patch('/meetings/:meeting_id/status', AdminController.adminUpdateMeetingStatus);
router.delete('/meetings/:meeting_id', AdminController.adminDeleteMeeting);

export default router;
