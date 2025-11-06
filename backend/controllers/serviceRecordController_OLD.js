const ServiceRecord = require('../models/ServiceRecord');
const Appointment = require('../models/Appointment');
const WorkLog = require('../models/WorkLog');

// Start service - Mark appointment as in-service and create service record
exports.startService = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { 
      initialInspectionNotes, 
      customerComplaints, 
      estimatedCompletionTime,
      serviceStages 
    } = req.body;

    // Get the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('assignedEmployee')
      .populate('vehicleId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment is in correct status
    if (appointment.status === 'in-service') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already in service'
      });
    }

    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed appointments can be started. Current status: ' + appointment.status
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

    // Create service record
    const serviceRecord = new ServiceRecord({
      appointmentId: appointment._id,
      vehicleId: appointment.vehicleId,
      customerId: appointment.customerId,
      assignedEmployee: appointment.assignedEmployee,
      employeeName: appointment.employeeName,
      serviceType: appointment.serviceType,
      serviceDescription: appointment.serviceDescription,
      checkInTime: new Date(),
      estimatedCompletionTime: estimatedCompletionTime || new Date(Date.now() + 2 * 60 * 60 * 1000), // Default 2 hours
      status: 'checked-in',
      initialInspectionNotes: initialInspectionNotes || '',
      customerComplaints: customerComplaints || []
    });

    // Add default service stages if provided
    if (serviceStages && serviceStages.length > 0) {
      serviceRecord.serviceProgress = serviceStages.map(stage => ({
        stage: stage.name || stage,
        status: 'pending'
      }));
    } else {
      // Default service stages
      serviceRecord.serviceProgress = [
        { stage: 'Vehicle Check-in', status: 'completed', startTime: new Date(), endTime: new Date() },
        { stage: 'Initial Inspection', status: 'in-progress', startTime: new Date() },
        { stage: 'Diagnostics', status: 'pending' },
        { stage: 'Repair/Service', status: 'pending' },
        { stage: 'Quality Check', status: 'pending' },
        { stage: 'Final Inspection', status: 'pending' },
        { stage: 'Customer Notification', status: 'pending' }
      ];
    }

    await serviceRecord.save();

    // Update appointment status
    appointment.status = 'in-service';
    await appointment.save();

    console.log(`🔧 Service started for appointment ${appointmentId}`);
    console.log(`📋 Service Record ID: ${serviceRecord._id}`);

    res.status(201).json({
      success: true,
      message: 'Service started successfully',
      data: {
        serviceRecord,
        appointment
      }
    });
  } catch (error) {
    console.error('Error starting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start service',
      error: error.message
    });
  }
};

// Get service record by appointment ID
exports.getServiceRecordByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const serviceRecord = await ServiceRecord.findOne({ appointmentId })
      .populate('appointmentId')
      .populate('vehicleId')
      .populate('assignedEmployee', 'name employeeId department')
      .populate('workLogs');

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found for this appointment'
      });
    }

    res.json({
      success: true,
      data: serviceRecord
    });
  } catch (error) {
    console.error('Error fetching service record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service record',
      error: error.message
    });
  }
};

// Get service record by ID
exports.getServiceRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceRecord = await ServiceRecord.findById(id)
      .populate('appointmentId')
      .populate('vehicleId', 'vehicleNumber type make model year')
      .populate('customerId', 'name mobile email')
      .populate('assignedEmployee', 'name employeeId department')
      .populate('workLogs');

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    res.json({
      success: true,
      data: serviceRecord
    });
  } catch (error) {
    console.error('Error fetching service record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service record',
      error: error.message
    });
  }
};

