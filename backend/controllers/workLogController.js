const mongoose = require('mongoose');
const WorkLog = require('../models/WorkLog');
const Appointment = require('../models/Appointment');

// Create a new work log entry
exports.createWorkLog = async (req, res) => {
  try {
    const {
      appointmentId,
      task,
      description,
      startTime,
      estimatedDuration,
      notes,
      partsUsed,
      laborCost
    } = req.body;

    // Get technician info from authenticated user
    const technicianId = req.user?.id || req.body.technicianId;
    const technicianName = req.user?.name || req.body.technicianName;

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const workLog = new WorkLog({
      appointmentId,
      technicianId,
      technicianName,
      task,
      description,
      startTime: startTime || new Date(),
      estimatedDuration,
      notes,
      partsUsed,
      laborCost
    });

    await workLog.save();

    // Update appointment status to in-service if it's not already
    if (appointment.status === 'confirmed' || appointment.status === 'pending') {
      appointment.status = 'in-service';
      await appointment.save();
    }

    res.status(201).json({
      success: true,
      message: 'Work log created successfully',
      data: workLog
    });
  } catch (error) {
    console.error('Error creating work log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create work log',
      error: error.message
    });
  }
};

// Get all work logs with filters
exports.getAllWorkLogs = async (req, res) => {
  try {
    const {
      appointmentId,
      technicianId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const query = { isActive: true };

    if (appointmentId) query.appointmentId = appointmentId;
    if (technicianId) query.technicianId = technicianId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const workLogs = await WorkLog.find(query)
      .populate('appointmentId', 'vehicleNumber serviceType customerName')
      .populate('technicianId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WorkLog.countDocuments(query);

    res.json({
      success: true,
      data: workLogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching work logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work logs',
      error: error.message
    });
  }
};

// Get work log by ID
exports.getWorkLogById = async (req, res) => {
  try {
    const workLog = await WorkLog.findById(req.params.id)
      .populate('appointmentId')
      .populate('technicianId', 'name email');

    if (!workLog) {
      return res.status(404).json({
        success: false,
        message: 'Work log not found'
      });
    }

    res.json({
      success: true,
      data: workLog
    });
  } catch (error) {
    console.error('Error fetching work log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work log',
      error: error.message
    });
  }
};

// Get work logs for an appointment
exports.getWorkLogsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const workLogs = await WorkLog.find({ 
      appointmentId, 
      isActive: true 
    })
      .populate('technicianId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: workLogs
    });
  } catch (error) {
    console.error('Error fetching work logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work logs',
      error: error.message
    });
  }
};

// Update work log
exports.updateWorkLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating certain fields
    delete updateData.appointmentId;
    delete updateData.technicianId;
    delete updateData.createdAt;

    const workLog = await WorkLog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!workLog) {
      return res.status(404).json({
        success: false,
        message: 'Work log not found'
      });
    }

    res.json({
      success: true,
      message: 'Work log updated successfully',
      data: workLog
    });
  } catch (error) {
    console.error('Error updating work log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update work log',
      error: error.message
    });
  }
};

// Complete work log (set end time and calculate duration)
exports.completeWorkLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { endTime, notes } = req.body;

    const workLog = await WorkLog.findById(id);

    if (!workLog) {
      return res.status(404).json({
        success: false,
        message: 'Work log not found'
      });
    }

    workLog.endTime = endTime || new Date();
    workLog.status = 'completed';
    if (notes) workLog.notes = notes;

    await workLog.save();

    res.json({
      success: true,
      message: 'Work log completed successfully',
      data: workLog
    });
  } catch (error) {
    console.error('Error completing work log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete work log',
      error: error.message
    });
  }
};

// Delete work log (soft delete)
exports.deleteWorkLog = async (req, res) => {
  try {
    const { id } = req.params;

    const workLog = await WorkLog.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!workLog) {
      return res.status(404).json({
        success: false,
        message: 'Work log not found'
      });
    }

    res.json({
      success: true,
      message: 'Work log deleted successfully',
      data: workLog
    });
  } catch (error) {
    console.error('Error deleting work log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete work log',
      error: error.message
    });
  }
};

// Get work logs summary for a technician
exports.getTechnicianWorkSummary = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate technicianId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid technician ID format'
      });
    }

    const matchQuery = { 
      technicianId: mongoose.Types.ObjectId(technicianId),
      isActive: true 
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    console.log('🔍 Fetching work summary for technician:', technicianId);

    const summary = await WorkLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalLaborCost: { $sum: '$laborCost' }
        }
      }
    ]);

    const totalLogs = await WorkLog.countDocuments(matchQuery);

    console.log('Work summary result:', { totalLogs, summary });

    res.json({
      success: true,
      data: {
        totalLogs,
        summary
      }
    });
  } catch (error) {
    console.error('Error fetching technician work summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work summary',
      error: error.message
    });
  }
};
