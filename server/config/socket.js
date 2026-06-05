// @ts-nocheck
// config/socket.js
//
// Updated version — FCM push added alongside every socket notification.
// Every notifyXxx() call now:
//   1. Saves to DB + emits socket  (original — unchanged)
//   2. Sends FCM push              (new — works background/killed state)
//
// Prerequisites:
//   npm install firebase-admin
//   Set env: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
//         OR: FCM_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
//
// FCM token routes to add:
//   router.post('/fcm-token',   authenticate, fcmController.saveToken);
//   router.delete('/fcm-token', authenticate, fcmController.removeToken);

import { Server } from 'socket.io';
import admin from 'firebase-admin';
import db from '../models/index.js';
import {
    sendInterestReceivedEmail,
    sendInterestAcceptedEmail,
    sendGuardianApprovedEmail,
    sendGuardianRejectedEmail,
    sendMatchCreatedEmail,
} from '../mail/service.js';

// ─────────────────────────────────────────────────────────
// 🔥 FCM INIT
// ─────────────────────────────────────────────────────────
let _fcmReady = false;

function initFCM() {
    if (_fcmReady || admin.apps.length > 0) { _fcmReady = true; return; }
    try {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            admin.initializeApp({ credential: admin.credential.applicationDefault() });
            _fcmReady = true;
            console.log('✅ Firebase Admin initialized (applicationDefault)');
        } else if (process.env.FCM_SERVICE_ACCOUNT_JSON) {
            admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON)) });
            _fcmReady = true;
            console.log('✅ Firebase Admin initialized (inline JSON)');
        } else {
            console.warn('⚠️  FCM skipped — set GOOGLE_APPLICATION_CREDENTIALS or FCM_SERVICE_ACCOUNT_JSON');
        }
    } catch (err) {
        console.error('❌ Firebase Admin init failed:', err.message);
    }
}

// ─────────────────────────────────────────────────────────
// 🔥 FCM PUSH SENDER
// Play Console & App Store compliant:
//   • Only alert/badge/sound — no tracking
//   • notification object present for OS display (background/killed)
//   • data object present for in-app routing (foreground)
//   • Silent failure — never throws or breaks request
// ─────────────────────────────────────────────────────────
async function pushToUser(userId, type, title, body, extraData = {}) {
    if (!_fcmReady) return;
    try {
        const rows = await db.FcmToken.findAll({ where: { user_id: userId }, attributes: ['token'] });
        const tokens = rows.map(r => r.token).filter(Boolean);
        if (!tokens.length) return;

        const message = {
            notification: { title, body },
            data: {
                type,
                ...Object.fromEntries(Object.entries(extraData).map(([k, v]) => [k, String(v ?? '')])),
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'ms_high_importance',
                    sound: 'default',
                    priority: 'high',
                    defaultVibrateTimings: true,
                },
            },
            apns: {
                headers: { 'apns-priority': '10' },
                payload: { aps: { alert: { title, body }, badge: 1, sound: 'default', contentAvailable: true } },
            },
        };

        for (let i = 0; i < tokens.length; i += 500) {
            const chunk = tokens.slice(i, i + 500);
            const res = await admin.messaging().sendEachForMulticast({ ...message, tokens: chunk });
            console.log(`[FCM] ✅ ${type} → user ${userId}: ${res.successCount}/${chunk.length} delivered`);
            res.responses.forEach((r, idx) => { if (!r.success) console.warn(`[FCM] ❌ Token[${idx}]: ${r.error?.code}`); });
        }
    } catch (err) {
        console.error(`[FCM] ❌ pushToUser(${userId}, ${type}):`, err.message);
    }
}

// FCM title map
const T = {
    interest_received: '💌 New Interest',
    interest_accepted: '🎉 Interest Accepted',
    interest_declined: 'Interest Declined',
    interest_cancelled: 'Interest Cancelled',
    new_match: '💞 New Match!',
    new_message: '📨 New Message',
    guardian_new_interest: '🕌 Guardian Approval Needed',
    guardian_approved: '✅ Guardian Approved',
    guardian_rejected: 'Guardian Rejected',
    guardian_assigned: '🤝 Guardian Assigned',
    guardian_removed: 'Guardian Removed',
    ward_added: '👤 Added as Ward',
    ward_removed: 'Ward Removed',
};

