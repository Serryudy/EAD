const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// @route   POST /api/chatbot/chat
// @desc    Send a message to the AI chatbot
// @access  Public (no auth required for chatbot)
router.post('/chat', chatbotController.chat);

// @route   GET /api/chatbot/health
// @desc    Check chatbot service health
// @access  Public
router.get('/health', chatbotController.healthCheck);

module.exports = router;
