const Appointment = require('../models/Appointment');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Helper function to parse time window and calculate time range
const parseTimeWindow = (timeWindow, preferredDate) => {
  if (!timeWindow) return null;

  try {
    // Parse time window like "09:00 AM - 11:00 AM"
    const [startStr, endStr] = timeWindow.split('-').map(t => t.trim());
    
    const parseTime = (timeStr, baseDate) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const date = new Date(baseDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const startTime = parseTime(startStr, preferredDate);
    const endTime = parseTime(endStr, preferredDate);

    return { startTime, endTime };
  } catch (error) {
    console.error('Error parsing time window:', error);
    return null;
  }
};

// Helper function to check if two time ranges overlap
const timeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// Helper function to find available employee
const findAvailableEmployee = async (preferredDate, timeWindow) => {
  try {
    // Parse the time window
    const timeRange = parseTimeWindow(timeWindow, preferredDate);
    if (!timeRange) {
      console.log('Could not parse time window, skipping auto-assignment');
      return null;
    }

    const { startTime, endTime } = timeRange;

    // Find all employees (users with role 'employee')
    const employees = await User.find({ role: 'employee', isActive: true });

    if (employees.length === 0) {
      console.log('No employees found in the system');
      return null;
    }

    // Check each employee's availability
    for (const employee of employees) {
      // Get all appointments assigned to this employee on the same date
      const employeeAppointments = await Appointment.find({
        assignedEmployee: employee._id,
        preferredDate: {
          $gte: new Date(new Date(preferredDate).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(preferredDate).setHours(23, 59, 59, 999))
        },
        status: { $nin: ['cancelled', 'completed'] } // Exclude cancelled and completed
      });

      // Check if employee is free during the requested time window
      let isFree = true;

      for (const apt of employeeAppointments) {
        if (apt.timeWindow) {
          const aptTimeRange = parseTimeWindow(apt.timeWindow, apt.preferredDate);
          
          if (aptTimeRange) {
            // Check for overlap
            if (timeRangesOverlap(
              startTime,
              endTime,
              aptTimeRange.startTime,
              aptTimeRange.endTime
            )) {
              isFree = false;
              break;
            }
          }
        } else if (apt.scheduledTime) {
          // If only scheduledTime exists, assume 2-hour duration
          const aptStart = new Date(apt.preferredDate);
          const [hours, minutes] = apt.scheduledTime.split(':').map(Number);
          aptStart.setHours(hours, minutes, 0, 0);
          const aptEnd = new Date(aptStart.getTime() + 2 * 60 * 60 * 1000); // +2 hours

          if (timeRangesOverlap(startTime, endTime, aptStart, aptEnd)) {
            isFree = false;
            break;
          }
        }
      }

      if (isFree) {
        console.log(`Found available employee: ${employee.name} (${employee.employeeId})`);
        return employee;
      }
    }

    console.log('No available employees found for the requested time slot');
    return null;
  } catch (error) {
    console.error('Error finding available employee:', error);
    return null;
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      vehicleId,
      serviceType,
      serviceDescription,
      // Old required fields
      appointmentDate,
      appointmentTime,
      duration,
      // New fields
      preferredDate,
      timeWindow,
      additionalNotes,
      estimatedDuration,
      estimatedCost,
      paymentData
    } = req.body;

    // serviceType can now be any service name from the Service collection
    const mappedServiceType = serviceType; // No mapping needed anymore

    // Get authenticated user - NOW REQUIRED
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login to create an appointment.'
      });
    }

    // Only customers can create appointments for themselves
    // Employees would need separate logic if they create appointments for customers
    if (user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can create appointments.'
      });
    }

    // Validate required fields
    if (!vehicleId || !serviceType || !preferredDate || !timeWindow) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: vehicleId, serviceType, preferredDate, timeWindow'
      });
    }

    console.log(`📝 Creating appointment with serviceType: ${serviceType} → ${mappedServiceType}`);

    // Verify vehicle exists and belongs to the user
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.ownerId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create appointments for your own vehicles'
      });
    }

    // Prepare appointment data - only store references
    const appointmentData = {
      customerId: user._id,
      vehicleId: vehicle._id,
      serviceType: mappedServiceType, // Use mapped enum value
      serviceDescription,
      // Old required fields
      appointmentDate: appointmentDate || preferredDate,
      appointmentTime: appointmentTime || '09:00',
      duration: duration || 180,
      // New fields
      preferredDate,
      timeWindow,
      additionalNotes,
      estimatedDuration: estimatedDuration || '~ 2 hours',
      estimatedCost: estimatedCost || 0,
      paymentData: paymentData ? {
        cardHolderName: paymentData.cardHolderName,
        cardNumber: paymentData.cardNumber ? `****${paymentData.cardNumber.slice(-4)}` : undefined,
        paymentDate: new Date()
      } : undefined,
      paymentStatus: paymentData ? 'deposit-paid' : 'pending'
    };

    const appointment = new Appointment(appointmentData);

    // Auto-assign available employee if time window is provided
    if (preferredDate && timeWindow) {
      console.log('🔍 Searching for available employee...');
      const availableEmployee = await findAvailableEmployee(preferredDate, timeWindow);
      
      if (availableEmployee) {
        appointment.assignedEmployee = availableEmployee._id;
        appointment.employeeName = availableEmployee.name;
        appointment.status = 'confirmed'; // Auto-confirm if employee is assigned
        console.log(`✅ Auto-assigned to ${availableEmployee.name} (${availableEmployee.employeeId})`);
      } else {
        console.log('⚠️ No available employee found, appointment remains pending');
      }
    }

    await appointment.save();

    // Update vehicle's service history
    vehicle.serviceHistory.push(appointment._id);
    await vehicle.save();

    // Populate customer and vehicle data for response
    await appointment.populate('customerId', 'firstName lastName email phone phoneNumber');
    await appointment.populate('vehicleId');
    await appointment.populate('assignedEmployee', 'firstName lastName employeeId');
    await appointment.populate('serviceIds', 'name price estimatedTime description');

    // Get customer ID for notifications
    const customerId = appointment.customerId._id || appointment.customerId;

    // Send notification to customer
    try {
      console.log('🔍 DEBUG: About to create notification for customer:', customerId);
      console.log('🔍 DEBUG: Appointment details:', {
        id: appointment._id,
        number: appointment.appointmentNumber,
        date: appointment.scheduledDate
      });
      await notificationService.notifyAppointmentCreated(appointment, customerId);
      console.log('✅ DEBUG: Notification created successfully');
      console.log('✉️ Appointment notification sent to customer');
    } catch (notifError) {
      console.error('❌ Failed to send appointment notification:', notifError);
      // Don't fail the request if notification fails
    }

    // Send notification to admin about new appointment
    try {
      await notificationService.notifyAdminNewAppointment(appointment);
      console.log('✉️ Admin notification sent about new appointment');
    } catch (notifError) {
      console.error('Failed to send admin notification:', notifError);
    }

    // If employee was auto-assigned, notify them
    if (appointment.assignedEmployee) {
      try {
        await notificationService.notifyEmployeeAssigned(appointment, appointment.assignedEmployee._id);
        console.log('✉️ Employee notification sent about assignment');
      } catch (notifError) {
        console.error('Failed to send employee notification:', notifError);
      }
    }

    // Prepare success message
    let message = 'Appointment created successfully';
    if (appointment.assignedEmployee) {
      message += ` and assigned to ${appointment.employeeName}`;
    } else {
      message += '. We will assign an employee and confirm your appointment soon.';
    }

    res.status(201).json({
      success: true,
      message,
      data: appointment,
      autoAssigned: !!appointment.assignedEmployee,
      assignedTo: appointment.assignedEmployee ? {
        id: appointment.assignedEmployee._id,
        name: appointment.employeeName
      } : null
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// Get all appointments with filters
exports.getAllAppointments = async (req, res) => {
  try {
    // Use authenticated user from req.user
    const user = req.user;
    
    const {
      status,
      startDate,
      endDate,
      customerId,
      employeeId,
      page = 1,
      limit = 10,
      sortBy = 'preferredDate',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    // Filter based on user role
    if (user.role === 'customer') {
      // Customers can only see their own appointments (by customerId)
      query.customerId = user._id;
    } else if (user.role === 'employee') {
      // Employees can see all appointments (including guest appointments)
      // Allow filtering by specific customer or employee if provided
      if (customerId) query.customerId = customerId;
      if (employeeId) query.assignedEmployee = employeeId;
      // Note: This will show all appointments including those without customerId (guest bookings)
    }

    // Apply other filters
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.preferredDate = {};
      if (startDate) query.preferredDate.$gte = new Date(startDate);
      if (endDate) query.preferredDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const appointments = await Appointment.find(query)
      .populate('customerId', 'firstName lastName email phone phoneNumber')
      .populate('assignedEmployee', 'firstName lastName email employeeId')
      .populate('vehicleId', 'vehicleNumber type make model year')
      .populate('serviceIds', 'name price estimatedTime description')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  console.log('🔍 getAppointmentById called with params:', req.params);
  try {
    // Use authenticated user from req.user
    const user = req.user;
    
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId', 'firstName lastName email phone phoneNumber')
      .populate('assignedEmployee', 'firstName lastName email employeeId')
      .populate('vehicleId', 'vehicleNumber type make model year')
      .populate('serviceIds', 'name price estimatedTime description');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization - customers can only view their own appointments
    if (user.role === 'customer') {
      // If appointment has a customerId, check if it matches the logged-in user
      if (appointment.customerId && appointment.customerId._id.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own appointments.'
        });
      }
      // If appointment has no customerId (guest booking), deny access for security
      if (!appointment.customerId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This is a guest appointment.'
        });
      }
    }
    // Employees can view all appointments

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating certain fields directly
    delete updateData.customerId;
    delete updateData.createdAt;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const appointment = await Appointment.findById(id)
      .populate('customerId', 'name email mobile');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    
    if (status === 'cancelled' && cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

    // Send notification based on status change
    try {
      if (status === 'confirmed' && oldStatus !== 'confirmed') {
        await notificationService.notifyAppointmentConfirmed(appointment, appointment.customerId._id);
        console.log('✉️ Appointment confirmation notification sent');
      } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
        await notificationService.notifyAppointmentCancelled(appointment, appointment.customerId._id, 'customer');
        console.log('✉️ Appointment cancellation notification sent');
      }
    } catch (notifError) {
      console.error('Failed to send status notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferredDate, timeWindow, scheduledDate, scheduledTime } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.canBeRescheduled()) {
      return res.status(400).json({
        success: false,
        message: 'This appointment cannot be rescheduled'
      });
    }

    if (preferredDate) appointment.preferredDate = preferredDate;
    if (timeWindow) appointment.timeWindow = timeWindow;
    if (scheduledDate) appointment.scheduledDate = scheduledDate;
    if (scheduledTime) appointment.scheduledTime = scheduledTime;

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment',
      error: error.message
    });
  }
};

