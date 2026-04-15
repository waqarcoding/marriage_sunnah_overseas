const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Send a message
router.post('/send-message', authenticate, chatController.sendMessage);

// Get messages for a conversation / interest
router.get('/get-messages', authenticate, chatController.getMessages);

// Get users for conversation (based on JWT)
router.get('/conversation-users', authenticate, chatController.getConversationUsers);

// Add a new conversation (send first message)
router.post('/add-conversation', authenticate, chatController.addConversationUser);

module.exports = router;