// ─────────────────────────────────────────────────────────
// SOCKET SETUP — unchanged from original
// ─────────────────────────────────────────────────────────
let io = null;
let isInitialized = false;
const onlineUsers = new Set();

export const initSocket = (server) => {
    if (isInitialized && io) {
        console.log('⚠️ Socket.IO already initialized, returning existing instance');
        return io;
    }

    initFCM(); // boot FCM alongside socket

    const allowedOrigins = [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:5000',
        'https://marriagesunnaoverseas.com',
        'https://www.marriagesunnaoverseas.com',
        'https://marriage-sunnah-overseas-pdniv.ondigitalocean.app',
    ].filter(Boolean);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔌 Initializing Socket.IO (FIRST TIME)');
    console.log('📡 Allowed CORS origins:', allowedOrigins);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        io = new Server(server, {
            cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
            path: '/socket.io/',
            transports: ['polling', 'websocket'],
            allowUpgrades: true,
            pingTimeout: 60000,
            pingInterval: 25000,
            connectTimeout: 45000,
            maxHttpBufferSize: 1e6,
            allowEIO3: true,
            serveClient: false,
        });

        console.log('✅ Socket.IO Server instance created, path:', io.path());

        io.on('connection', (socket) => {
            console.log('✅ NEW Socket connection:', socket.id);

            socket.on('join', (userId) => {
                const userRoom = `user_${userId}`;
                socket.join(userRoom);
                onlineUsers.add(String(userId));
                io.emit('user_online', userId);
                console.log(`👤 User ${userId} joined room: ${userRoom}`);
            });

            socket.on('typing', ({ to, from }) => {
                io.to(`user_${to}`).emit('typing', { from });
            });

            socket.on('stop_typing', ({ to, from }) => {
                io.to(`user_${to}`).emit('stop_typing', { from });
            });

            socket.on('disconnect', (reason) => {
                console.log('❌ Socket disconnected:', socket.id, 'Reason:', reason);
                for (const userId of onlineUsers) {
                    const rooms = Array.from(socket.rooms);
                    if (rooms.includes(`user_${userId}`)) {
                        onlineUsers.delete(userId);
                        io.emit('user_offline', userId);
                        console.log(`⚫ User ${userId} went offline`);
                        break;
                    }
                }
            });

            socket.on('error', (error) => { console.error('🔌 Socket error:', error); });
        });

        isInitialized = true;
        console.log('✅ Socket.IO initialization COMPLETE\n');
        return io;

    } catch (error) {
        console.error('❌ Socket.IO initialization FAILED:', error.message);
        throw error;
    }
};

export const getIO = () => {
    if (!io) throw new Error('❌ Socket.IO not initialized! Call initSocket first.');
    return io;
};

export const isUserOnline = (userId) => onlineUsers.has(String(userId));

// ─────────────────────────────────────────────────────────
// 🔔 NOTIFICATION HELPER (DB + SOCKET) — unchanged
// ─────────────────────────────────────────────────────────
export const createNotification = async ({ userId, type, title, message, data = {}, sender_image = null }) => {
    try {
        const notification = await db.Notification.create({
            user_id: userId, type, title, message,
            data: { ...data, sender_image },
        });
        io.to(`user_${userId}`).emit('notification', { ...notification.toJSON(), sender_image });
        console.log(`🔔 Notification sent to user ${userId}:`, type);
        return notification;
    } catch (err) {
        console.error('❌ Notification error:', err);
    }
};

// ─────────────────────────────────────────────────────────
// 💌 INTEREST EVENTS  (+FCM)
// ─────────────────────────────────────────────────────────
export const notifyInterestReceived = async (toUserId, data) => {
    const body = `${data.sender_name} sent you an interest`;
    await createNotification({ userId: toUserId, type: 'interest_received', title: T.interest_received, message: body, data, sender_image: data.sender_avatar_url || null });
    await pushToUser(toUserId, 'interest_received', T.interest_received, body, { sender_name: data.sender_name || '', sender_id: String(data.sender_id || ''), interest_id: String(data.interest_id || '') });
    try {
        if (data.toUser && data.senderUser && data.toUserEmail) await sendInterestReceivedEmail(data.toUser, data.senderUser, data.senderProfile);
    } catch (error) { console.error('❌ Error sending interest received email:', error); }
};

