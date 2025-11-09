const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middlewares/auth');

// @route   POST /api/chatbot/chat
// @desc    Send a message to the AI chatbot
// @access  Public (but enhanced with auth data if logged in)
// Use optional auth middleware that doesn't require authentication but adds user data if available
const optionalAuth = (req, res, next) => {
  protect(req, res, (err) => {
    // If auth fails, just continue without user data
    // This allows both authenticated and guest users
    next();
  });
};

router.post('/chat', optionalAuth, chatbotController.chat);

// @route   GET /api/chatbot/health
// @desc    Check chatbot service health
// @access  Public
router.get('/health', chatbotController.healthCheck);

module.exports = router;
