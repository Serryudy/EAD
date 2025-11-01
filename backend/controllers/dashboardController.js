const Appointment = require('../models/Appointment');
const WorkLog = require('../models/WorkLog');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Use authenticated user from req.user (set by protect middleware)
    const user = req.user;
    const { startDate, endDate } = req.query;
    
    // Allow query param to override for employees viewing specific data
    const employeeId = req.query.employeeId || (user.role === 'employee' ? null : null);

    // Build date range query
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Get appointment statistics based on user role
    const appointmentQuery = { ...dateQuery };
    
    // If customer, only show their appointments (must have customerId)
    if (user.role === 'customer') {
      appointmentQuery.customerId = user._id;
    } else if (user.role === 'employee') {
      // If employee and specific employeeId provided, filter by that
      if (employeeId) {
        appointmentQuery.assignedEmployee = employeeId;
      }
      // Otherwise show ALL appointments (including guest bookings without customerId)
    }

    const totalAppointments = await Appointment.countDocuments(appointmentQuery);
    const pendingAppointments = await Appointment.countDocuments({ 
      ...appointmentQuery, 
      status: 'pending' 
    });
    const confirmedAppointments = await Appointment.countDocuments({ 
      ...appointmentQuery, 
      status: 'confirmed' 
    });
    const inServiceAppointments = await Appointment.countDocuments({ 
      ...appointmentQuery, 
      status: 'in-service' 
    });
    const completedAppointments = await Appointment.countDocuments({ 
      ...appointmentQuery, 
      status: 'completed' 
    });
    const cancelledAppointments = await Appointment.countDocuments({ 
      ...appointmentQuery, 
      status: 'cancelled' 
    });

    // Calculate on-time completion rate
    const onTimeRate = completedAppointments > 0 
      ? Math.round((completedAppointments / totalAppointments) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          inService: inServiceAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        },
        metrics: {
          onTimeRate: `${onTimeRate}%`,
          serviceBays: inServiceAppointments,
          weekOverWeekGrowth: '+8%' // This should be calculated from historical data
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get today's schedule
exports.getTodaysSchedule = async (req, res) => {
  try {
    // Use authenticated user from req.user
    const user = req.user;
    const employeeId = req.query.employeeId;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = {
      preferredDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['confirmed', 'in-service', 'pending'] }
    };

    // Filter based on user role
    if (user.role === 'customer') {
      // Customers see only their appointments
      query.customerId = user._id;
    } else if (user.role === 'employee') {
      // Employees see all appointments (including guest bookings)
      if (employeeId) {
        query.assignedEmployee = employeeId;
      }
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'name phone mobile')
      .populate('assignedEmployee', 'name employeeId')
      .populate('vehicleId')
      .sort({ timeWindow: 1 });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching today\'s schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s schedule',
      error: error.message
    });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    // Use authenticated user from req.user
    const user = req.user;
    const { limit = 10 } = req.query;
    const employeeId = req.query.employeeId;

    const query = {};
    
    // Filter based on user role
    if (user.role === 'customer') {
      query.customerId = user._id;
    } else if (user.role === 'employee') {
      // Employees see all activity
      if (employeeId) {
        query.assignedEmployee = employeeId;
      }
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'name mobile')
      .populate('vehicleId', 'vehicleNumber make model')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));

    const activities = appointments.map(apt => ({
      id: apt._id,
      type: 'appointment',
      action: getActivityAction(apt.status),
      appointmentId: apt._id,
      customerName: apt.customerId?.name || 'Unknown', // Get from populated customer
      vehicleNumber: apt.vehicleId?.vehicleNumber || 'Unknown',
      serviceType: apt.serviceType,
      status: apt.status,
      timestamp: apt.updatedAt
    }));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
};

// Get upcoming bookings
exports.getUpcomingBookings = async (req, res) => {
  try {
    // Use authenticated user from req.user
    const user = req.user;
    const { limit = 5 } = req.query;
    const customerId = req.query.customerId;
    const employeeId = req.query.employeeId;

    const query = {
      preferredDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    };

    // Filter based on user role
    if (user.role === 'customer') {
      query.customerId = user._id;
    } else if (user.role === 'employee') {
      // Employees can see all upcoming bookings (including guest bookings)
      if (customerId) query.customerId = customerId;
      if (employeeId) query.assignedEmployee = employeeId;
    }

    const bookings = await Appointment.find(query)
      .populate('customerId', 'name phone email mobile')
      .populate('assignedEmployee', 'name employeeId')
      .populate('vehicleId')
      .sort({ preferredDate: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming bookings',
      error: error.message
    });
  }
};

// Get service progress details
exports.getServiceProgress = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('customerId', 'name email phone')
      .populate('assignedEmployee', 'name')
      .populate('vehicleId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const workLogs = await WorkLog.find({ 
      appointmentId, 
      isActive: true 
    })
      .populate('technicianId', 'name')
      .sort({ createdAt: 1 });

    const totalDuration = workLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

    res.json({
      success: true,
      data: {
        appointment,
        workLogs,
        progress: {
          currentStep: appointment.currentStep,
          status: appointment.serviceProgress,
          totalHours: `${totalDuration.toFixed(1)}h`,
          estimatedCompletion: appointment.estimatedCompletion
        }
      }
    });
  } catch (error) {
    console.error('Error fetching service progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service progress',
      error: error.message
    });
  }
};

// Get calendar events
exports.getCalendarEvents = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;

    const query = {};
    
    if (employeeId) query.assignedEmployee = employeeId;
    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    } else {
      query.status = { $in: ['confirmed', 'pending', 'in-service'] };
    }

    if (startDate || endDate) {
      query.preferredDate = {};
      if (startDate) query.preferredDate.$gte = new Date(startDate);
      if (endDate) query.preferredDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'name')
      .populate('vehicleId', 'vehicleNumber type')
      .sort({ preferredDate: 1, timeWindow: 1 });

    // Format for calendar
    const events = appointments.map(apt => ({
      id: apt._id,
      date: apt.preferredDate,
      time: apt.timeWindow,
      title: `${apt.vehicleId?.type || 'Vehicle'} - ${apt.serviceType}`,
      vehicleNumber: apt.vehicleId?.vehicleNumber || 'N/A',
      customerName: apt.customerId?.name || 'N/A',
      status: apt.status,
      type: apt.serviceType.toLowerCase().includes('inspection') ? 'inspection' : 'service'
    }));

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events',
      error: error.message
    });
  }
};

// Helper function to determine activity action
function getActivityAction(status) {
  const actions = {
    pending: 'created',
    confirmed: 'confirmed',
    'in-service': 'started',
    completed: 'completed',
    cancelled: 'cancelled'
  };
  return actions[status] || 'updated';
}

module.exports = exports;