// Assign employee to appointment
exports.assignEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        assignedEmployee: employeeId,
        employeeName: employee.name,
        status: 'confirmed'
      },
      { new: true }
    ).populate('customerId', 'name email mobile');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Notify employee about assignment
    try {
      await notificationService.notifyEmployeeAssigned(appointment, employeeId);
      console.log('✉️ Employee notified about appointment assignment');
    } catch (notifError) {
      console.error('Failed to notify employee:', notifError);
    }

    // Notify customer about confirmation
    try {
      await notificationService.notifyAppointmentConfirmed(appointment, appointment.customerId._id);
      console.log('✉️ Customer notified about appointment confirmation');
    } catch (notifError) {
      console.error('Failed to notify customer:', notifError);
    }

    res.json({
      success: true,
      message: 'Employee assigned successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error assigning employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign employee',
      error: error.message
    });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(id)
      .populate('customerId', 'name email mobile');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'This appointment cannot be cancelled'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || 'Not specified';
    await appointment.save();

    // Send cancellation notification
    try {
      await notificationService.notifyAppointmentCancelled(appointment, appointment.customerId._id, 'customer');
      console.log('✉️ Appointment cancellation notification sent');
    } catch (notifError) {
      console.error('Failed to send cancellation notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    const matchQuery = {};
    if (employeeId) matchQuery.assignedEmployee = mongoose.Types.ObjectId(employeeId);
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const stats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Appointment.countDocuments(matchQuery);

    const statusCounts = {
      total,
      pending: 0,
      confirmed: 0,
      'in-service': 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: statusCounts
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment statistics',
      error: error.message
    });
  }
};

