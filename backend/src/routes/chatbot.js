const express = require('express');
const { sendMessageHandler, getHistoryHandler, clearHistoryHandler, createEventFromChatHandler, getSuggestionsHandler } = require('../controllers/chatbotController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All chatbot routes require authentication
router.use(verifyToken);

// Send message to chatbot
router.post('/message', sendMessageHandler);

// Get conversation history
router.get('/history', getHistoryHandler);

// Clear conversation history
router.delete('/history', clearHistoryHandler);

// Create event from chat message
router.post('/create-event', createEventFromChatHandler);

// Get smart suggestions
router.get('/suggestions', getSuggestionsHandler);

module.exports = router;
