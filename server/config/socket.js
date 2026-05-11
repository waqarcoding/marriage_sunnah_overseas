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

let io;
const onlineUsers = new Set();
// ─────────────────────────────────────────────────────────
// INIT - ✅ FIXED FOR DIGITALOCEAN
// ─────────────────────────────────────────────────────────
export const initSocket = (server) => {
    const allowedOrigins = [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://marriagesunnaoverseas.com',
        'https://www.marriagesunnaoverseas.com'
    ].filter(Boolean);

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        },
        // ✅ CRITICAL: DigitalOcean-specific configuration
        path: '/api/socket.io/',
        transports: ['polling'],  // ✅ Polling first for reliability
        allowUpgrades: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        connectTimeout: 45000,
        maxHttpBufferSize: 1e6,
        // ✅ Important for DigitalOcean's load balancer
        allowEIO3: true,
        serveClient: false,
    });

    io.on('connection', (socket) => {
        console.log('✅ User connected:', socket.id);

        socket.on('join', (userId) => {
            socket.join(`user_${userId}`);
            onlineUsers.add(String(userId));
            io.emit('user_online', userId);
            console.log(`👤 User ${userId} joined room`);
        });

        socket.on('typing', ({ to, from }) => {
            io.to(`user_${to}`).emit('typing', { from });
        });

        socket.on('stop_typing', ({ to, from }) => {
            io.to(`user_${to}`).emit('stop_typing', { from });
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ User disconnected:', socket.id, 'Reason:', reason);

            for (const userId of onlineUsers) {
                const rooms = io.sockets.adapter.sids.get(socket.id);
                if (rooms && rooms.has(`user_${userId}`)) {
                    onlineUsers.delete(userId);
                    io.emit('user_offline', userId);
                    break;
                }
            }
        });

        socket.on('error', (error) => {
            console.error('🔌 Socket error:', error);
        });
    });

    console.log('✅ Socket.IO configured with CORS origins:', allowedOrigins);
    return io;
};


export const getIO = () => {
    if (!io) throw new Error('Socket not initialized');
    return io;
};



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

        return notification;
    } catch (err) {
        console.error('Notification error:', err);
    }
};


export const isUserOnline = (userId) =>
    onlineUsers.has(String(userId));

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

    // ✅ Send email using new template with full user and profile data
    try {
        if (data.toUser && data.senderUser && data.toUserEmail) {
            await sendInterestReceivedEmail(
                data.toUser,           // Recipient User model
                data.senderUser,       // Sender User model
                data.senderProfile     // Sender Profile model
            );
        }
    } catch (error) {
        console.error('Error sending interest received email:', error);
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

    // ✅ Send interest accepted email (waiting for guardian approval)
    try {
        if (data.senderUser && data.acceptedByUser && data.fromUserEmail) {
            await sendInterestAcceptedEmail(
                data.senderUser,        // Original sender User model
                data.acceptedByUser,    // Person who accepted User model
                data.acceptedByProfile  // Person who accepted Profile model
            );
        }
    } catch (error) {
        console.error('Error sending interest accepted email:', error);
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
    // No email for declined interests
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
    // No email for cancelled interests
};

// ─────────────────────────────────────────────────────────
// 💞 MATCH - Both families approved! Chat unlocked!
// ─────────────────────────────────────────────────────────
export const notifyNewMatch = async (user1, user2, data) => {
    // Notify user 1
    await createNotification({
        userId: user1,
        type: 'new_match',
        title: 'New Match 💞',
        message: `You matched with ${data.user2_name}`,
        data,
        sender_image: data.user2_avatar_url || null,
    });

    // Notify user 2
    await createNotification({
        userId: user2,
        type: 'new_match',
        title: 'New Match 💞',
        message: `You matched with ${data.user1_name}`,
        data,
        sender_image: data.user1_avatar_url || null,
    });

    // ✅ Send match created email to both users with full profiles
    if (data.user1Model && data.user2Model && data.user1Profile && data.user2Profile) {
        try {
            await sendMatchCreatedEmail(
                data.user1Model,    // User 1 User model
                data.user2Model,    // User 2 User model
                data.user1Profile,  // User 1 Profile model
                data.user2Profile   // User 2 Profile model
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

    // Send basic email notification
    if (data.guardianEmail) {
        const { sendMail } = await import('../services/emailService.js');
        await sendMail({
            to: data.guardianEmail,
            subject: 'Guardian Assigned - Marriage Sunna',
            html: `
                <h1>You've Been Assigned as Guardian 🤝</h1>
                <p>Assalamu Alaikum,</p>
                <p><strong>${data.ward_name}</strong> has assigned you as their guardian on Marriage Sunna.</p>
                
                <div class="info-box">
                    <p>As a guardian, you can:</p>
                    <p>• Review interests sent to ${data.ward_name}</p>
                    <p>• Approve or decline matches</p>
                    <p>• Help guide their marriage journey</p>
                </div>

                <a href="${process.env.CLIENT_URL}/guardian" class="button">View Guardian Dashboard</a>

                <p>JazakAllah Khair for your support!</p>
                <p><strong>The Marriage Sunna Team</strong></p>
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
    // No email needed for removal
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
    // No email needed
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
    // No email needed
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

    // ✅ Send guardian approved email
    if (data.wardUser && data.guardian_name && data.other_person_name) {
        await sendGuardianApprovedEmail(
            data.wardUser,           // Ward User model
            data.guardian_name,      // Guardian name
            data.other_person_name   // Other person's name
        ).catch((exception) => {
            console.error("Error sending guardian approved email:", exception);
        });
    } else {
        console.log("sendGuardianApprovedEmail email send failed");
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

    // ✅ Send guardian rejected email
    try {
        if (data.wardUser && data.guardian_name && data.other_person_name) {
            await sendGuardianRejectedEmail(
                data.wardUser,           // Ward User model
                data.guardian_name,      // Guardian name
                data.other_person_name   // Other person's name
            );
        }
    } catch (error) {
        console.error("Error sending guardian rejected email:", error);
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

    // Only send email if user is offline
    if (!isUserOnline(toUserId) && message.toUserEmail) {
        const { sendMail } = await import('../services/emailService.js');
        await sendMail({
            to: message.toUserEmail,
            subject: `New Message from ${message.sender_name} - Marriage Sunna`,
            html: `
                <h1>New Message 💬</h1>
                <p>Assalamu Alaikum,</p>
                <p>You received a new message from <strong>${message.sender_name}</strong>:</p>
                
                <div class="info-box">
                    <p style="font-style: italic;">"${message.body}"</p>
                </div>

                <a href="${process.env.CLIENT_URL}/messages" class="button">Reply Now</a>

                <p><strong>The Marriage Sunna Team</strong></p>
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