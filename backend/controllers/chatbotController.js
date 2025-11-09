const huggingfaceService = require('../services/huggingfaceService');

exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    // Trim and validate message length
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    if (trimmedMessage.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please keep it under 500 characters.'
      });
    }

    // Generate AI response
    const response = await huggingfaceService.generateResponse(
      trimmedMessage,
      conversationHistory || []
    );

    // Return the response
    return res.status(200).json({
      success: true,
      data: {
        message: response.text,
        isLoading: response.isLoading || false,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Chatbot Controller Error:', error);

    // Return graceful error response
    return res.status(500).json({
      success: false,
      message: 'Unable to process your message at the moment',
      data: {
        message: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or feel free to contact our service center directly for immediate assistance.",
        isError: true,
        timestamp: new Date()
      }
    });
  }
};

// Health check endpoint for chatbot service
exports.healthCheck = async (req, res) => {
  try {
    const apiKeyConfigured = !!process.env.HUGGINGFACE_API_KEY;
    
    return res.status(200).json({
      success: true,
      data: {
        status: 'operational',
        apiKeyConfigured,
        timestamp: new Date()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};
