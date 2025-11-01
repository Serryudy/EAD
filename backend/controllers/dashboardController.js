const Appointment = require('../models/Appointment');
const WorkLog = require('../models/WorkLog');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    // Build date range query
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Get appointment statistics
    const appointmentQuery = { ...dateQuery };
    if (employeeId) appointmentQuery.assignedEmployee = employeeId;

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
    const { employeeId } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = {
      preferredDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['confirmed', 'in-service', 'pending'] }
    };

    if (employeeId) {
      query.assignedEmployee = employeeId;
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'name phone')
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
    const { employeeId, limit = 10 } = req.query;

    const query = {};
    if (employeeId) query.assignedEmployee = employeeId;

    const appointments = await Appointment.find(query)
      .populate('customerId', 'name')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));

    const activities = appointments.map(apt => ({
      id: apt._id,
      type: 'appointment',
      action: getActivityAction(apt.status),
      appointmentId: apt._id,
      customerName: apt.customerName,
      vehicleNumber: apt.vehicleNumber,
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
    const { customerId, employeeId, limit = 5 } = req.query;

    const query = {
      preferredDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    };

    if (customerId) query.customerId = customerId;
    if (employeeId) query.assignedEmployee = employeeId;

    const bookings = await Appointment.find(query)
      .populate('customerId', 'name phone email')
      .populate('assignedEmployee', 'name')
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
      .populate('vehicleId')
      .sort({ preferredDate: 1, timeWindow: 1 });

    // Format for calendar
    const events = appointments.map(apt => ({
      id: apt._id,
      date: apt.preferredDate,
      time: apt.timeWindow,
      title: `${apt.vehicleType} - ${apt.serviceType}`,
      vehicleNumber: apt.vehicleNumber,
      customerName: apt.customerName,
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
