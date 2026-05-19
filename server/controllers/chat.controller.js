// controllers/chat.controller.js

import db from '../models/index.js';
const { sequelize, User, Profile, Match, Guardian, Interest, Message, Otp } = db;

import { Op } from 'sequelize';
import { getIO, isUserOnline, notifyNewMessage, notifyChatCountUpdate } from '../config/socket.js';

export const sendMessage = async (req, res, next) => {
    try {
        const sender_id = req.user.id;
        const { receiver_id, message, interest_id } = req.body;
        const receiverIdNum = Number(receiver_id);



        // ✅ VALIDATION 1: Check if interest exists and is accepted
        let interest = null;
        let isGuardianMessage = false;

        if (interest_id) {
            interest = await Interest.findByPk(interest_id);

            if (!interest) {
                return res.json({
                    success: false,
                    error: 'Interest not found'
                });
            }

            // ✅ Check if interest is pending
            if (interest.status === 'pending') {
                return res.json({
                    success: false,
                    error: 'Cannot send messages while interest is pending'
                });
            }

            // ✅ Check if interest is rejected
            if (interest.status === 'rejected') {
                return res.json({
                    success: false,
                    error: 'Cannot send messages to rejected interest'
                });
            }

            // ✅ Interest must be accepted to continue
            if (interest.status !== 'accepted') {
                return res.json({
                    success: false,
                    error: 'Interest must be accepted to send messages'
                });
            }
        }

        // ✅ VALIDATION 2: Check if sender is guardian of receiver
        const guardianRelation = await Guardian.findOne({
            where: {
                guardian_id: sender_id,
                individual_id: receiverIdNum
            }
        });

        if (guardianRelation) {
            isGuardianMessage = true;
        }

        // ✅ SAVE MESSAGE
        const saved = await Message.create({
            sender_id,
            receiver_id: receiverIdNum,
            message,
            interest_id: interest_id || null,
            is_seen: false,
        });

        // Get sender profile
        const senderProfile = await Profile.findOne({
            where: { individual_id: sender_id },
            attributes: ["individual_id", "name", "images", "city", "country"],
        });

        const messageData = {
            ...saved.toJSON(),
            sender_name: senderProfile?.name || '',
            sender_avatar: senderProfile?.images ? JSON.parse(senderProfile.images)[0] : null,
        };

        // ✅ Emit to RECEIVER (for real-time message in chat)
        getIO().to(`user_${receiverIdNum}`).emit('new_message', messageData);

        // ✅ Emit to SENDER (so their conversation list updates)
        getIO().to(`user_${sender_id}`).emit('new_message', messageData);

        // 🔔 Notify receiver (this creates the notification in DB)
        await notifyNewMessage(receiverIdNum, {
            conversation_id: interest_id,
            sender_id: sender_id,
            receiver_id: receiverIdNum,
            sender_name: senderProfile?.name || '',
            sender_avatar: senderProfile?.images ? JSON.parse(senderProfile.images)[0] : null,
            body: message ? String(message).trim() : '',
        });

        // ✅ DEDUCT MESSAGE CREDIT (only if not guardian and not pro)
        if (!isGuardianMessage && !req.user.is_pro) {
            // Deduct message credit logic here
            // await deductMessageCredit(sender_id);
            console.log('📉 Message credit deducted for user:', sender_id);
        } else if (isGuardianMessage) {
            console.log('👨‍👧 Guardian message - no credit deducted');
        } else {
            console.log('⭐ Pro user - no credit deducted');
        }

        res.json({
            success: true,
            data: saved,
            isGuardianMessage,
            creditDeducted: !isGuardianMessage && !req.user.is_pro
        });
    } catch (err) {
        console.error('❌ Error in sendMessage:', err);
        next(err);
    }
};
export const getMessages = async (req, res, next) => {
    try {
        const current_user_id = req.user.id;
        const receiverIdNum = Number(req.query.receiver_id);

        const messages = await Message.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { sender_id: current_user_id, receiver_id: receiverIdNum },
                            { sender_id: receiverIdNum, receiver_id: current_user_id },
                        ]
                    }

                ]

            },
            order: [['created_at', 'ASC']],
        });

        // Mark unseen messages from the receiver as seen
        const unseenMessages = messages.filter(
            msg => msg.sender_id === receiverIdNum &&
                msg.receiver_id === current_user_id &&
                msg.is_seen === false
        );

        if (unseenMessages.length > 0) {
            console.log(`📝 Marking ${unseenMessages.length} messages as seen for user ${current_user_id}`);

            await Message.update(
                { is_seen: true },
                {
                    where: {
                        receiver_id: current_user_id,
                        sender_id: receiverIdNum,
                        is_seen: false,
                        // ✅ Don't mark deleted messages as seen
                        [Op.or]: [
                            { deletedBy: null },
                            { deletedBy: { [Op.notLike]: `%${current_user_id}%` } }
                        ]
                    },
                }
            );

            // ✅ Get new unread count (excluding deleted messages)
            const newUnreadCount = await Message.count({
                where: {
                    receiver_id: current_user_id,
                    is_seen: false,
                    [Op.or]: [
                        { deletedBy: null },
                        { deletedBy: { [Op.notLike]: `%${current_user_id}%` } }
                    ]
                }
            });

            // ✅ Notify via socket
            notifyChatCountUpdate(current_user_id, newUnreadCount);
        }

        res.json({ success: true, data: messages });
    } catch (err) {
        console.error('❌ Error in getMessages:', err);
        next(err);
    }
};
// ✅ Get unread message count
export const getUnreadCount = async (req, res, next) => {
    try {
        const current_user_id = req.user.id;

        const count = await Message.count({
            where: {
                receiver_id: current_user_id,
                is_seen: false,
            }
        });


        res.json({ success: true, data: { count } });
    } catch (err) {
        console.error('❌ Error in getUnreadCount:', err);
        next(err);
    }
};
// ✅ Clear unread count for a user (mark all messages as seen)
export const clearUnreadCount = async (req, res, next) => {
    try {
        const current_user_id = req.user.id;

        // Mark all messages as seen where this user is the receiver and not deleted for them
        await Message.update(
            { is_seen: true },
            {
                where: {
                    receiver_id: current_user_id,
                    is_seen: false,
                    [Op.or]: [
                        { deletedBy: null },
                        { deletedBy: { [Op.notLike]: `%${current_user_id}%` } }
                    ]
                }
            }
        );

        // Optionally notify via socket
        notifyChatCountUpdate(current_user_id, 0);

        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error in clearUnreadCount:', err);
        next(err);
    }
};