// Update service progress
exports.updateServiceProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, status, notes, completedBy } = req.body;

    const serviceRecord = await ServiceRecord.findById(id);

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Update the specific stage
    serviceRecord.updateProgressStage(stage, status, notes);
    
    if (completedBy) {
      const stageObj = serviceRecord.serviceProgress.find(s => s.stage === stage);
      if (stageObj) stageObj.completedBy = completedBy;
    }

    // Update overall status based on progress
    const allCompleted = serviceRecord.serviceProgress.every(s => s.status === 'completed' || s.status === 'skipped');
    if (allCompleted && serviceRecord.status === 'in-progress') {
      serviceRecord.status = 'completed';
      serviceRecord.actualCompletionTime = new Date();
    } else if (serviceRecord.status === 'checked-in') {
      serviceRecord.status = 'in-progress';
    }

    await serviceRecord.save();

    res.json({
      success: true,
      message: 'Service progress updated successfully',
      data: serviceRecord
    });
  } catch (error) {
    console.error('Error updating service progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service progress',
      error: error.message
    });
  }
};

// Add work log to service record
exports.addWorkLog = async (req, res) => {
  try {
    const { id } = req.params;
    const workLogData = req.body;

    const serviceRecord = await ServiceRecord.findById(id);

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Create work log
    const workLog = new WorkLog({
      appointmentId: serviceRecord.appointmentId,
      technicianId: workLogData.technicianId || serviceRecord.assignedEmployee,
      technicianName: workLogData.technicianName || serviceRecord.employeeName,
      task: workLogData.task,
      description: workLogData.description,
      status: workLogData.status || 'in-progress',
      startTime: workLogData.startTime || new Date(),
      estimatedDuration: workLogData.estimatedDuration,
      notes: workLogData.notes,
      partsUsed: workLogData.partsUsed || []
    });

    await workLog.save();

    // Add work log reference to service record
    serviceRecord.addWorkLog(workLog._id);
    
    // Update labor cost if provided
    if (workLogData.laborCost) {
      serviceRecord.totalLaborCost += workLogData.laborCost;
    }

    await serviceRecord.save();

    res.status(201).json({
      success: true,
      message: 'Work log added successfully',
      data: {
        workLog,
        serviceRecord
      }
    });
  } catch (error) {
    console.error('Error adding work log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add work log',
      error: error.message
    });
  }
};

// Complete service
exports.completeService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      finalInspectionNotes,
      workPerformed,
      recommendedServices,
      qualityCheckNotes,
      totalLaborCost,
      partsUsed
    } = req.body;

    const serviceRecord = await ServiceRecord.findById(id);

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    // Update service record
    serviceRecord.status = 'completed';
    serviceRecord.actualCompletionTime = new Date();
    serviceRecord.finalInspectionNotes = finalInspectionNotes || '';
    serviceRecord.workPerformed = workPerformed || [];
    serviceRecord.recommendedServices = recommendedServices || [];
    serviceRecord.qualityCheckPerformed = true;
    serviceRecord.qualityCheckNotes = qualityCheckNotes || '';
    
    if (totalLaborCost) serviceRecord.totalLaborCost = totalLaborCost;
    if (partsUsed) serviceRecord.partsUsed = partsUsed;

    await serviceRecord.save();

    // Update appointment status
    const appointment = await Appointment.findById(serviceRecord.appointmentId);
    if (appointment) {
      appointment.status = 'completed';
      appointment.actualCost = serviceRecord.totalCost;
      await appointment.save();
    }

    console.log(`✅ Service completed for appointment ${serviceRecord.appointmentId}`);

    res.json({
      success: true,
      message: 'Service completed successfully',
      data: {
        serviceRecord,
        appointment
      }
    });
  } catch (error) {
    console.error('Error completing service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete service',
      error: error.message
    });
  }
};

// Get all service records with filters
exports.getAllServiceRecords = async (req, res) => {
  try {
    const {
      status,
      assignedEmployee,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (assignedEmployee) query.assignedEmployee = assignedEmployee;
    
    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) query.checkInTime.$gte = new Date(startDate);
      if (endDate) query.checkInTime.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const serviceRecords = await ServiceRecord.find(query)
      .populate('appointmentId')
      .populate('assignedEmployee', 'name employeeId')
      .populate('vehicleId', 'vehicleNumber type make model year')
      .populate('customerId', 'name mobile email')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ServiceRecord.countDocuments(query);

    res.json({
      success: true,
      data: serviceRecords,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching service records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service records',
      error: error.message
    });
  }
};

