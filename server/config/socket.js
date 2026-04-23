// config/socket.js

import { Server } from 'socket.io';

let io;
const onlineUsers = new Set();

export const initSocket = (server) => {
    console.log('Connecting Socket...');
    io = new Server(server, { cors: { origin: '*' } });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        console.log('Connected Socket:' + socket.id);
        socket.on('join', (userId) => {
            socket.join(`user_${userId}`);
            onlineUsers.add(String(userId));
            console.log(`User ${userId} joined room: user_${userId}`);
            io.emit('user_online', userId);
        });

        socket.on('typing', ({ to, from }) => io.to(`user_${to}`).emit('typing', { from }));
        socket.on('stop_typing', ({ to, from }) => io.to(`user_${to}`).emit('stop_typing', { from }));

        socket.on('disconnect', () => {
            for (const userId of onlineUsers) {
                const rooms = io.sockets.adapter.sids.get(socket.id);
                if (rooms && rooms.has(`user_${userId}`)) {
                    onlineUsers.delete(userId);
                    io.emit('user_offline', userId);
                    console.log(`User ${userId} went offline`);
                    break;
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

export const isUserOnline = (userId) => onlineUsers.has(String(userId));

// ─────────────────────────────────────────────────────────────
// 🔔 INTEREST EVENTS  (from InterestService)
// ─────────────────────────────────────────────────────────────

/**
 * InterestService.send()
 * → notify receiver of new interest
 */
export const notifyInterestReceived = (toUserId, data) => {
    getIO().to(`user_${toUserId}`).emit('interest_received', {
        type: 'interest_received',
        interest_id: data.interest_id,
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        sender_avatar: data.sender_avatar,
        sent_at: data.sent_at || new Date().toISOString(),
    });
    console.log(`💌 interest_received → user_${toUserId}`);
};

/**
 * InterestService.accept()
 * → notify original sender their interest was accepted
 */
export const notifyInterestAccepted = (toUserId, data) => {
    getIO().to(`user_${toUserId}`).emit('interest_accepted', {
        type: 'interest_accepted',
        interest_id: data.interest_id,
        accepted_by_id: data.accepted_by_id,
        accepted_by_name: data.accepted_by_name,
        accepted_by_avatar: data.accepted_by_avatar,
        accepted_at: new Date().toISOString(),
    });
    console.log(`✅ interest_accepted → user_${toUserId}`);
};

/**
 * InterestService.decline()
 * → notify sender their interest was declined
 */
export const notifyInterestDeclined = (toUserId, data) => {
    getIO().to(`user_${toUserId}`).emit('interest_declined', {
        type: 'interest_declined',
        interest_id: data.interest_id,
        declined_by_id: data.declined_by_id,
        declined_by_name: data.declined_by_name,
        declined_at: new Date().toISOString(),
    });
    console.log(`❌ interest_declined → user_${toUserId}`);
};

/**
 * InterestService.cancel()
 * → notify receiver that sender cancelled
 */
export const notifyInterestCancelled = (toUserId, data) => {
    getIO().to(`user_${toUserId}`).emit('interest_cancelled', {
        type: 'interest_cancelled',
        interest_id: data.interest_id,
        cancelled_by: data.cancelled_by,
        cancelled_at: new Date().toISOString(),
    });
    console.log(`🚫 interest_cancelled → user_${toUserId}`);
};

/**
 * InterestService.pendingCount()
 * → push realtime pending count badge after any interest action
 */
export const notifyInterestCount = (toUserId, count) => {
    getIO().to(`user_${toUserId}`).emit('interest_count', {
        type: 'interest_count',
        count: Number(count),
    });
    console.log(`🔢 interest_count (${count}) → user_${toUserId}`);
};

/**
 * When a new match is created after accept
 */
export const notifyNewMatch = (userId1, userId2, matchData = {}) => {
    const payload = {
        type: 'new_match',
        match_id: matchData.match_id || null,
        matched_at: matchData.matched_at || new Date().toISOString(),
    };

    getIO().to(`user_${userId1}`).emit('new_match', {
        ...payload,
        matched_with_id: userId2,
        matched_with_name: matchData.user2_name || '',
        matched_with_avatar: matchData.user2_avatar || null,
    });

    getIO().to(`user_${userId2}`).emit('new_match', {
        ...payload,
        matched_with_id: userId1,
        matched_with_name: matchData.user1_name || '',
        matched_with_avatar: matchData.user1_avatar || null,
    });

    console.log(`💞 new_match → user_${userId1} & user_${userId2}`);
};

// ─────────────────────────────────────────────────────────────
// 🕌 GUARDIAN EVENTS  (from GuardianService)
// ─────────────────────────────────────────────────────────────

/**
 * GuardianService.assignGuardian()
 * → notify guardian they have been assigned a ward
 */
export const notifyGuardianAssigned = (guardianUserId, data) => {
    getIO().to(`user_${guardianUserId}`).emit('guardian_assigned', {
        type: 'guardian_assigned',
        ward_id: data.ward_id,
        ward_name: data.ward_name,
        ward_avatar: data.ward_avatar,
        assigned_at: new Date().toISOString(),
    });
    console.log(`🤝 guardian_assigned → user_${guardianUserId}`);
};

/**
 * GuardianService.removeGuardian()
 * → notify guardian they have been removed
 */
export const notifyGuardianRemoved = (guardianUserId, data) => {
    getIO().to(`user_${guardianUserId}`).emit('guardian_removed', {
        type: 'guardian_removed',
        ward_id: data.ward_id,
        ward_name: data.ward_name,
        removed_at: new Date().toISOString(),
    });
    console.log(`🗑️ guardian_removed → user_${guardianUserId}`);
};

/**
 * GuardianService.getPendingInterests()
 * → push realtime pending count to guardian when ward gets new interest
 */
export const notifyGuardianPendingCount = (guardianUserId, count) => {
    getIO().to(`user_${guardianUserId}`).emit('guardian_pending_count', {
        type: 'guardian_pending_count',
        count: Number(count),
    });
    console.log(`🔢 guardian_pending_count (${count}) → user_${guardianUserId}`);
};

/**
 * GuardianService.approveInterest() / guardianApprove()
 * → notify ward that guardian approved their interest
 */
export const notifyGuardianApproved = (wardUserId, data) => {
    getIO().to(`user_${wardUserId}`).emit('guardian_approved', {
        type: 'guardian_approved',
        interest_id: data.interest_id,
        guardian_id: data.guardian_id,

        guardian_avatar: data.guardian_avatar,
        approved_for: data.approved_for, // 'send' | 'accept'
        approved_at: new Date().toISOString(),
    });
    console.log(`✅ guardian_approved → user_${wardUserId}`);
};

/**
 * GuardianService.rejectInterest()
 * → notify ward that guardian rejected their interest
 */
export const notifyGuardianRejected = (wardUserId, data) => {
    getIO().to(`user_${wardUserId}`).emit('guardian_rejected', {
        type: 'guardian_rejected',
        interest_id: data.interest_id,
        guardian_id: data.guardian_id,

        guardian_avatar: data.guardian_avatar,
        rejected_at: new Date().toISOString(),
    });
    console.log(`❌ guardian_rejected → user_${wardUserId}`);
};

// ─────────────────────────────────────────────────────────────
// 💬 MESSAGE EVENTS
// ─────────────────────────────────────────────────────────────

/**
 * → notify recipient of new chat message
 */
export const notifyNewMessage = (toUserId, message) => {
    getIO().to(`user_${toUserId}`).emit('new_message', {
        type: 'new_message',
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        sender_name: message.sender_name,
        sender_avatar: message.sender_avatar,
        body: message.body,
        created_at: message.created_at || new Date().toISOString(),
    });
    console.log(`📩 new_message → user_${toUserId}`);
};