export const notifyInterestAccepted = async (toUserId, data) => {
    const body = `${data.accepted_by_name} accepted your interest`;
    await createNotification({ userId: toUserId, type: 'interest_accepted', title: T.interest_accepted, message: body, data, sender_image: data.accepted_by_avatar_url || null });
    await pushToUser(toUserId, 'interest_accepted', T.interest_accepted, body, { accepted_by_name: data.accepted_by_name || '', interest_id: String(data.interest_id || '') });
    try {
        if (data.senderUser && data.acceptedByUser && data.fromUserEmail) await sendInterestAcceptedEmail(data.senderUser, data.acceptedByUser, data.acceptedByProfile);
    } catch (error) { console.error('❌ Error sending interest accepted email:', error); }
};

export const notifyInterestDeclined = async (toUserId, data) => {
    const body = 'Your interest was declined';
    await createNotification({ userId: toUserId, type: 'interest_declined', title: T.interest_declined, message: body, data, sender_image: data.declined_by_avatar_url || null });
    await pushToUser(toUserId, 'interest_declined', T.interest_declined, body, { interest_id: String(data.interest_id || '') });
};

export const notifyInterestCancelled = async (toUserId, data) => {
    const body = 'An interest was cancelled';
    await createNotification({ userId: toUserId, type: 'interest_cancelled', title: T.interest_cancelled, message: body, data, sender_image: data.cancelled_by_avatar_url || null });
    await pushToUser(toUserId, 'interest_cancelled', T.interest_cancelled, body, { interest_id: String(data.interest_id || '') });
};

// ─────────────────────────────────────────────────────────
// 💞 MATCH  (+FCM)
// ─────────────────────────────────────────────────────────
export const notifyNewMatch = async (user1, user2, data) => {
    await createNotification({ userId: user1, type: 'new_match', title: T.new_match, message: `You matched with ${data.user2_name}`, data, sender_image: data.user2_avatar_url || null });
    await pushToUser(user1, 'new_match', T.new_match, `You matched with ${data.user2_name}`, { matched_user_name: data.user2_name || '', matched_user_id: String(data.user2_id || '') });

    await createNotification({ userId: user2, type: 'new_match', title: T.new_match, message: `You matched with ${data.user1_name}`, data, sender_image: data.user1_avatar_url || null });
    await pushToUser(user2, 'new_match', T.new_match, `You matched with ${data.user1_name}`, { matched_user_name: data.user1_name || '', matched_user_id: String(data.user1_id || '') });

    if (data.user1Model && data.user2Model && data.user1Profile && data.user2Profile) {
        try { await sendMatchCreatedEmail(data.user1Model, data.user2Model, data.user1Profile, data.user2Profile); }
        catch (error) { console.error('❌ Error sending match created email:', error); }
    }
};

// ─────────────────────────────────────────────────────────
// 🕌 GUARDIAN EVENTS  (+FCM)
// ─────────────────────────────────────────────────────────
export const notifyGuardianAssigned = async (userId, data) => {
    const body = `${data.ward_name} assigned you as their guardian`;
    await createNotification({ userId, type: 'guardian_assigned', title: T.guardian_assigned, message: body, data, sender_image: data.ward_avatar_url || null });
    await pushToUser(userId, 'guardian_assigned', T.guardian_assigned, body, { ward_name: data.ward_name || '' });
    if (data.guardianEmail) {
        const { sendMail } = await import('../services/emailService.js');
        await sendMail({ to: data.guardianEmail, subject: 'Guardian Assigned - Marriage Sunna', html: `<h1>You've Been Assigned as Guardian 🤝</h1><p>Assalamu Alaikum,</p><p><strong>${data.ward_name}</strong> has assigned you as their guardian.</p><a href="${process.env.CLIENT_URL}/guardian">View Dashboard</a>` });
    }
};

export const notifyGuardianRemoved = async (userId, data) => {
    const body = `${data.ward_name} removed you as guardian`;
    await createNotification({ userId, type: 'guardian_removed', title: T.guardian_removed, message: body, data, sender_image: data.ward_avatar_url || null });
    await pushToUser(userId, 'guardian_removed', T.guardian_removed, body, { ward_name: data.ward_name || '' });
};