// Get employee's appointments
exports.getEmployeeAppointments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, date } = req.query;

    // Validate employeeId is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format'
      });
    }

    const query = { assignedEmployee: employeeId };
    
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.preferredDate = { $gte: startOfDay, $lte: endOfDay };
    }

    console.log('🔍 Fetching appointments for employee:', employeeId);
    console.log('Query:', JSON.stringify(query));

    const appointments = await Appointment.find(query)
      .populate('customerId', 'firstName lastName email phone phoneNumber')
      .populate('vehicleId', 'vehicleNumber type make model year')
      .populate('serviceIds', 'name price estimatedTime description')
      .sort({ preferredDate: 1 });

    console.log('Found appointments:', appointments.length);

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching employee appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee appointments',
      error: error.message
    });
  }
};

// Check employee availability for a time slot
exports.checkEmployeeAvailability = async (req, res) => {
  try {
    const { preferredDate, timeWindow } = req.query;

    if (!preferredDate || !timeWindow) {
      return res.status(400).json({
        success: false,
        message: 'preferredDate and timeWindow are required'
      });
    }

    // Find available employee
    const availableEmployee = await findAvailableEmployee(preferredDate, timeWindow);

    if (availableEmployee) {
      res.json({
        success: true,
        available: true,
        employee: {
          id: availableEmployee._id,
          name: availableEmployee.name,
          employeeId: availableEmployee.employeeId,
          department: availableEmployee.department,
          position: availableEmployee.position
        },
        message: `Employee ${availableEmployee.name} is available for the requested time slot`
      });
    } else {
      // Get all employees and their schedules for this time slot
      const employees = await User.find({ role: 'employee', isActive: true });
      const employeeSchedules = [];

      const timeRange = parseTimeWindow(timeWindow, preferredDate);
      
      for (const employee of employees) {
        const employeeAppointments = await Appointment.find({
          assignedEmployee: employee._id,
          preferredDate: {
            $gte: new Date(new Date(preferredDate).setHours(0, 0, 0, 0)),
            $lte: new Date(new Date(preferredDate).setHours(23, 59, 59, 999))
          },
          status: { $nin: ['cancelled', 'completed'] }
        });

        employeeSchedules.push({
          name: employee.name,
          employeeId: employee.employeeId,
          appointmentCount: employeeAppointments.length,
          appointments: employeeAppointments.map(apt => ({
            timeWindow: apt.timeWindow,
            serviceType: apt.serviceType,
            status: apt.status
          }))
        });
      }

      res.json({
        success: true,
        available: false,
        message: 'No employees available for the requested time slot',
        employeeSchedules,
        suggestion: 'Please try a different time slot or we will contact you to reschedule'
      });
    }
  } catch (error) {
    console.error('Error checking employee availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check employee availability',
      error: error.message
    });
  }
};

