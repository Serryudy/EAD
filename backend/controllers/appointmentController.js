const Appointment = require('../models/Appointment');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

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
      preferredDate,
      timeWindow,
      additionalNotes,
      estimatedDuration,
      estimatedCost,
      paymentData
    } = req.body;

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
    await appointment.populate('customerId', 'name email mobile');
    await appointment.populate('vehicleId');
    await appointment.populate('assignedEmployee', 'name employeeId');

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
      .populate('customerId', 'name email phone mobile')
      .populate('assignedEmployee', 'name email employeeId')
      .populate('vehicleId', 'vehicleNumber type make model year')
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
    // Use authenticated user from req.user
    const user = req.user;
    
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId', 'name email phone mobile')
      .populate('assignedEmployee', 'name email employeeId')
      .populate('vehicleId', 'vehicleNumber type make model year');

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
      .populate('vehicleId', 'vehicleNumber type make model year')
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
