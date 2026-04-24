import express from 'express';
import {
    sendMessage,
    getMessages,
    getConversationUsers,
    addConversationUser,
    deleteConversation
} from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Send a message
router.post('/send-message', authenticate, sendMessage);

// Get messages for a conversation / interest
router.get('/get-messages', authenticate, getMessages);

// Get users for conversation (based on JWT)
router.get('/conversation-users', authenticate, getConversationUsers);

// Add a new conversation (send first message)
router.post('/add-conversation', authenticate, addConversationUser);

// Delete a conversation by id
router.delete('/conversation/:id', authenticate, deleteConversation);

export default router;