// @ts-nocheck
// config/socket.js

import { Server } from 'socket.io';
import db from '../models/index.js';
import {
    sendInterestReceivedEmail,
    sendInterestAcceptedEmail,
    sendGuardianApprovedEmail,
    sendGuardianRejectedEmail,
    sendMatchCreatedEmail,
} from '../mail/service.js';

// ✅ CRITICAL: Declare these at module scope
let io = null;
let isInitialized = false;  // ← THIS WAS MISSING!
const onlineUsers = new Set();

// ─────────────────────────────────────────────────────────
// INIT - ✅ FIXED FOR DIGITALOCEAN
// ─────────────────────────────────────────────────────────
export const initSocket = (server) => {
    // ✅ Guard: Return if already initialized
    if (isInitialized && io) {
        console.log('⚠️ Socket.IO already initialized, returning existing instance');
        return io;
    }

    const allowedOrigins = [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://marriagesunnaoverseas.com',
        'https://www.marriagesunnaoverseas.com',
        'https://marriage-sunna-overseas-wceze.ondigitalocean.app'
    ].filter(Boolean);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔌 Initializing Socket.IO (FIRST TIME)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 Server instance:', !!server);
    console.log('📡 Allowed CORS origins:', allowedOrigins);
    console.log('📡 Socket.IO path: /socket.io/');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        io = new Server(server, {
            cors: {
                origin: allowedOrigins,
                methods: ["GET", "POST"],
                credentials: true
            },
            path: '/',
            transports: ['polling', 'websocket'],
            allowUpgrades: true,
            pingTimeout: 60000,
            pingInterval: 25000,
            connectTimeout: 45000,
            maxHttpBufferSize: 1e6,
            allowEIO3: true,
            serveClient: false,
        });

        console.log('✅ Socket.IO Server instance created');
        console.log('✅ Socket.IO listening on path:', io.path());

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

            socket.on('error', (error) => {
                console.error('🔌 Socket error:', error);
            });
        });

        isInitialized = true;
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Socket.IO initialization COMPLETE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return io;

    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Socket.IO initialization FAILED');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        throw error;
    }
};

export const getIO = () => {
    if (!io) {
        throw new Error('❌ Socket.IO not initialized! Call initSocket first.');
    }
    return io;
};

export const isUserOnline = (userId) => onlineUsers.has(String(userId));

// ─────────────────────────────────────────────────────────
// 🔔 NOTIFICATION HELPER (DB + SOCKET)
// ─────────────────────────────────────────────────────────
export const createNotification = async ({
    userId,
    type,
    title,
    message,
    data = {},
    sender_image = null,
}) => {
    try {
        const notification = await db.Notification.create({
            user_id: userId,
            type,
            title,
            message,
            data: { ...data, sender_image },
        });

        io.to(`user_${userId}`).emit('notification', {
            ...notification.toJSON(),
            sender_image,
        });

        console.log(`🔔 Notification sent to user ${userId}:`, type);
        return notification;
    } catch (err) {
        console.error('❌ Notification error:', err);
    }
};

// ─────────────────────────────────────────────────────────
// 💌 INTEREST EVENTS
// ─────────────────────────────────────────────────────────
export const notifyInterestReceived = async (toUserId, data) => {
    await createNotification({
        userId: toUserId,
        type: 'interest_received',
        title: 'New Interest 💌',
        message: `${data.sender_name} sent you an interest`,
        data,
        sender_image: data.sender_avatar_url || null,
    });

    try {
        if (data.toUser && data.senderUser && data.toUserEmail) {
            await sendInterestReceivedEmail(
                data.toUser,
                data.senderUser,
                data.senderProfile
            );
        }
    } catch (error) {
        console.error('❌ Error sending interest received email:', error);
    }
};

export const notifyInterestAccepted = async (toUserId, data) => {
    await createNotification({
        userId: toUserId,
        type: 'interest_accepted',
        title: 'Interest Accepted ✅',
        message: `${data.accepted_by_name} accepted your interest`,
        data,
        sender_image: data.accepted_by_avatar_url || null,
    });

    try {
        if (data.senderUser && data.acceptedByUser && data.fromUserEmail) {
            await sendInterestAcceptedEmail(
                data.senderUser,
                data.acceptedByUser,
                data.acceptedByProfile
            );
        }
    } catch (error) {
        console.error('❌ Error sending interest accepted email:', error);
    }
};

export const notifyInterestDeclined = async (toUserId, data) => {
    await createNotification({
        userId: toUserId,
        type: 'interest_declined',
        title: 'Interest Declined ❌',
        message: 'Your interest was declined',
        data,
        sender_image: data.declined_by_avatar_url || null,
    });
};

export const notifyInterestCancelled = async (toUserId, data) => {
    await createNotification({
        userId: toUserId,
        type: 'interest_cancelled',
        title: 'Interest Cancelled 🚫',
        message: 'An interest was cancelled',
        data,
        sender_image: data.cancelled_by_avatar_url || null,
    });
};

