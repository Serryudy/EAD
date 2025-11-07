/**
 * Business Hours Configuration
 * 
 * This file defines the operating hours, capacity, and booking rules
 * for the appointment system. Modify these values to adjust business
 * operations without changing code.
 */

module.exports = {
  // Operating days (0 = Sunday, 6 = Saturday)
  operatingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
  
  // Operating hours (24-hour format)
  operatingHours: {
    start: '09:00',
    end: '18:00',
  },
  
  // Lunch break (appointments won't be scheduled during this time)
  lunchBreak: {
    enabled: true,
    start: '12:00',
    end: '13:00'
  },
  
  // Time slot configuration
  slotDuration: 30, // minutes per time slot
  
  // Capacity settings
  maxConcurrentAppointments: 3, // Maximum appointments per time slot
  
  // Booking window
  advanceBookingDays: 30, // Can book up to 30 days in advance
  minimumNoticeHours: 2, // Must book at least 2 hours in advance
  
  // Blocked dates (holidays, closures)
  // Format: 'YYYY-MM-DD'
  blockedDates: [
    '2025-12-25', // Christmas Day
    '2025-12-26', // Boxing Day
    '2026-01-01', // New Year's Day
    // Add more blocked dates as needed
  ],
  
  // Cancellation and modification rules
  cancellation: {
    freeUntilHours: 48, // Free cancellation up to 48 hours before
    feePercentage: 50, // 50% fee if cancelled within 48 hours
  },
  
  modification: {
    allowedUntilHours: 24, // Can modify up to 24 hours before
    maxModifications: 2, // Maximum 2 modifications per appointment
  },
  
  // Service duration multiplier for multiple vehicles
  multiVehicleStrategy: 'sequential', // 'sequential' or 'parallel'
  
  // Buffer time between appointments (in minutes)
  bufferTime: 0, // No buffer by default, can add 15-30 min if needed
};
