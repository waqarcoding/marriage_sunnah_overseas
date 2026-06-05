// services/fcm.service.js
//
// Sends Firebase Cloud Messaging push notifications.
// Uses the firebase-admin SDK — install with:
//   npm install firebase-admin
//
// Setup:
//   1. Go to Firebase Console → Project Settings → Service Accounts
//   2. Click "Generate new private key" → save as serviceAccountKey.json
//   3. Set env var:  GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
//      OR pass the JSON object directly (see initializeApp below)

import admin from 'firebase-admin';

// ── Initialize once ──────────────────────────────────────────────────────────
let _initialized = false;

function ensureInitialized() {
    if (_initialized) return;

    // Option A: credential file path via env (recommended for production)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
    // Option B: inline JSON (useful for env var on cloud hosts like DigitalOcean)
    else if (process.env.FCM_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
        console.error('[FCM] ❌ No Firebase credentials — set GOOGLE_APPLICATION_CREDENTIALS or FCM_SERVICE_ACCOUNT_JSON');
        return;
    }

    _initialized = true;
    console.log('[FCM] ✅ Firebase Admin initialized');
}

// ── Notification type → title/body/icon map ───────────────────────────────────
const NOTIF_CONFIG = {
    interest_received: { title: '💌 New Interest', body: (d) => `${d.sender_name || 'Someone'} sent you an interest` },
    interest_accepted: { title: '🎉 Interest Accepted', body: (d) => `${d.sender_name || 'Someone'} accepted your interest` },
    interest_declined: { title: 'Interest Declined', body: (d) => `${d.sender_name || 'Someone'} declined your interest` },
    interest_cancelled: { title: 'Interest Cancelled', body: (d) => 'An interest was cancelled' },
    new_message: { title: '📨 New Message', body: (d) => d.body || `Message from ${d.sender_name || 'Someone'}` },
    new_match: { title: '💞 New Match!', body: () => 'You have a new match — start chatting!' },
    guardian_new_interest: { title: '🕌 Guardian Interest', body: (d) => `New interest requires your approval` },
    guardian_approved: { title: '✅ Guardian Approved', body: () => 'A guardian has approved the interest' },
    guardian_rejected: { title: 'Guardian Rejected', body: () => 'A guardian rejected the interest' },
};

// ── Core send function ────────────────────────────────────────────────────────
/**
 * Send a push notification to a list of FCM tokens.
 *
 * @param {string[]} tokens  - FCM registration tokens
 * @param {string}   type    - notification type key (see NOTIF_CONFIG)
 * @param {object}   data    - payload data (sender_name, body, etc.)
 * @param {object}   [extra] - optional overrides for title/body
 */
export async function sendPushToTokens(tokens, type, data = {}, extra = {}) {
    ensureInitialized();
    if (!_initialized || !tokens?.length) return;

    const cfg = NOTIF_CONFIG[type] || { title: 'Marriage Sunnah', body: () => extra.body || '' };
    const title = extra.title || cfg.title;
    const body = extra.body || (typeof cfg.body === 'function' ? cfg.body(data) : cfg.body);

    // Payload: data-only message lets the app handle display (most flexible)
    // We also include notification for OS-level display when app is killed/background
    const message = {
        notification: { title, body },
        data: {
            type,
            ...Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, String(v ?? '')])
            ),
        },
        android: {
            priority: 'high',
            notification: {
                channelId: 'ms_high_importance',  // must match Flutter channel id
                sound: 'default',
                priority: 'high',
                defaultVibrateTimings: true,
                // icon: '@drawable/ic_notification', // add custom icon to android res
            },
        },
        apns: {
            headers: { 'apns-priority': '10' },
            payload: {
                aps: {
                    alert: { title, body },
                    badge: 1,
                    sound: 'default',
                    contentAvailable: true,   // wake app in background (iOS)
                },
            },
        },
    };

    try {
        // sendEachForMulticast is the modern API (batched, up to 500 tokens)
        const chunks = chunkArray(tokens, 500);
        for (const chunk of chunks) {
            // @ts-ignore
            const res = await admin.messaging().sendEachForMulticast({
                ...message,
                tokens: chunk,
            });

            console.log(`[FCM] ✅ Sent ${res.successCount}/${chunk.length}  type=${type}`);

            // Log failures (stale tokens should be removed from DB)
            res.responses.forEach((r, i) => {
                if (!r.success) {
                    console.warn(`[FCM] ❌ Token[${i}] failed: ${r.error?.code} — ${chunk[i].substring(0, 30)}…`);
                }
            });
        }
    } catch (err) {
        console.error('[FCM] ❌ sendPushToTokens error:', err);
    }
}

/**
 * Send push notification to a single user by userId.
 * Looks up their FCM tokens from DB.
 *
 * @param {number}  userId
 * @param {string}  type
 * @param {object}  data
 * @param {object}  [extra]
 */
export async function sendPushToUser(userId, type, data = {}, extra = {}) {
    try {
        // Import inline to avoid circular deps
        const { FcmToken } = (await import('../models/index.js')).default;
        const rows = await FcmToken.findAll({ where: { user_id: userId }, attributes: ['token'] });
        const tokens = rows.map(r => r.token);
        if (!tokens.length) return;
        await sendPushToTokens(tokens, type, data, extra);
    } catch (err) {
        console.error('[FCM] ❌ sendPushToUser error:', err);
    }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
}
