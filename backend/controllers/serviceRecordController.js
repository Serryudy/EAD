const ServiceRecord = require('../models/ServiceRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const notificationService = require('../services/notificationService');

// ========================
// ADMIN ENDPOINTS
// ========================

/**
 * Admin: Transfer appointment to service record
 */
exports.transferAppointmentToService = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { assignedEmployeeId, estimatedCompletionTime } = req.body;

    // Get the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('vehicleId')
      .populate('customerId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if service record already exists
    const existingRecord = await ServiceRecord.findOne({ appointmentId });
    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Service record already exists for this appointment'
      });
    }

    // Verify assigned employee exists
    const employee = await User.findOne({ 
      _id: assignedEmployeeId, 
      role: 'employee',
      isActive: true 
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or inactive'
      });
    }

    // Create service record
    const serviceRecord = new ServiceRecord({
      appointmentId: appointment._id,
      vehicleId: appointment.vehicleId,
      customerId: appointment.customerId,
      assignedEmployee: assignedEmployeeId,
      serviceType: appointment.serviceType,
      serviceDescription: appointment.serviceDescription,
      dateScheduled: appointment.preferredDate,
      timeScheduled: appointment.timeWindow || appointment.scheduledTime || 'Not specified',
      estimatedCompletionTime: estimatedCompletionTime || new Date(Date.now() + 2 * 60 * 60 * 1000),
      estimatedCost: appointment.estimatedCost || 0,
      status: 'pending'
    });

    await serviceRecord.save();

    // Update appointment
    appointment.status = 'confirmed';
    appointment.assignedEmployee = assignedEmployeeId;
    await appointment.save();

    const populatedRecord = await ServiceRecord.findById(serviceRecord._id)
      .populate('assignedEmployee', 'name employeeId')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName phoneNumber');

    res.status(201).json({
      success: true,
      message: 'Appointment transferred to service successfully',
      data: populatedRecord
    });

  } catch (error) {
    console.error('Transfer appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transfer appointment',
      error: error.message
    });
  }
};

/**
 * Admin: Update service status and assigned employee
 */
exports.updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedEmployeeId } = req.body;

    const serviceRecord = await ServiceRecord.findById(id);

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Update status if provided
    if (status) {
      serviceRecord.status = status;
      
      // Add live update
      serviceRecord.addLiveUpdate(
        `Service status changed to ${status}`,
        req.user._id
      );
    }

    // Update assigned employee if provided
    if (assignedEmployeeId) {
      const employee = await User.findOne({ 
        _id: assignedEmployeeId, 
        role: 'employee',
        isActive: true 
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found or inactive'
        });
      }

      serviceRecord.assignedEmployee = assignedEmployeeId;
      serviceRecord.addLiveUpdate(
        `Service reassigned to ${employee.name}`,
        req.user._id
      );
    }

    await serviceRecord.save();

    const populated = await ServiceRecord.findById(id)
      .populate('assignedEmployee', 'name employeeId')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName phoneNumber');

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: populated
    });

  } catch (error) {
    console.error('Update service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

/**
 * Admin: Get all service records
 */
exports.getAllServiceRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const serviceRecords = await ServiceRecord.find(query)
      .populate('assignedEmployee', 'name employeeId')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await ServiceRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        serviceRecords,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get all service records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service records',
      error: error.message
    });
  }
};

// ========================
// EMPLOYEE ENDPOINTS
// ========================

/**
 * Employee: Get assigned services
 */
exports.getMyAssignedServices = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { assignedEmployee: employeeId };
    if (status) query.status = status;

    const services = await ServiceRecord.find(query)
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dateScheduled: -1 });

    const total = await ServiceRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get assigned services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assigned services',
      error: error.message
    });
  }
};

/**
 * Employee: Start timer (requires status = 'in-progress')
 */
exports.startServiceTimer = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user._id;

    const serviceRecord = await ServiceRecord.findById(id);

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Check if employee is assigned to this service
    if (serviceRecord.assignedEmployee.toString() !== employeeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this service'
      });
    }

    // Check if status is in-progress
    if (serviceRecord.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Service must be in-progress status to start timer'
      });
    }

    // Check if timer already started
    if (serviceRecord.timerStarted) {
      return res.status(400).json({
        success: false,
        message: 'Timer is already running'
      });
    }

    // Start timer
    serviceRecord.startTimer();
    serviceRecord.addLiveUpdate('Service work started', employeeId);
    
    await serviceRecord.save();

    // Populate customer data for notification
    const populated = await ServiceRecord.findById(id)
      .populate('customerId', 'firstName lastName email phoneNumber');

    // Send service started notification
    try {
      await notificationService.notifyServiceStarted(populated, populated.customerId._id);
      console.log('✉️ Service started notification sent');
    } catch (notifError) {
      console.error('Failed to send service started notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Timer started successfully',
      data: {
        timerStarted: serviceRecord.timerStarted,
        timerStartTime: serviceRecord.timerStartTime,
        startedAt: serviceRecord.startedAt
      }
    });

  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start timer',
      error: error.message
    });
  }
};

