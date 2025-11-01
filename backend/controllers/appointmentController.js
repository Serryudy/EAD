const Appointment = require('../models/Appointment');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      vehicleNumber,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      serviceType,
      serviceDescription,
      preferredDate,
      timeWindow,
      additionalNotes,
      estimatedDuration,
      estimatedCost,
      paymentData
    } = req.body;

    // Get customer ID from authenticated user or request
    const customerId = req.user?.id || req.body.customerId;

    // Check if vehicle exists, if not create it
    let vehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    
    if (!vehicle && customerId) {
      vehicle = new Vehicle({
        ownerId: customerId,
        ownerName: customerName,
        vehicleNumber: vehicleNumber.toUpperCase(),
        make: vehicleMake || 'Unknown',
        model: vehicleModel || vehicleType,
        year: vehicleYear || new Date().getFullYear(),
        type: 'Sedan' // Default, can be updated later
      });
      await vehicle.save();
    }

    const appointment = new Appointment({
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      vehicleId: vehicle?._id,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      serviceType,
      serviceDescription,
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
    });

    await appointment.save();

    // Update vehicle's service history if vehicle exists
    if (vehicle) {
      vehicle.serviceHistory.push(appointment._id);
      await vehicle.save();
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
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

    // Apply filters
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (employeeId) query.assignedEmployee = employeeId;
    
    if (startDate || endDate) {
      query.preferredDate = {};
      if (startDate) query.preferredDate.$gte = new Date(startDate);
      if (endDate) query.preferredDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const appointments = await Appointment.find(query)
      .populate('customerId', 'name email phone')
      .populate('assignedEmployee', 'name email')
      .populate('vehicleId')
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
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('assignedEmployee', 'name email')
      .populate('vehicleId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

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

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    
    if (status === 'cancelled' && cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

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
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
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

    const appointment = await Appointment.findById(id);

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

    const query = { assignedEmployee: employeeId };
    
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.preferredDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'name email phone')
      .populate('vehicleId')
      .sort({ preferredDate: 1 });

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