// ==========================================
// NEW TIME SLOT BOOKING SYSTEM
// ==========================================

const slotCalculator = require('../utils/slotCalculator');
const appointmentValidator = require('../utils/appointmentValidator');
const Service = require('../models/Service');

/**
 * Get available time slots for a specific date
 * GET /api/appointments/available-slots
 */
exports.getAvailableSlots = async (req, res) => {
  console.log('🎯 getAvailableSlots called with query:', req.query);
  try {
    const { date, serviceIds, vehicleCount = 1 } = req.query;
    
    // Validate required parameters
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    const requestedDate = new Date(date);
    
    // Validate date is valid
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    // Check if date is in the past
    if (slotCalculator.isPastDateTime(requestedDate, '00:00')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }
    
    // Check if date is too far in future
    if (slotCalculator.isBeyondBookingWindow(requestedDate)) {
      return res.status(400).json({
        success: false,
        message: `Cannot book more than ${require('../config/businessHours').advanceBookingDays} days in advance`
      });
    }
    
    // Check if it's a working day
    if (!slotCalculator.isWorkingDay(requestedDate)) {
      return res.status(200).json({
        success: true,
        date: date,
        message: 'Selected date is not a working day',
        slots: []
      });
    }
    
    // Check if date is blocked
    if (slotCalculator.isBlockedDate(requestedDate)) {
      return res.status(200).json({
        success: true,
        date: date,
        message: 'Selected date is not available (holiday/closure)',
        slots: []
      });
    }
    
    // Calculate service duration
    let totalDuration = 60; // default 1 hour
    
    if (serviceIds) {
      const serviceIdArray = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
      const services = await Service.find({ _id: { $in: serviceIdArray }, isActive: true });
      
      if (services.length > 0) {
        console.log('🔧 Services for duration calculation:', services.map(s => ({ 
          name: s.name, 
          estimatedDuration: s.estimatedDuration 
        })));
        
        // Sum up all service durations
        const serviceDuration = services.reduce((sum, service) => {
          return sum + (service.estimatedDuration * 60); // convert hours to minutes
        }, 0);
        
        console.log('⏱️ Total service duration (minutes):', serviceDuration);
        console.log('🚗 Vehicle count:', vehicleCount);
        
        // Apply vehicle count multiplier
        totalDuration = slotCalculator.calculateMultiVehicleDuration(
          serviceDuration,
          parseInt(vehicleCount)
        );
        
        console.log('📊 Final total duration (minutes):', totalDuration);
      }
    }
    
    // Generate all possible slots
    const allSlots = slotCalculator.generateTimeSlots(requestedDate, totalDuration);
    
    // Check availability for each slot
    const slotsWithAvailability = await Promise.all(
      allSlots.map(async (slot) => {
        const capacityCheck = await appointmentValidator.checkSlotCapacity(
          requestedDate,
          slot.startTime,
          totalDuration
        );
        
        return {
          ...slot,
          ...capacityCheck,
          displayTime: slotCalculator.formatTimeDisplay(slot.startTime),
          displayEndTime: slotCalculator.formatTimeDisplay(slot.endTime)
        };
      })
    );
    
    // Filter out past slots if date is today
    const now = new Date();
    const isToday = requestedDate.toDateString() === now.toDateString();
    
    let availableSlots = slotsWithAvailability;
    
    if (isToday) {
      availableSlots = slotsWithAvailability.filter(slot => {
        return slotCalculator.meetsMinimumNotice(requestedDate, slot.startTime);
      });
    }
    
    // Categorize slots
    const fullyAvailable = availableSlots.filter(s => s.isAvailable && s.capacityRemaining > 1);
    const limitedAvailable = availableSlots.filter(s => s.isAvailable && s.capacityRemaining === 1);
    const fullyBooked = availableSlots.filter(s => !s.isAvailable);
    
    res.json({
      success: true,
      date: date,
      totalSlots: availableSlots.length,
      availableCount: fullyAvailable.length + limitedAvailable.length,
      fullyBookedCount: fullyBooked.length,
      slots: availableSlots,
      summary: {
        fullyAvailable: fullyAvailable.length,
        limitedAvailable: limitedAvailable.length,
        fullyBooked: fullyBooked.length
      },
      serviceDuration: totalDuration,
      vehicleCount: parseInt(vehicleCount)
    });
    
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
};

/**
 * Get available dates for the next N days
 * GET /api/appointments/available-dates
 */
exports.getAvailableDates = async (req, res) => {
  try {
    const { days = 14, serviceIds, vehicleCount = 1 } = req.query;
    const businessHours = require('../config/businessHours');
    const maxDays = Math.min(parseInt(days), businessHours.advanceBookingDays);
    
    const availableDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate service duration
    let totalDuration = 60;
    if (serviceIds) {
      const serviceIdArray = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
      const services = await Service.find({ _id: { $in: serviceIdArray }, isActive: true });
      
      if (services.length > 0) {
        const serviceDuration = services.reduce((sum, service) => {
          return sum + (service.estimatedDuration * 60);
        }, 0);
        totalDuration = slotCalculator.calculateMultiVehicleDuration(
          serviceDuration,
          parseInt(vehicleCount)
        );
      }
    }
    
    // Check each date
    for (let i = 0; i < maxDays; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() + i);
      
      // Skip non-working days
      if (!slotCalculator.isWorkingDay(checkDate)) {
        continue;
      }
      
      // Skip blocked dates
      if (slotCalculator.isBlockedDate(checkDate)) {
        continue;
      }
      
      // Generate slots for this date
      const slots = slotCalculator.generateTimeSlots(checkDate, totalDuration);
      
      if (slots.length === 0) {
        continue;
      }
      
      // Check availability for slots
      let availableSlotCount = 0;
      for (const slot of slots) {
        // Skip past slots if checking today
        const isToday = checkDate.toDateString() === new Date().toDateString();
        if (isToday && !slotCalculator.meetsMinimumNotice(checkDate, slot.startTime)) {
          continue;
        }
        
        const capacityCheck = await appointmentValidator.checkSlotCapacity(
          checkDate,
          slot.startTime,
          totalDuration
        );
        
        if (capacityCheck.isAvailable) {
          availableSlotCount++;
        }
      }
      
      if (availableSlotCount > 0) {
        availableDates.push({
          date: checkDate.toISOString().split('T')[0],
          dayOfWeek: checkDate.toLocaleDateString('en-US', { weekday: 'long' }),
          availableSlots: availableSlotCount,
          totalSlots: slots.length,
          availabilityPercentage: Math.round((availableSlotCount / slots.length) * 100)
        });
      }
    }
    
    res.json({
      success: true,
      count: availableDates.length,
      dates: availableDates,
      serviceDuration: totalDuration,
      vehicleCount: parseInt(vehicleCount)
    });
    
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available dates',
      error: error.message
    });
  }
};

/**
 * Check if a specific time slot is available
 * GET /api/appointments/check-availability
 */
exports.checkSlotAvailability = async (req, res) => {
  try {
    const { date, time, duration = 60 } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }
    
    const requestedDate = new Date(date);
    const requestedDuration = parseInt(duration);
    
    // Validate date and time
    const timeValidation = await appointmentValidator.validateAppointmentTime({
      appointmentDate: requestedDate,
      appointmentTime: time,
      duration: requestedDuration
    });
    
    if (!timeValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date/time',
        errors: timeValidation.errors
      });
    }
    
    // Check capacity
    const capacityCheck = await appointmentValidator.checkSlotCapacity(
      requestedDate,
      time,
      requestedDuration
    );
    
    res.json({
      success: true,
      date,
      time,
      duration: requestedDuration,
      ...capacityCheck,
      displayTime: slotCalculator.formatTimeDisplay(time)
    });
    
  } catch (error) {
    console.error('Error checking slot availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
};
