const openaiService = require('../services/openaiService');
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
    const userName = req.user ? `${req.user.firstName} ${req.user.lastName}` : null;

    // DEBUG: Log user authentication status
    console.log('🔍 CHATBOT AUTHENTICATION DEBUG:');
    console.log('- User ID:', userId);
    console.log('- User Role:', userRole);
    console.log('- User Name:', userName);
    console.log('- req.user:', req.user ? JSON.stringify({
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role
    }, null, 2) : 'Not present');
    console.log('- Headers Authorization:', req.headers.authorization ? 'Present' : 'Missing');
    console.log('- Cookies:', req.cookies ? JSON.stringify(req.cookies, null, 2) : 'No cookies');
    console.log('- Raw Headers:', JSON.stringify(req.headers, null, 2));

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

    // ALWAYS fetch user data if authenticated to provide personalized responses
    let databaseContext = null;
    let serviceInfo = null;
    
    if (userId) {
      try {
        // Get user's service information
        serviceInfo = await getServiceProgressInfo(userId, userRole);
        
        // Build comprehensive database context
        databaseContext = {
          user: {
            id: userId,
            name: userName,
            role: userRole
          },
          currentData: {
            inProgressServices: serviceInfo.inProgressServices.length,
            upcomingAppointments: serviceInfo.pendingAppointments.length,
            hasActiveServices: serviceInfo.inProgressServices.length > 0 || serviceInfo.pendingAppointments.length > 0
          },
          serviceDetails: {
            inProgressServices: serviceInfo.inProgressServices.map(service => ({
              serviceName: service.serviceId?.name || 'Service',
              vehicleInfo: service.vehicleId 
                ? `${service.vehicleId.make} ${service.vehicleId.model} (${service.vehicleId.licensePlate})`
                : 'Vehicle info not available',
              progress: service.progressPercentage || 0,
              estimatedCompletion: service.estimatedCompletionTime,
              status: service.status,
              lastUpdate: service.liveUpdates && service.liveUpdates.length > 0 
                ? service.liveUpdates[service.liveUpdates.length - 1].message 
                : null
            })),
            upcomingAppointments: serviceInfo.pendingAppointments.map(apt => ({
              appointmentDate: apt.appointmentDate,
              appointmentTime: apt.appointmentTime,
              serviceType: apt.serviceType,
              vehicleInfo: apt.vehicleId 
                ? `${apt.vehicleId.make} ${apt.vehicleId.model}`
                : 'Vehicle',
              status: apt.status
            }))
          }
        };
        
        console.log(`📊 Database context prepared for user: ${userName} (${userRole})`);
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // Continue without database context
      }
    } else {
      console.log('👤 Guest user - limited database context');
      databaseContext = {
        user: {
          type: 'guest',
          authenticated: false
        },
        message: 'User is not logged in - provide general AutoCare information'
      };
    }

    // Generate AI response with database context (OPENAI ONLY - NO FALLBACK)
    try {
      console.log('🧠 Calling OpenAI with user database context...');
      
      const response = await openaiService.generateResponse(
        trimmedMessage,
        conversationHistory || [],
        databaseContext
      );
      
      console.log('✅ OpenAI Response Generated Successfully');
      
      return res.status(200).json({
        success: true,
        data: {
          message: response.text,
          isLoading: false,
          timestamp: new Date(),
          source: response.source,
          model: response.model,
          userAuthenticated: !!userId,
          hasUserData: !!(userId && serviceInfo && (serviceInfo.inProgressServices.length > 0 || serviceInfo.pendingAppointments.length > 0))
        }
      });

    } catch (aiError) {
      console.error('❌ OpenAI AI Failed:', aiError.message);
      
      // NO FALLBACK - Return AI error to user as requested
      return res.status(500).json({
        success: false,
        message: 'AI Service Error',
        data: {
          message: `❌ AI Assistant is currently unavailable: ${aiError.message}. Please try again later or contact our service center directly.`,
          isError: true,
          timestamp: new Date(),
          errorType: 'ai_service_error'
        }
      });
    }

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
    const apiKeyConfigured = !!process.env.OPENAI_API_KEY;
    
    return res.status(200).json({
      success: true,
      data: {
        status: 'operational',
        service: 'OpenAI GPT-3.5-turbo',
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