export const notifyWardAdded = async (userId, data) => {
    const body = `${data.guardian_name} added you as their ward`;
    await createNotification({ userId, type: 'ward_added', title: T.ward_added, message: body, data, sender_image: data.guardian_avatar_url || null });
    await pushToUser(userId, 'ward_added', T.ward_added, body, { guardian_name: data.guardian_name || '' });
};

export const notifyWardRemoved = async (userId, data) => {
    const body = `${data.guardian_name} removed you as their ward`;
    await createNotification({ userId, type: 'ward_removed', title: T.ward_removed, message: body, data, sender_image: data.guardian_avatar_url || null });
    await pushToUser(userId, 'ward_removed', T.ward_removed, body, { guardian_name: data.guardian_name || '' });
};

export const notifyGuardianApproved = async (userId, data) => {
    const label = data.ward_name ? `${data.ward_name}'s guardian` : 'Guardian';
    const body = `${label} approved the interest`;
    await createNotification({ userId, type: 'guardian_approved', title: T.guardian_approved, message: body, data, sender_image: data.guardian_avatar_url || null });
    await pushToUser(userId, 'guardian_approved', T.guardian_approved, body, { ward_name: data.ward_name || '', guardian_name: data.guardian_name || '', interest_id: String(data.interest_id || '') });
    if (data.wardUser && data.guardian_name && data.other_person_name) {
        await sendGuardianApprovedEmail(data.wardUser, data.guardian_name, data.other_person_name).catch(console.error);
    }
};

export const notifyGuardianRejected = async (userId, data) => {
    const body = 'A guardian rejected the interest';
    await createNotification({ userId, type: 'guardian_rejected', title: T.guardian_rejected, message: body, data, sender_image: data.guardian_avatar_url || null });
    await pushToUser(userId, 'guardian_rejected', T.guardian_rejected, body, { guardian_name: data.guardian_name || '', interest_id: String(data.interest_id || '') });
    try {
        if (data.wardUser && data.guardian_name && data.other_person_name) await sendGuardianRejectedEmail(data.wardUser, data.guardian_name, data.other_person_name);
    } catch (error) { console.error('❌ Error sending guardian rejected email:', error); }
};

// ─────────────────────────────────────────────────────────
// 💬 CHAT  (+FCM)
// ─────────────────────────────────────────────────────────
export const notifyNewMessage = async (toUserId, message) => {
    const title = `📨 ${message.sender_name}`;
    const body = message.body || 'You have a new message';

    // 1. DB + socket
    await createNotification({ userId: toUserId, type: 'new_message', title, message: body, data: message, sender_image: message.sender_avatar_url || null });

    // 2. FCM push — always send regardless of online state; flutter_local_notifications
    //    handles dedup when app is in foreground
    await pushToUser(toUserId, 'new_message', title, body, {
        sender_name: message.sender_name || '',
        sender_id: String(message.sender_id || ''),
        conversation_id: String(message.conversation_id || ''),
    });

    // 3. Email fallback (original)
    if (!isUserOnline(toUserId) && message.toUserEmail) {
        const { sendMail } = await import('../services/emailService.js');
        await sendMail({ to: message.toUserEmail, subject: `New Message from ${message.sender_name}`, html: `<h1>New Message 💬</h1><p>"${message.body}"</p><a href="${process.env.CLIENT_URL}/messages">Reply Now</a>` });
    }
};

// ─────────────────────────────────────────────────────────
// 🔢 COUNTERS (NO DB) — unchanged
// ─────────────────────────────────────────────────────────
export const notifyInterestCount = (userId, count) => {
    io.to(`user_${userId}`).emit('interest_count', { type: 'interest_count', count: Number(count) });
};

export const notifyGuardianPendingCount = (userId, count) => {
    io.to(`user_${userId}`).emit('guardian_pending_count', { type: 'guardian_pending_count', count: Number(count) });
};

export const notifyChatCountUpdate = (userId, count) => {
    io.to(`user_${userId}`).emit('chat_count_update', { type: 'chat_count_update', count: Number(count) });
};

export const notifyCreditUpdate = (userId, credits) => {
    io.to(`user_${userId}`).emit('credit_update', { type: 'credit_update', credits: Number(credits) });
};