// ─────────────────────────────────────────────────────────
// 💞 MATCH
// ─────────────────────────────────────────────────────────
export const notifyNewMatch = async (user1, user2, data) => {
    await createNotification({
        userId: user1,
        type: 'new_match',
        title: 'New Match 💞',
        message: `You matched with ${data.user2_name}`,
        data,
        sender_image: data.user2_avatar_url || null,
    });

    await createNotification({
        userId: user2,
        type: 'new_match',
        title: 'New Match 💞',
        message: `You matched with ${data.user1_name}`,
        data,
        sender_image: data.user1_avatar_url || null,
    });

    if (data.user1Model && data.user2Model && data.user1Profile && data.user2Profile) {
        try {
            await sendMatchCreatedEmail(
                data.user1Model,
                data.user2Model,
                data.user1Profile,
                data.user2Profile
            );
        } catch (error) {
            console.error('❌ Error sending match created email:', error);
        }
    }
};

// ─────────────────────────────────────────────────────────
// 🕌 GUARDIAN EVENTS
// ─────────────────────────────────────────────────────────
export const notifyGuardianAssigned = async (userId, data) => {
    await createNotification({
        userId,
        type: 'guardian_assigned',
        title: 'Guardian Assigned 🤝',
        message: `${data.ward_name} assigned you`,
        data,
        sender_image: data.ward_avatar_url || null,
    });

    if (data.guardianEmail) {
        const { sendMail } = await import('../services/emailService.js');
        await sendMail({
            to: data.guardianEmail,
            subject: 'Guardian Assigned - Marriage Sunna',
            html: `
                <h1>You've Been Assigned as Guardian 🤝</h1>
                <p>Assalamu Alaikum,</p>
                <p><strong>${data.ward_name}</strong> has assigned you as their guardian.</p>
                <a href="${process.env.CLIENT_URL}/guardian">View Dashboard</a>
            `
        });
    }
};

export const notifyGuardianRemoved = async (userId, data) => {
    await createNotification({
        userId,
        type: 'guardian_removed',
        title: 'Guardian Removed 🗑️',
        message: `${data.ward_name} removed you`,
        data,
        sender_image: data.ward_avatar_url || null,
    });
};

export const notifyWardAdded = async (userId, data) => {
    await createNotification({
        userId,
        type: 'ward_added',
        title: 'Added as Ward 👤',
        message: `${data.guardian_name} added you`,
        data,
        sender_image: data.guardian_avatar_url || null,
    });
};

export const notifyWardRemoved = async (userId, data) => {
    await createNotification({
        userId,
        type: 'ward_removed',
        title: 'Removed from Ward ❌',
        message: `${data.guardian_name} removed you`,
        data,
        sender_image: data.guardian_avatar_url || null,
    });
};

export const notifyGuardianApproved = async (userId, data) => {
    await createNotification({
        userId,
        type: 'guardian_approved',
        title: 'Guardian Approved 🕌',
        message: `${data.ward_name ? data.ward_name + "'s guardian" : 'Guardian'} approved the interest`,
        data,
        sender_image: data.guardian_avatar_url || null,
    });

    if (data.wardUser && data.guardian_name && data.other_person_name) {
        await sendGuardianApprovedEmail(
            data.wardUser,
            data.guardian_name,
            data.other_person_name
        ).catch(console.error);
    }
};

export const notifyGuardianRejected = async (userId, data) => {
    await createNotification({
        userId,
        type: 'guardian_rejected',
        title: 'Guardian Rejected ❌',
        message: 'Guardian rejected the interest',
        data,
        sender_image: data.guardian_avatar_url || null,
    });

    try {
        if (data.wardUser && data.guardian_name && data.other_person_name) {
            await sendGuardianRejectedEmail(
                data.wardUser,
                data.guardian_name,
                data.other_person_name
            );
        }
    } catch (error) {
        console.error("❌ Error sending guardian rejected email:", error);
    }
};

// ─────────────────────────────────────────────────────────
// 💬 CHAT
// ─────────────────────────────────────────────────────────
export const notifyNewMessage = async (toUserId, message) => {
    await createNotification({
        userId: toUserId,
        type: 'new_message',
        title: `Message from ${message.sender_name}`,
        message: message.body,
        data: message,
        sender_image: message.sender_avatar_url || null,
    });

    if (!isUserOnline(toUserId) && message.toUserEmail) {
        const { sendMail } = await import('../services/emailService.js');
        await sendMail({
            to: message.toUserEmail,
            subject: `New Message from ${message.sender_name}`,
            html: `
                <h1>New Message 💬</h1>
                <p>"${message.body}"</p>
                <a href="${process.env.CLIENT_URL}/messages">Reply Now</a>
            `
        });
    }
};

// ─────────────────────────────────────────────────────────
// 🔢 COUNTERS (NO DB)
// ─────────────────────────────────────────────────────────
export const notifyInterestCount = (userId, count) => {
    io.to(`user_${userId}`).emit('interest_count', {
        type: 'interest_count',
        count: Number(count),
    });
};

export const notifyGuardianPendingCount = (userId, count) => {
    io.to(`user_${userId}`).emit('guardian_pending_count', {
        type: 'guardian_pending_count',
        count: Number(count),
    });
};

export const notifyChatCountUpdate = (userId, count) => {
    io.to(`user_${userId}`).emit('chat_count_update', {
        type: 'chat_count_update',
        count: Number(count),
    });
};

export const notifyCreditUpdate = (userId, credits) => {
    io.to(`user_${userId}`).emit('credit_update', {
        type: 'credit_update',
        credits: Number(credits),
    });
};