export const getConversationUsers = async (req, res, next) => {
    try {
        const current_user_id = req.user.id;
        console.log("🔍 Fetching conversations for user:", current_user_id);

        const messages = await Message.findAll({
            attributes: ["id", "sender_id", "receiver_id", "message", "created_at", "deletedBy", "is_seen"], // ✅ Added is_seen
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { sender_id: current_user_id },
                            { receiver_id: current_user_id }
                        ]
                    },
                    {
                        [Op.or]: [
                            { deletedBy: null },
                            { deletedBy: { [Op.notLike]: `%,${current_user_id},%` } }
                        ]
                    }
                ]
            },
            order: [['created_at', 'DESC']],
        });

        console.log("📨 Total messages found:", messages.length);

        const interactedIds = new Set();
        messages.forEach(msg => {
            if (msg.sender_id !== current_user_id) interactedIds.add(msg.sender_id);
            if (msg.receiver_id !== current_user_id) interactedIds.add(msg.receiver_id);
        });

        console.log("👥 Unique user IDs found:", [...interactedIds]);

        if (interactedIds.size === 0) return res.json({ success: true, data: [] });

        const users = await User.findAll({
            where: { id: { [Op.in]: [...interactedIds] } },
            include: [{
                model: Profile,
                as: 'profile',
                required: false,
                attributes: ['name', 'images', 'city', 'country', 'is_blurred_images', 'is_show_last_seen']
            }],
            attributes: ['id', 'name', 'email', 'role', 'avatar_url']
        });

        const conversations = users.map(user => {
            const profile = user.profile || {};

            let avatarUrl = user.avatar_url || '/placeholder.png';
            if (!user.avatar_url && profile.images) {
                try {
                    const imagesArray = JSON.parse(profile.images);
                    avatarUrl = imagesArray[0] || '/placeholder.png';
                } catch (e) {
                    console.error('Failed to parse images for user', user.id, e);
                }
            }

            const lastMsg = messages.find(
                m => (m.sender_id === user.id && m.receiver_id === current_user_id) ||
                    (m.receiver_id === user.id && m.sender_id === current_user_id)
            );

            // ✅ Calculate unread count for this specific conversation
            const unreadCount = messages.filter(
                m => m.sender_id === user.id &&
                    m.receiver_id === current_user_id &&
                    m.is_seen === false
            ).length;

            console.log(`💬 Conversation with ${user.id}:`, {
                name: profile.name || user.name,
                unreadCount,
                lastMessage: lastMsg?.message
            });

            return {
                id: user.id,
                other_user_id: user.id,
                current_user_id: current_user_id,
                name: profile.name || user.name || "Unknown",
                avatar: avatarUrl,
                location: [profile.city, profile.country].filter(Boolean).join(", "),
                last_message: lastMsg?.message || "",
                last_message_at: lastMsg?.created_at || null,
                unread_count: unreadCount, // ✅ Added unread count
                unread: unreadCount, // ✅ Also add as 'unread' for compatibility
                is_online: isUserOnline(user.id),
                is_blurred_images: profile.is_blurred_images || false,
                is_show_last_seen: profile.is_show_last_seen !== false,
                is_pro: false,
            };
        });

        const activeConversations = conversations.filter(conv => conv.last_message_at !== null);

        console.log("✅ Returning conversations:", activeConversations.length);
        console.log("📊 Unread counts:", activeConversations.map(c => ({ name: c.name, unread: c.unread_count })));

        res.json({ success: true, data: activeConversations });

    } catch (err) {
        console.error('❌ Error in getConversationUsers:', err);
        next(err);
    }
};
export const deleteConversation = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;

        console.log("deleting conversation");
        console.log(" conversationId:" + conversationId);
        console.log(" userId:" + userId);

        // ✅ Simple approach - store as comma-separated string
        const [updatedCount] = await Message.update(
            {
                deletedBy: sequelize.literal(`CONCAT(COALESCE(deletedBy, ''), ',${userId},')`)
            },
            {
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { sender_id: userId, receiver_id: conversationId },
                                { sender_id: conversationId, receiver_id: userId }
                            ]
                        },
                        {
                            [Op.or]: [
                                { deletedBy: null },
                                { deletedBy: { [Op.notLike]: `%,${userId},%` } }
                            ]
                        }
                    ]

                }
            }
        );

        console.log(`✅ Soft deleted ${updatedCount} messages`);
        res.json({ success: true, deletedCount: updatedCount });
    } catch (err) {
        console.error('❌ Error in deleteConversation:', err);
        next(err);
    }
};
export const addConversationUser = async (req, res, next) => {
    try {
        const sender_id = req.user.id;
        const { receiver_id, message } = req.body;

        const saved = await Message.create({
            sender_id,
            receiver_id,
            message: message || "Hi! 👋",
            is_seen: false
        });

        getIO().to(`user_${receiver_id}`).emit('message', saved);

        res.json({ success: true, data: saved });
    } catch (err) {
        console.error('❌ Error in addConversationUser:', err);
        next(err);
    }
};