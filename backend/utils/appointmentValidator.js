/**
 * Appointment Validator
 * 
 * Validates appointment booking requests to ensure:
 * - Time slots are available
 * - No conflicts with existing appointments
 * - Business rules are followed
 * - Vehicle ownership is verified
 */

const Appointment = require('../models/Appointment');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const businessHours = require('../config/businessHours');
const slotCalculator = require('./slotCalculator');

/**
 * Validate appointment date and time
 */
async function validateAppointmentTime(appointmentData) {
  const errors = [];
  const { appointmentDate, appointmentTime, duration } = appointmentData;
  
  // 1. Check if date is in the past
  if (slotCalculator.isPastDateTime(appointmentDate, appointmentTime)) {
    errors.push('Cannot book appointments in the past');
  }
  
  // 2. Check if date is within booking window
  if (slotCalculator.isBeyondBookingWindow(appointmentDate)) {
    errors.push(`Cannot book more than ${businessHours.advanceBookingDays} days in advance`);
  }
  
  // 3. Check minimum notice requirement
  if (!slotCalculator.meetsMinimumNotice(appointmentDate, appointmentTime)) {
    errors.push(`Appointments must be booked at least ${businessHours.minimumNoticeHours} hours in advance`);
  }
  
  // 4. Check if date is a working day
  if (!slotCalculator.isWorkingDay(appointmentDate)) {
    errors.push('Selected date is not a working day');
  }
  
  // 5. Check if date is blocked
  if (slotCalculator.isBlockedDate(appointmentDate)) {
    errors.push('Selected date is not available (holiday or closure)');
  }
  
  // 6. Check if time is during business hours
  if (slotCalculator.isLunchBreak(appointmentTime, duration)) {
    errors.push('Selected time overlaps with lunch break');
  }
  
  // 7. Check if service fits before closing
  if (!slotCalculator.fitsBeforeClosing(appointmentTime, duration)) {
    errors.push('Service duration extends beyond business hours');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if time slot has available capacity
 */
async function checkSlotCapacity(appointmentDate, appointmentTime, duration) {
  try {
    const startOfDay = slotCalculator.getStartOfDay(appointmentDate);
    const endOfDay = slotCalculator.getEndOfDay(appointmentDate);
    
    // Calculate end time of the appointment
    const endTime = slotCalculator.addMinutesToTime(appointmentTime, duration);
    
    // Find all appointments on this date that might overlap
    const overlappingAppointments = await Appointment.find({
      $or: [
        { preferredDate: { $gte: startOfDay, $lte: endOfDay } },
        { scheduledDate: { $gte: startOfDay, $lte: endOfDay } }
      ],
      status: { $nin: ['cancelled', 'completed'] }
    });
    
    // Count appointments that overlap with requested time
    let conflictCount = 0;
    
    for (const apt of overlappingAppointments) {
      const aptTime = apt.scheduledTime || apt.timeWindow || '09:00';
      const aptDuration = parseInt(apt.estimatedDuration) || 60;
      const aptEndTime = slotCalculator.addMinutesToTime(aptTime, aptDuration);
      
      // Check for time overlap
      const requestStart = slotCalculator.timeToMinutes(appointmentTime);
      const requestEnd = slotCalculator.timeToMinutes(endTime);
      const aptStart = slotCalculator.timeToMinutes(aptTime);
      const aptEnd = slotCalculator.timeToMinutes(aptEndTime);
      
      // Overlaps if:
      // - Request starts during existing appointment
      // - Request ends during existing appointment  
      // - Request completely contains existing appointment
      if ((requestStart < aptEnd && requestEnd > aptStart)) {
        conflictCount++;
      }
    }
    
    const capacityRemaining = businessHours.maxConcurrentAppointments - conflictCount;
    
    return {
      isAvailable: capacityRemaining > 0,
      capacityUsed: conflictCount,
      capacityTotal: businessHours.maxConcurrentAppointments,
      capacityRemaining: Math.max(0, capacityRemaining)
    };
  } catch (error) {
    console.error('Error checking slot capacity:', error);
    throw error;
  }
}

/**
 * Check if vehicle is already booked at the requested time
 */
async function checkVehicleAvailability(vehicleIds, appointmentDate, appointmentTime, duration) {
  try {
    if (!vehicleIds || vehicleIds.length === 0) {
      return { isAvailable: true, conflicts: [] };
    }
    
    const startOfDay = slotCalculator.getStartOfDay(appointmentDate);
    const endOfDay = slotCalculator.getEndOfDay(appointmentDate);
    const endTime = slotCalculator.addMinutesToTime(appointmentTime, duration);
    
    // Find existing appointments for these vehicles on this date
    const existingAppointments = await Appointment.find({
      vehicleId: { $in: vehicleIds },
      $or: [
        { preferredDate: { $gte: startOfDay, $lte: endOfDay } },
        { scheduledDate: { $gte: startOfDay, $lte: endOfDay } }
      ],
      status: { $nin: ['cancelled', 'completed'] }
    }).populate('vehicleId');
    
    const conflicts = [];
    
    for (const apt of existingAppointments) {
      const aptTime = apt.scheduledTime || apt.timeWindow || '09:00';
      const aptDuration = parseInt(apt.estimatedDuration) || 60;
      const aptEndTime = slotCalculator.addMinutesToTime(aptTime, aptDuration);
      
      // Check for time overlap
      const requestStart = slotCalculator.timeToMinutes(appointmentTime);
      const requestEnd = slotCalculator.timeToMinutes(endTime);
      const aptStart = slotCalculator.timeToMinutes(aptTime);
      const aptEnd = slotCalculator.timeToMinutes(aptEndTime);
      
      if ((requestStart < aptEnd && requestEnd > aptStart)) {
        conflicts.push({
          vehicleId: apt.vehicleId._id,
          existingTime: aptTime,
          existingService: apt.serviceType
        });
      }
    }
    
    return {
      isAvailable: conflicts.length === 0,
      conflicts
    };
  } catch (error) {
    console.error('Error checking vehicle availability:', error);
    throw error;
  }
}

/**
 * Verify vehicle ownership
 */
async function verifyVehicleOwnership(vehicleIds, customerId) {
  try {
    if (!vehicleIds || vehicleIds.length === 0) {
      return { isValid: false, errors: ['No vehicles selected'] };
    }
    
    const vehicles = await Vehicle.find({
      _id: { $in: vehicleIds },
      ownerId: customerId,
      isActive: true
    });
    
    if (vehicles.length !== vehicleIds.length) {
      return {
        isValid: false,
        errors: ['One or more vehicles not found or do not belong to you']
      };
    }
    
    return {
      isValid: true,
      vehicles
    };
  } catch (error) {
    console.error('Error verifying vehicle ownership:', error);
    throw error;
  }
}

/**
 * Verify service exists and is active
 */
async function verifyServices(serviceIds) {
  try {
    if (!serviceIds || serviceIds.length === 0) {
      return { isValid: false, errors: ['No services selected'] };
    }
    
    const services = await Service.find({
      _id: { $in: serviceIds },
      isActive: true
    });
    
    if (services.length !== serviceIds.length) {
      return {
        isValid: false,
        errors: ['One or more services not found or inactive']
      };
    }
    
    return {
      isValid: true,
      services
    };
  } catch (error) {
    console.error('Error verifying services:', error);
    throw error;
  }
}

/**
 * Comprehensive appointment validation
 */
async function validateBooking(bookingData) {
  const errors = [];
  const warnings = [];
  
  try {
    // 1. Validate time
    const timeValidation = await validateAppointmentTime(bookingData);
    if (!timeValidation.isValid) {
      errors.push(...timeValidation.errors);
    }
    
    // 2. Check slot capacity (only if time is valid)
    if (timeValidation.isValid) {
      const capacityCheck = await checkSlotCapacity(
        bookingData.appointmentDate,
        bookingData.appointmentTime,
        bookingData.duration
      );
      
      if (!capacityCheck.isAvailable) {
        errors.push('Selected time slot is fully booked');
      } else if (capacityCheck.capacityRemaining === 1) {
        warnings.push('Only 1 slot remaining at this time');
      }
    }
    
    // 3. Check vehicle availability
    if (bookingData.vehicleIds && bookingData.vehicleIds.length > 0) {
      const vehicleCheck = await checkVehicleAvailability(
        bookingData.vehicleIds,
        bookingData.appointmentDate,
        bookingData.appointmentTime,
        bookingData.duration
      );
      
      if (!vehicleCheck.isAvailable) {
        errors.push('One or more vehicles already have an appointment at this time');
      }
    }
    
    // 4. Verify vehicle ownership
    if (bookingData.customerId && bookingData.vehicleIds) {
      const ownershipCheck = await verifyVehicleOwnership(
        bookingData.vehicleIds,
        bookingData.customerId
      );
      
      if (!ownershipCheck.isValid) {
        errors.push(...ownershipCheck.errors);
      }
    }
    
    // 5. Verify services
    if (bookingData.serviceIds) {
      const serviceCheck = await verifyServices(bookingData.serviceIds);
      
      if (!serviceCheck.isValid) {
        errors.push(...serviceCheck.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
    
  } catch (error) {
    console.error('Error in comprehensive validation:', error);
    return {
      isValid: false,
      errors: ['Validation error occurred'],
      warnings: []
    };
  }
}

module.exports = {
  validateAppointmentTime,
  checkSlotCapacity,
  checkVehicleAvailability,
  verifyVehicleOwnership,
  verifyServices,
  validateBooking
};
