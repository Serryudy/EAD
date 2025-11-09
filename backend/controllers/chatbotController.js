const huggingfaceService = require('../services/huggingfaceService');
const ServiceRecord = require('../models/ServiceRecord');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

// Helper function to get service progress information
async function getServiceProgressInfo(userId, userRole) {
  try {
    let query = {};
    
    if (userRole === 'customer') {
      query.customerId = userId;
    } else if (userRole === 'employee') {
      query.assignedEmployee = userId;
    }

    // Get in-progress service records
    const inProgressServices = await ServiceRecord.find({
      ...query,
      status: 'in-progress'
    })
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model licensePlate')
      .populate('serviceId', 'name estimatedDuration')
      .sort({ startTime: -1 })
      .limit(5);

    // Get pending appointments
    const pendingAppointments = await Appointment.find({
      ...query,
      status: { $in: ['pending', 'confirmed'] },
      appointmentDate: { $gte: new Date() }
    })
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model licensePlate')
      .sort({ appointmentDate: 1 })
      .limit(3);

    return {
      inProgressServices,
      pendingAppointments
    };
  } catch (error) {
    console.error('Error fetching service info:', error);
    return { inProgressServices: [], pendingAppointments: [] };
  }
}

// Helper function to format service information for chatbot context
function formatServiceContext(serviceInfo, userRole) {
  let context = '\n\nCurrent System Information:\n';
  
  if (serviceInfo.inProgressServices.length > 0) {
    context += `\nIn-Progress Services (${serviceInfo.inProgressServices.length}):\n`;
    serviceInfo.inProgressServices.forEach((service, index) => {
      const vehicleInfo = service.vehicleId 
        ? `${service.vehicleId.make} ${service.vehicleId.model} (${service.vehicleId.licensePlate})`
        : 'Vehicle info not available';
      
      const serviceName = service.serviceId?.name || 'Service';
      const progress = service.progressPercentage || 0;
      const customerName = service.customerId 
        ? `${service.customerId.firstName} ${service.customerId.lastName}`
        : 'Customer';
      
      let estimatedCompletion = 'estimating...';
      if (service.estimatedCompletionTime) {
        const completionDate = new Date(service.estimatedCompletionTime);
        const now = new Date();
        const hoursLeft = Math.max(0, Math.round((completionDate - now) / (1000 * 60 * 60)));
        estimatedCompletion = hoursLeft > 0 ? `~${hoursLeft} hours remaining` : 'nearly complete';
      }
      
      context += `${index + 1}. ${serviceName} for ${vehicleInfo} - ${progress}% complete, ${estimatedCompletion}\n`;
      if (userRole === 'employee') {
        context += `   Customer: ${customerName}\n`;
      }
    });
  }
  
  if (serviceInfo.pendingAppointments.length > 0) {
    context += `\nUpcoming Appointments (${serviceInfo.pendingAppointments.length}):\n`;
    serviceInfo.pendingAppointments.forEach((apt, index) => {
      const date = new Date(apt.appointmentDate).toLocaleDateString();
      const time = apt.appointmentTime || 'Time TBD';
      const vehicleInfo = apt.vehicleId 
        ? `${apt.vehicleId.make} ${apt.vehicleId.model}`
        : 'Vehicle';
      const service = apt.serviceType || 'Service';
      
      context += `${index + 1}. ${service} for ${vehicleInfo} - ${date} at ${time} (${apt.status})\n`;
    });
  }
  
  if (serviceInfo.inProgressServices.length === 0 && serviceInfo.pendingAppointments.length === 0) {
    context += '\nNo active services or upcoming appointments at the moment.\n';
  }
  
  return context;
}

exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user?._id; // From auth middleware (if authenticated)
    const userRole = req.user?.role;

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

    // Check if the message is asking about service status/progress
    const isStatusQuery = /status|progress|how (long|much)|when (will|done|finish|complete)|estimate|time/i.test(trimmedMessage);
    
    // Fetch real service data if user is authenticated and asking about status
    let serviceContext = '';
    if (userId && isStatusQuery) {
      const serviceInfo = await getServiceProgressInfo(userId, userRole);
      serviceContext = formatServiceContext(serviceInfo, userRole);
      
      // If we have real data, provide a smart response
      if (serviceInfo.inProgressServices.length > 0 || serviceInfo.pendingAppointments.length > 0) {
        let smartResponse = '';
        
        if (serviceInfo.inProgressServices.length > 0) {
          const service = serviceInfo.inProgressServices[0];
          const serviceName = service.serviceId?.name || 'Your service';
          const progress = service.progressPercentage || 0;
          const vehicle = service.vehicleId 
            ? `${service.vehicleId.make} ${service.vehicleId.model}`
            : 'your vehicle';
          
          let timeEstimate = '';
          if (service.estimatedCompletionTime) {
            const completionDate = new Date(service.estimatedCompletionTime);
            const now = new Date();
            const hoursLeft = Math.max(0, Math.round((completionDate - now) / (1000 * 60 * 60)));
            if (hoursLeft > 0) {
              timeEstimate = ` and should be ready in approximately ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`;
            } else {
              timeEstimate = ' and should be ready very soon';
            }
          }
          
          smartResponse = `${serviceName} for your ${vehicle} is currently ${progress}% complete${timeEstimate}.`;
          
          if (serviceInfo.inProgressServices.length > 1) {
            smartResponse += ` You also have ${serviceInfo.inProgressServices.length - 1} other service${serviceInfo.inProgressServices.length > 2 ? 's' : ''} in progress.`;
          }
          
          if (service.liveUpdates && service.liveUpdates.length > 0) {
            const lastUpdate = service.liveUpdates[service.liveUpdates.length - 1];
            smartResponse += ` Latest update: ${lastUpdate.message}`;
          }
        }
        
        if (serviceInfo.pendingAppointments.length > 0 && smartResponse === '') {
          const apt = serviceInfo.pendingAppointments[0];
          const date = new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          });
          const time = apt.appointmentTime || 'a time to be confirmed';
          smartResponse = `You have an appointment scheduled for ${date} at ${time} for ${apt.serviceType}.`;
        }
        
        if (smartResponse) {
          return res.status(200).json({
            success: true,
            data: {
              message: smartResponse,
              isLoading: false,
              timestamp: new Date(),
              hasRealData: true
            }
          });
        }
      }
    }

    // Try to generate AI response with enhanced context (optional enhancement)
    let aiResponse = null;
    try {
      const enhancedMessage = serviceContext 
        ? `${trimmedMessage}\n${serviceContext}` 
        : trimmedMessage;
      
      const response = await huggingfaceService.generateResponse(
        enhancedMessage,
        conversationHistory || []
      );
      
      // Only use AI response if it's not an error
      if (!response.error) {
        aiResponse = response.text;
      }
    } catch (aiError) {
      console.log('AI generation failed, using smart fallback');
      // Continue with fallback - don't throw error
    }

    // If we have AI response, use it; otherwise use intelligent fallback
    const finalResponse = aiResponse || generateSmartFallback(trimmedMessage, serviceContext);

    // Return the response
    return res.status(200).json({
      success: true,
      data: {
        message: finalResponse,
        isLoading: false,
        timestamp: new Date(),
        source: aiResponse ? 'ai' : 'smart-fallback'
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

// Smart fallback function when AI is unavailable
function generateSmartFallback(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // If we have service context, return it
  if (context) {
    return context;
  }
  
  // Common questions with smart responses
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return "Our services range from $50 for basic oil changes to $500 for major tune-ups. Would you like me to check the specific price for a service you're interested in?";
  }
  
  if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('when')) {
    return "We're open Monday-Friday 8AM-6PM, Saturday 9AM-4PM, and closed on Sundays. Would you like to book an appointment?";
  }
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
    return "I can help you book an appointment! We have availability throughout the week. What service do you need, and when would you prefer?";
  }
  
  if (lowerMessage.includes('service') && (lowerMessage.includes('what') || lowerMessage.includes('offer'))) {
    return "We offer a full range of vehicle services including: Oil Changes, Brake Inspections, Tire Rotations, Engine Diagnostics, Tune-ups, AC Repair, Transmission Service, and Battery Replacement. What service are you interested in?";
  }
  
  if (lowerMessage.includes('status') || lowerMessage.includes('progress') || lowerMessage.includes('update')) {
    return "I can check your service status for you! Could you please provide your appointment details or phone number?";
  }
  
  if (lowerMessage.includes('cancel') || lowerMessage.includes('reschedule')) {
    return "I can help you with that. To cancel or reschedule your appointment, please contact us at (555) 123-4567 or visit our service center.";
  }
  
  if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address')) {
    return "We're located at AutoCare Service Center. You can find directions through our website or give us a call at (555) 123-4567.";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm AutoCare Assistant. I can help you with service inquiries, appointment booking, pricing, and status updates. What can I help you with today?";
  }
  
  if (lowerMessage.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with today?";
  }
  
  // Default helpful response
  return "I'm here to help with your vehicle service needs! You can ask me about:\n• Service prices and availability\n• Booking or checking appointments\n• Our business hours and location\n• Service status and progress updates\n\nWhat would you like to know?";
}

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
