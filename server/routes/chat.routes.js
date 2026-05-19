import express from 'express';
import {
    sendMessage,
    getMessages,
    getConversationUsers,
    addConversationUser,
    deleteConversation,
    getUnreadCount,  // ✅ Add this import
    clearUnreadCount
} from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import db from '../models/index.js';
import { Op } from 'sequelize';
const { User, Profile, Interest, Guardian, Match } = db;
const router = express.Router();

// Send a message
router.post('/send-message', authenticate, sendMessage);

// Get messages for a conversation / interest
router.get('/get-messages', authenticate, getMessages);

// Get users for conversation (based on JWT)
router.get('/conversation-users', authenticate, getConversationUsers);

// Get unread message count
router.get('/unread-count', authenticate, getUnreadCount);  // ✅ Add this route

// Add a new conversation (send first message)
router.post('/add-conversation', authenticate, addConversationUser);

// Delete a conversation by id
router.delete('/conversation/:id', authenticate, deleteConversation);
router.post('/unread-count/clear', authenticate, clearUnreadCount);

// Add BEFORE /conversation/:id route
router.get('/conversation/:receiverId', authenticate, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { receiverId } = req.params;

        // Find match between these users
        const match = await Match.findOne({
            where: {
                [Op.or]: [
                    { user1: userId, user2: receiverId },
                    { user1: receiverId, user2: userId }
                ]
            },
            attributes: ['id']
        });

        res.json({
            success: true,
            data: {
                match_id: match?.id || null
            }
        });
    } catch (error) {
        console.error('Get conversation details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get conversation details'
        });
    }
});


export default router;