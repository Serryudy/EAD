const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middlewares/auth');

// @route   POST /api/chatbot/chat
// @desc    Send a message to the AI chatbot
// @access  Public (but enhanced with auth data if logged in)
// Optional auth middleware that doesn't require authentication but adds user data if available
const optionalAuth = async (req, res, next) => {
  try {
    // Check multiple possible token sources
    const token = req.cookies?.accessToken || 
                  req.cookies?.token || 
                  req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔍 OptionalAuth Debug:');
    console.log('- Cookies available:', req.cookies ? Object.keys(req.cookies) : 'None');
    console.log('- Token found:', token ? 'Yes' : 'No');
    
    if (token) {
      // If token exists, try to verify it
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('- Token decoded:', { id: decoded.id, role: decoded.role });
        req.user = await User.findById(decoded.id).select('-password');
        console.log('- User found:', req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Not found');
      } catch (err) {
        console.log('- Token verification failed:', err.message);
        // Token invalid, continue as guest
        req.user = null;
      }
    }
    
    next();
  } catch (error) {
    console.log('- OptionalAuth error:', error.message);
    // If anything fails, continue as guest user
    req.user = null;
    next();
  }
};

router.post('/chat', optionalAuth, chatbotController.chat);

// @route   GET /api/chatbot/health
// @desc    Check chatbot service health
// @access  Public
router.get('/health', chatbotController.healthCheck);

module.exports = router;