/**
 * Employee: Stop timer
 */
exports.stopServiceTimer = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user._id;

    const serviceRecord = await ServiceRecord.findById(id);

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Check if employee is assigned
    if (serviceRecord.assignedEmployee.toString() !== employeeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this service'
      });
    }

    // Check if timer is running
    if (!serviceRecord.timerStarted) {
      return res.status(400).json({
        success: false,
        message: 'Timer is not running'
      });
    }

    // Stop timer
    serviceRecord.stopTimer();
    serviceRecord.addLiveUpdate('Service work paused', employeeId);
    
    await serviceRecord.save();

    res.json({
      success: true,
      message: 'Timer stopped successfully',
      data: {
        timerStarted: serviceRecord.timerStarted,
        timerDuration: serviceRecord.timerDuration,
        totalTime: serviceRecord.getCurrentTimerValue()
      }
    });

  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to stop timer',
      error: error.message
    });
  }
};

/**
 * Employee: Update progress
 */
exports.updateServiceProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progressPercentage, liveUpdate } = req.body;
    const employeeId = req.user._id;

    const serviceRecord = await ServiceRecord.findById(id);

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Check if employee is assigned
    if (serviceRecord.assignedEmployee.toString() !== employeeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this service'
      });
    }

    // Update progress percentage
    if (progressPercentage !== undefined) {
      if (progressPercentage < 0 || progressPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'Progress percentage must be between 0 and 100'
        });
      }
      serviceRecord.progressPercentage = progressPercentage;
    }

    // Add live update message
    if (liveUpdate) {
      serviceRecord.addLiveUpdate(liveUpdate, employeeId);
    }

    await serviceRecord.save();

    const populated = await ServiceRecord.findById(id)
      .populate('assignedEmployee', 'name employeeId')
      .populate('liveUpdates.updatedBy', 'name');

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: populated
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

/**
 * Employee: Complete service
 */
exports.completeService = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualCost, notes, laborCost } = req.body;
    const employeeId = req.user._id;

    const serviceRecord = await ServiceRecord.findById(id);

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Check if employee is assigned
    if (serviceRecord.assignedEmployee.toString() !== employeeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this service'
      });
    }

    // Stop timer if running
    if (serviceRecord.timerStarted) {
      serviceRecord.stopTimer();
    }

    // Update service record
    serviceRecord.status = 'completed';
    serviceRecord.completedAt = new Date();
    serviceRecord.progressPercentage = 100;
    
    if (actualCost !== undefined) serviceRecord.actualCost = actualCost;
    if (notes) serviceRecord.notes = notes;
    if (laborCost !== undefined) serviceRecord.laborCost = laborCost;

    serviceRecord.addLiveUpdate('Service completed', employeeId);

    await serviceRecord.save();

    // Update appointment status
    await Appointment.findByIdAndUpdate(serviceRecord.appointmentId, {
      status: 'completed',
      completedAt: new Date()
    });

    const populated = await ServiceRecord.findById(id)
      .populate('assignedEmployee', 'name employeeId')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName phoneNumber email');

    // Send service completion notification
    try {
      await notificationService.notifyServiceCompleted(populated, populated.customerId._id);
      await notificationService.notifyVehicleReady(populated, populated.customerId._id);
      console.log('✉️ Service completion and vehicle ready notifications sent');
    } catch (notifError) {
      console.error('Failed to send service notifications:', notifError);
    }

    res.json({
      success: true,
      message: 'Service completed successfully',
      data: populated
    });

  } catch (error) {
    console.error('Complete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete service',
      error: error.message
    });
  }
};

// ========================
// CUSTOMER ENDPOINTS
// ========================

/**
 * Customer: View own service progress
 */
exports.getMyServices = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { customerId };
    if (status) query.status = status;

    const services = await ServiceRecord.find(query)
      .populate('assignedEmployee', 'name employeeId')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('liveUpdates.updatedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dateScheduled: -1 });

    const total = await ServiceRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get customer services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
      error: error.message
    });
  }
};

/**
 * Get service record by ID (any role)
 */
exports.getServiceRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceRecord = await ServiceRecord.findById(id)
      .populate('assignedEmployee', 'name employeeId')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName phoneNumber email')
      .populate('liveUpdates.updatedBy', 'name');

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Check authorization
    const user = req.user;
    if (user.role === 'customer' && serviceRecord.customerId._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (user.role === 'employee' && serviceRecord.assignedEmployee._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate current timer value if timer is running
    const currentTimerValue = serviceRecord.getCurrentTimerValue();

    res.json({
      success: true,
      data: {
        ...serviceRecord.toObject(),
        currentTimerValue
      }
    });

  } catch (error) {
    console.error('Get service record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service record',
      error: error.message
    });
  }
};

module.exports = exports;
