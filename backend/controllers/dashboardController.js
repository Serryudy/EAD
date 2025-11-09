const Appointment = require('../models/Appointment');
const WorkLog = require('../models/WorkLog');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const ServiceRecord = require('../models/ServiceRecord');
const User = require('../models/User');

// ========================
// EMPLOYEE ANALYTICS
// ========================

/**
 * Employee: Get weekly workload (services per day for last 7 days)
 */
exports.getEmployeeWeeklyWorkload = async (req, res) => {
  try {
    const employeeId = req.user._id;

    // Get date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Aggregate services by day
    const services = await ServiceRecord.aggregate([
      {
        $match: {
          assignedEmployee: employeeId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Create array for last 7 days
    const labels = [];
    const data = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateString = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      
      labels.push(dayName);
      
      const found = services.find(s => s._id === dateString);
      data.push(found ? found.count : 0);
    }

    res.json({
      success: true,
      data: {
        labels,
        data,
        totalServices: data.reduce((a, b) => a + b, 0)
      }
    });

  } catch (error) {
    console.error('Get weekly workload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly workload',
      error: error.message
    });
  }
};

/**
 * Employee: Get assigned service records with progress
 */
exports.getEmployeeAssignments = async (req, res) => {
  try {
    const employeeId = req.user._id;
    
    console.log('🔍 Fetching assignments for employee:', employeeId);
    console.log('👤 Full user object:', {
      id: req.user._id,
      role: req.user.role,
      employeeId: req.user.employeeId,
      name: req.user.name
    });
    
    // Find all service records assigned to this employee
    const assignments = await ServiceRecord.find({
      assignedEmployee: employeeId,
      status: { $in: ['received', 'in-progress'] }
    })
    .populate('appointmentId')
    .populate('vehicleId')
    .populate('customerId', 'firstName lastName phoneNumber')
    .sort({ createdAt: -1 });

    console.log('📋 Found assignments:', assignments.length);
    if (assignments.length > 0) {
      console.log('First assignment:', assignments[0]);
    }

    // Format the assignments
    const formattedAssignments = assignments.map(assignment => {
      const vehicle = assignment.vehicleId;
      const appointment = assignment.appointmentId;
      
      // Calculate estimated duration from service type (default to 60 minutes)
      const estimatedDuration = 60; // TODO: Get from Service model if needed
      
      return {
        id: assignment._id,
        serviceType: assignment.serviceType,
        serviceDescription: assignment.serviceDescription,
        vehicle: vehicle ? {
          make: vehicle.make || 'Unknown',
          model: vehicle.model || 'Unknown',
          licensePlate: vehicle.licensePlate || vehicle.vehicleNumber || 'N/A',
          year: vehicle.year
        } : null,
        appointment: appointment,
        status: assignment.status,
        startTime: assignment.timerStartTime,
        timerStarted: assignment.timerStarted,
        timerDuration: assignment.timerDuration || 0,
        estimatedDuration: estimatedDuration,
        progressPercentage: assignment.progressPercentage || 0,
        dateScheduled: assignment.dateScheduled,
        timeScheduled: assignment.timeScheduled,
        createdAt: assignment.createdAt
      };
    });

    console.log('✅ Sending formatted assignments:', formattedAssignments.length);

    res.json({
      success: true,
      data: formattedAssignments
    });
  } catch (error) {
    console.error('❌ Error fetching employee assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

/**
 * Employee: Get assigned appointments (upcoming appointments)
 */
exports.getEmployeeAppointments = async (req, res) => {
  try {
    const employeeId = req.user._id;
    
    console.log('🔍 Fetching appointments for employee:', employeeId);
    
    // Find all appointments assigned to this employee
    const appointments = await Appointment.find({
      assignedEmployee: employeeId,
      status: { $in: ['confirmed', 'in_progress', 'pending'] }
    })
    .populate('vehicleId')
    .populate('customerId', 'firstName lastName phoneNumber')
    .sort({ appointmentDate: 1 })
    .limit(10);

    console.log('📋 Found appointments:', appointments.length);

    // Format the appointments
    const formattedAppointments = appointments.map(appointment => {
      const vehicle = appointment.vehicleId;
      const customer = appointment.customerId;
      
      return {
        id: appointment._id,
        serviceType: appointment.serviceType,
        serviceDescription: appointment.serviceDescription,
        vehicle: vehicle ? {
          make: vehicle.make || 'Unknown',
          model: vehicle.model || 'Unknown',
          licensePlate: vehicle.licensePlate || vehicle.vehicleNumber || 'N/A',
          year: vehicle.year
        } : null,
        customer: customer ? {
          name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
          phoneNumber: customer.phoneNumber
        } : null,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime || appointment.timeWindow,
        status: appointment.status,
        progress: appointment.progress || 0,
        currentStage: appointment.currentStage,
        estimatedDuration: appointment.estimatedDuration,
        estimatedCost: appointment.estimatedCost,
        createdAt: appointment.createdAt
      };
    });

    console.log('✅ Sending formatted appointments:', formattedAppointments.length);

    res.json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('❌ Error fetching employee appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// ========================
// CUSTOMER ANALYTICS
// ========================

/**
 * Customer: Get my service records with progress
 */
exports.getCustomerServiceRecords = async (req, res) => {
  try {
    const customerId = req.user._id;
    
    console.log('🔍 Fetching service records for customer:', customerId);
    
    // Find all service records for this customer
    const serviceRecords = await ServiceRecord.find({
      customerId: customerId,
      status: { $in: ['received', 'in-progress', 'quality-check', 'completed'] }
    })
    .populate('assignedEmployee', 'name employeeId position')
    .populate('vehicleId', 'make model year licensePlate vehicleNumber')
    .sort({ createdAt: -1 })
    .limit(10);

    console.log('📋 Found service records:', serviceRecords.length);

    // Format the service records
    const formattedRecords = serviceRecords.map(record => {
      const vehicle = record.vehicleId;
      const employee = record.assignedEmployee;
      
      // Calculate elapsed time if timer is running
      let elapsedTime = record.timerDuration || 0;
      if (record.timerStarted && record.timerStartTime) {
        elapsedTime += (Date.now() - new Date(record.timerStartTime).getTime());
      }
      
      // Calculate progress based on time
      const estimatedMs = 90 * 60 * 1000; // Default 90 minutes
      const timeBasedProgress = Math.min((elapsedTime / estimatedMs) * 100, 100);
      
      // Use manual progress or time-based progress
      const progress = record.progressPercentage || timeBasedProgress;
      
      // Calculate ETA
      let eta = null;
      if (record.timerStarted && progress > 0 && progress < 100) {
        const remainingProgress = 100 - progress;
        const progressRate = progress / elapsedTime; // progress per ms
        const remainingTime = remainingProgress / progressRate;
        eta = Math.round(remainingTime / (60 * 1000)); // in minutes
      }
      
      return {
        id: record._id,
        serviceType: record.serviceType,
        serviceDescription: record.serviceDescription,
        status: record.status,
        progress: Math.round(progress),
        vehicle: vehicle ? {
          make: vehicle.make || 'Unknown',
          model: vehicle.model || 'Unknown',
          licensePlate: vehicle.licensePlate || vehicle.vehicleNumber || 'N/A',
          year: vehicle.year
        } : null,
        employee: employee ? {
          name: employee.name,
          position: employee.position || 'Technician'
        } : null,
        dateScheduled: record.dateScheduled,
        timeScheduled: record.timeScheduled,
        estimatedCost: record.estimatedCost,
        actualCost: record.actualCost,
        timerStarted: record.timerStarted,
        startedAt: record.startedAt,
        estimatedCompletionTime: record.estimatedCompletionTime,
        eta: eta,
        liveUpdates: record.liveUpdates || [],
        createdAt: record.createdAt
      };
    });

    console.log('✅ Sending formatted service records:', formattedRecords.length);

    res.json({
      success: true,
      data: formattedRecords
    });
  } catch (error) {
    console.error('❌ Error fetching customer service records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service records',
      error: error.message
    });
  }
};

/**
 * Customer: Get upcoming appointments
 */
exports.getCustomerUpcomingAppointments = async (req, res) => {
  try {
    const customerId = req.user._id;
    
    console.log('🔍 Fetching upcoming appointments for customer:', customerId);
    
    // Find appointments that have an assigned employee but haven't been converted to service records yet
    // Also include confirmed appointments
    const appointments = await Appointment.find({
      customerId: customerId,
      status: { $in: ['confirmed', 'in_progress', 'pending'] },
      appointmentDate: { $gte: new Date() } // Only future or today's appointments
    })
    .populate('assignedEmployee', 'name employeeId position')
    .populate('vehicleId', 'make model year licensePlate vehicleNumber')
    .sort({ appointmentDate: 1 })
    .limit(5);

    console.log('📋 Found appointments:', appointments.length);

    // Format the appointments
    const formattedAppointments = appointments.map(appointment => {
      const employee = appointment.assignedEmployee;
      const vehicle = appointment.vehicleId;
      
      return {
        id: appointment._id,
        serviceType: appointment.serviceType,
        serviceDescription: appointment.serviceDescription,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime || appointment.timeWindow,
        status: appointment.status,
        vehicle: vehicle ? {
          make: vehicle.make || 'Unknown',
          model: vehicle.model || 'Unknown',
          licensePlate: vehicle.licensePlate || vehicle.vehicleNumber || 'N/A',
          year: vehicle.year
        } : null,
        employee: employee ? {
          name: employee.name,
          position: employee.position || 'Technician'
        } : null,
        estimatedDuration: appointment.estimatedDuration,
        estimatedCost: appointment.estimatedCost,
        timeWindow: appointment.timeWindow,
        createdAt: appointment.createdAt
      };
    });

    console.log('✅ Sending formatted appointments:', formattedAppointments.length);

    res.json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('❌ Error fetching customer appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

/**
 * Customer: Get recent activities (appointments and service records)
 */
exports.getCustomerRecentActivities = async (req, res) => {
  try {
    const customerId = req.user._id;
    
    console.log('🔍 Fetching recent activities for customer:', customerId);
    
    const activities = [];

    // 1. Get recent service record updates
    const serviceRecords = await ServiceRecord.find({
      customerId: customerId
    })
    .populate('assignedEmployee', 'name')
    .sort({ updatedAt: -1 })
    .limit(10);

    // Process service records
    serviceRecords.forEach(record => {
      // Service Started
      if (record.status === 'in-progress' && record.startedAt) {
        activities.push({
          action: 'Service Started',
          detail: record.serviceType + (record.serviceDescription ? ` - ${record.serviceDescription}` : ''),
          time: record.startedAt,
          type: 'service',
          status: record.status
        });
      }
      
      // Service Completed
      if (record.status === 'completed' && record.completedAt) {
        activities.push({
          action: 'Service Completed',
          detail: record.serviceType,
          time: record.completedAt,
          type: 'service',
          status: record.status
        });
      }

      // Payment Processed
      if (record.paymentStatus === 'paid' && record.actualCost) {
        activities.push({
          action: 'Payment Processed',
          detail: `$${record.actualCost.toFixed(2)} for ${record.serviceType}`,
          time: record.completedAt || record.updatedAt,
          type: 'payment',
          status: 'completed'
        });
      }
    });

    // 2. Get recent appointments
    const appointments = await Appointment.find({
      customerId: customerId,
      status: { $in: ['confirmed', 'in_progress', 'completed', 'cancelled'] }
    })
    .sort({ updatedAt: -1 })
    .limit(10);

    // Process appointments
    appointments.forEach(appointment => {
      if (appointment.status === 'confirmed') {
        activities.push({
          action: 'Appointment Confirmed',
          detail: appointment.serviceType + (appointment.serviceDescription ? ` - ${appointment.serviceDescription}` : ''),
          time: appointment.updatedAt,
          type: 'appointment',
          status: appointment.status
        });
      }
      
      if (appointment.status === 'cancelled') {
        activities.push({
          action: 'Appointment Cancelled',
          detail: appointment.serviceType,
          time: appointment.updatedAt,
          type: 'appointment',
          status: appointment.status
        });
      }
    });

    // Sort all activities by time (most recent first) and limit to 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10)
      .map(activity => {
        // Calculate relative time
        const now = new Date();
        const activityTime = new Date(activity.time);
        const diffMs = now - activityTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo;
        if (diffDays > 0) {
          timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
          timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMins > 0) {
          timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        } else {
          timeAgo = 'Just now';
        }

        return {
          action: activity.action,
          detail: activity.detail,
          timeAgo,
          timestamp: activity.time,
          type: activity.type,
          status: activity.status
        };
      });

    console.log('✅ Sending activities:', sortedActivities.length);

    res.json({
      success: true,
      data: sortedActivities
    });
  } catch (error) {
    console.error('❌ Error fetching customer activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

// ========================
// ADMIN ANALYTICS
// ========================

/**
 * Admin: Get revenue over time period
 */
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let groupFormat;
    switch (period) {
      case 'daily':
        groupFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupFormat = '%Y-W%V';
        break;
      case 'monthly':
        groupFormat = '%Y-%m';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    const revenue = await ServiceRecord.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$completedAt' }
          },
          totalRevenue: { $sum: '$actualCost' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const labels = revenue.map(r => r._id);
    const data = revenue.map(r => r.totalRevenue);
    const counts = revenue.map(r => r.count);

    res.json({
      success: true,
      data: {
        labels,
        data,
        counts,
        totalRevenue: data.reduce((a, b) => a + b, 0),
        totalServices: counts.reduce((a, b) => a + b, 0)
      }
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue analytics',
      error: error.message
    });
  }
};

/**
 * Admin: Get services completed per time period
 */
exports.getServicesCompletedAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let groupFormat;
    switch (period) {
      case 'daily':
        groupFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupFormat = '%Y-W%V';
        break;
      case 'monthly':
        groupFormat = '%Y-%m';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    const services = await ServiceRecord.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const labels = services.map(s => s._id);
    const data = services.map(s => s.count);

    res.json({
      success: true,
      data: {
        labels,
        data,
        totalServices: data.reduce((a, b) => a + b, 0)
      }
    });

  } catch (error) {
    console.error('Get services completed analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services completed analytics',
      error: error.message
    });
  }
};

/**
 * Admin: Get dashboard summary stats
 */
exports.getAdminDashboardStats = async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true });

    // Total revenue (sum of actualCost from completed services)
    const revenueResult = await ServiceRecord.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$actualCost' }
        }
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Active services (in-progress)
    const activeServices = await ServiceRecord.countDocuments({ status: 'in-progress' });

    // Total services
    const totalServices = await ServiceRecord.countDocuments();

    // Pending services
    const pendingServices = await ServiceRecord.countDocuments({ status: 'pending' });

    // Completed services
    const completedServices = await ServiceRecord.countDocuments({ status: 'completed' });

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });

    // Recent services (last 5)
    const recentServices = await ServiceRecord.find()
      .populate('assignedEmployee', 'name')
      .populate('vehicleId', 'make model licensePlate')
      .populate('customerId', 'firstName lastName')
      .limit(5)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeServices,
        totalServices,
        pendingServices,
        completedServices,
        totalEmployees,
        recentServices
      }
    });

  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
};

/**
 * Admin: Get employee performance stats
 */
exports.getEmployeePerformanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { status: 'completed' };
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      matchQuery.completedAt = { $gte: start, $lte: end };
    }

    const performance = await ServiceRecord.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$assignedEmployee',
          completedServices: { $sum: 1 },
          totalRevenue: { $sum: '$actualCost' },
          avgServiceTime: { $avg: '$timerDuration' }
        }
      },
      { $sort: { completedServices: -1 } },
      { $limit: 10 }
    ]);

    // Populate employee details
    const employeeIds = performance.map(p => p._id);
    const employees = await User.find({ _id: { $in: employeeIds } })
      .select('name employeeId');

    const enrichedData = performance.map(p => {
      const employee = employees.find(e => e._id.toString() === p._id.toString());
      return {
        employeeId: employee?.employeeId,
        employeeName: employee?.name,
        completedServices: p.completedServices,
        totalRevenue: Math.round(p.totalRevenue * 100) / 100,
        avgServiceTime: Math.round(p.avgServiceTime || 0)
      };
    });

    res.json({
      success: true,
      data: enrichedData
    });

  } catch (error) {
    console.error('Get employee performance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee performance stats',
      error: error.message
    });
  }
};

