// controllers/fcm.controller.js
//
// REST endpoints for Flutter app to register/remove its FCM token.
// Routes to add to your Express router:
//
//   router.post('/profile/fcm-token',   authenticate, fcmController.saveToken);
//   router.delete('/profile/fcm-token', authenticate, fcmController.removeToken);

import db from '../models/index.js';
const { FcmToken } = db;

// ── POST /profile/fcm-token ───────────────────────────────────────────────────
// Called by Flutter whenever:
//   • User logs in / OTP verified
//   • Token refreshes (onTokenRefresh)
export const saveToken = async (req, res, next) => {
    try {
        const userId   = req.user.id;
        const { token, platform = 'android' } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, error: 'Token required' });
        }

        // Upsert — if token already exists for this user, update platform
        await FcmToken.upsert(
            { user_id: userId, token, platform },
            { conflictFields: ['user_id', 'token'] }
        );

        console.log(`[FCM] ✅ Token saved for user ${userId} (${platform})`);
        return res.json({ success: true });
    } catch (err) {
        console.error('[FCM] ❌ saveToken error:', err);
        next(err);
    }
};

// ── DELETE /profile/fcm-token ─────────────────────────────────────────────────
// Called by Flutter on logout — stops notifications reaching logged-out device
export const removeToken = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const token  = req.body?.token || req.query?.token;

        if (token) {
            // Remove specific token
            await FcmToken.destroy({ where: { user_id: userId, token } });
            console.log(`[FCM] 🗑 Specific token removed for user ${userId}`);
        } else {
            // Remove ALL tokens for this user (full logout)
            await FcmToken.destroy({ where: { user_id: userId } });
            console.log(`[FCM] 🗑 All tokens removed for user ${userId}`);
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('[FCM] ❌ removeToken error:', err);
        next(err);
    }
};
