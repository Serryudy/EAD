/**
 * Slot Calculator Utility
 * 
 * Generates and validates time slots for appointment booking
 * based on business hours and availability
 */

const businessHours = require('../config/businessHours');

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Add minutes to a time string
 */
function addMinutesToTime(timeStr, minutesToAdd) {
  const totalMinutes = timeToMinutes(timeStr) + minutesToAdd;
  return minutesToTime(totalMinutes);
}

/**
 * Check if a date is a working day
 */
function isWorkingDay(date) {
  const dayOfWeek = new Date(date).getDay();
  return businessHours.operatingDays.includes(dayOfWeek);
}

/**
 * Check if a date is blocked (holiday/closure)
 */
function isBlockedDate(date) {
  const dateStr = new Date(date).toISOString().split('T')[0];
  return businessHours.blockedDates.includes(dateStr);
}

/**
 * Check if a time slot overlaps with lunch break
 */
function isLunchBreak(startTime, duration) {
  if (!businessHours.lunchBreak.enabled) {
    return false;
  }
  
  const slotStart = timeToMinutes(startTime);
  const slotEnd = slotStart + duration;
  const lunchStart = timeToMinutes(businessHours.lunchBreak.start);
  const lunchEnd = timeToMinutes(businessHours.lunchBreak.end);
  
  // Check if slot overlaps with lunch break
  return (slotStart < lunchEnd && slotEnd > lunchStart);
}

/**
 * Check if appointment fits before closing time
 */
function fitsBeforeClosing(startTime, duration) {
  const slotStart = timeToMinutes(startTime);
  const slotEnd = slotStart + duration;
  const closingTime = timeToMinutes(businessHours.operatingHours.end);
  
  return slotEnd <= closingTime;
}

/**
 * Generate all possible time slots for a given date
 * 
 * @param {Date} date - The date to generate slots for
 * @param {Number} serviceDuration - Duration of service in minutes
 * @returns {Array} Array of slot objects
 */
function generateTimeSlots(date, serviceDuration = 60) {
  const slots = [];
  
  // Check if date is a working day
  if (!isWorkingDay(date)) {
    return slots;
  }
  
  // Check if date is blocked
  if (isBlockedDate(date)) {
    return slots;
  }
  
  const startMinutes = timeToMinutes(businessHours.operatingHours.start);
  const endMinutes = timeToMinutes(businessHours.operatingHours.end);
  
  // Generate slots
  for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += businessHours.slotDuration) {
    const slotTime = minutesToTime(currentMinutes);
    const endTime = addMinutesToTime(slotTime, serviceDuration);
    
    // Skip if overlaps with lunch break
    if (isLunchBreak(slotTime, serviceDuration)) {
      continue;
    }
    
    // Skip if doesn't fit before closing
    if (!fitsBeforeClosing(slotTime, serviceDuration)) {
      continue;
    }
    
    slots.push({
      startTime: slotTime,
      endTime: endTime,
      duration: serviceDuration,
      isAvailable: true, // Will be updated based on existing appointments
      capacityRemaining: businessHours.maxConcurrentAppointments,
      appointmentCount: 0
    });
  }
  
  return slots;
}

/**
 * Format time for display (12-hour format)
 */
function formatTimeDisplay(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Check if a specific date-time is in the past
 */
function isPastDateTime(date, timeStr) {
  const now = new Date();
  const appointmentDateTime = new Date(date);
  const [hours, minutes] = timeStr.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  return appointmentDateTime < now;
}

/**
 * Check if date is too far in the future
 */
function isBeyondBookingWindow(date) {
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + businessHours.advanceBookingDays);
  
  return new Date(date) > maxDate;
}

/**
 * Check if appointment meets minimum notice requirement
 */
function meetsMinimumNotice(date, timeStr) {
  const now = new Date();
  const appointmentDateTime = new Date(date);
  const [hours, minutes] = timeStr.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  const minimumDateTime = new Date(now.getTime() + businessHours.minimumNoticeHours * 60 * 60 * 1000);
  
  return appointmentDateTime >= minimumDateTime;
}

/**
 * Calculate total service duration for multiple vehicles
 */
function calculateMultiVehicleDuration(serviceDuration, vehicleCount) {
  if (vehicleCount <= 1) {
    return serviceDuration;
  }
  
  if (businessHours.multiVehicleStrategy === 'sequential') {
    // Sequential: duration multiplied by vehicle count
    return serviceDuration * vehicleCount;
  } else {
    // Parallel: same duration (assuming multiple technicians)
    return serviceDuration;
  }
}

/**
 * Get start and end of day timestamps
 */
function getStartOfDay(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfDay(date) {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  addMinutesToTime,
  isWorkingDay,
  isBlockedDate,
  isLunchBreak,
  fitsBeforeClosing,
  generateTimeSlots,
  formatTimeDisplay,
  isPastDateTime,
  isBeyondBookingWindow,
  meetsMinimumNotice,
  calculateMultiVehicleDuration,
  getStartOfDay,
  getEndOfDay
};