/**
 * Admin: Get monthly analytics for charts (revenue and services)
 */
exports.getAdminMonthlyAnalytics = async (req, res) => {
  try {
    // Get last 6 months of data
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Get revenue and service count per month
    const monthlyData = await ServiceRecord.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: sixMonthsAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          revenue: { $sum: '$actualCost' },
          services: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = [];

    // Generate array for last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const monthData = monthlyData.find(d => d._id.year === year && d._id.month === month);
      
      chartData.push({
        month: monthNames[month - 1],
        revenue: monthData ? Math.round(monthData.revenue) : 0,
        services: monthData ? monthData.services : 0
      });
    }

    res.json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error('Get admin monthly analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly analytics',
      error: error.message
    });
  }
};

// ========================
// CUSTOMER DASHBOARD
// ========================

/**
 * Customer: Get dashboard stats
 */
exports.getCustomerDashboardStats = async (req, res) => {
  try {
    const customerId = req.user._id;

    // Total services
    const totalServices = await ServiceRecord.countDocuments({ customerId });

    // Active services
    const activeServices = await ServiceRecord.countDocuments({ 
      customerId, 
      status: { $in: ['pending', 'in-progress'] } 
    });

    // Completed services
    const completedServices = await ServiceRecord.countDocuments({ 
      customerId, 
      status: 'completed' 
    });

    // Total spent
    const spentResult = await ServiceRecord.aggregate([
      {
        $match: { customerId, status: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$actualCost' }
        }
      }
    ]);
    const totalSpent = spentResult.length > 0 ? spentResult[0].totalSpent : 0;

    // Recent services
    const recentServices = await ServiceRecord.find({ customerId })
      .populate('assignedEmployee', 'name')
      .populate('vehicleId', 'make model licensePlate')
      .limit(5)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        totalServices,
        activeServices,
        completedServices,
        totalSpent: Math.round(totalSpent * 100) / 100,
        recentServices
      }
    });

  } catch (error) {
    console.error('Get customer dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
};

// ========================
// LEGACY DASHBOARD METHODS (KEEP FOR COMPATIBILITY)
// ========================

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
