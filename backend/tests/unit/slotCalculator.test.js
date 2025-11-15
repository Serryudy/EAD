const slotCalculator = require('../../utils/slotCalculator');

// Mock dependencies with correct configuration matching actual businessHours.js
jest.mock('../../config/businessHours', () => ({
  operatingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday (matches actual config)
  operatingHours: { start: '08:00', end: '20:00' },
  slotDuration: 30, // minutes
  advanceBookingDays: 30,
  minimumNoticeHours: 2,
  blockedDates: [],
  maxConcurrentAppointments: 3,
  multiVehicleStrategy: 'sequential',
  lunchBreak: { enabled: true, start: '12:00', end: '13:00' }
}));

describe('SlotCalculator Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isWorkingDay', () => {
    it('should return true for weekdays and Saturday (Monday-Saturday)', () => {
      const monday = new Date('2025-12-15'); // Monday
      const tuesday = new Date('2025-12-16'); // Tuesday
      const friday = new Date('2025-12-19'); // Friday
      const saturday = new Date('2025-12-20'); // Saturday
      
      expect(slotCalculator.isWorkingDay(monday)).toBe(true);
      expect(slotCalculator.isWorkingDay(tuesday)).toBe(true);
      expect(slotCalculator.isWorkingDay(friday)).toBe(true);
      expect(slotCalculator.isWorkingDay(saturday)).toBe(true);
    });

    it('should return false for Sundays', () => {
      const sunday = new Date('2025-12-21'); // Sunday
      
      expect(slotCalculator.isWorkingDay(sunday)).toBe(false);
    });
  });

  describe('isPastDateTime', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(slotCalculator.isPastDateTime(pastDate, '09:00')).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date('2030-01-01');
      expect(slotCalculator.isPastDateTime(futureDate, '09:00')).toBe(false);
    });

    it('should handle time comparison for today', () => {
      const today = new Date();
      const pastTime = '06:00';
      const futureTime = '23:59';
      
      expect(typeof slotCalculator.isPastDateTime(today, pastTime)).toBe('boolean');
      expect(typeof slotCalculator.isPastDateTime(today, futureTime)).toBe('boolean');
    });
  });

  describe('isBeyondBookingWindow', () => {
    it('should return false for dates within booking window', () => {
      const nearFutureDate = new Date();
      nearFutureDate.setDate(nearFutureDate.getDate() + 7); // 7 days ahead
      
      expect(slotCalculator.isBeyondBookingWindow(nearFutureDate)).toBe(false);
    });

    it('should return true for dates beyond booking window', () => {
      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 35); // 35 days ahead (beyond 30-day limit)
      
      expect(slotCalculator.isBeyondBookingWindow(farFutureDate)).toBe(true);
    });
  });

  describe('generateTimeSlots', () => {
    it('should generate time slots for a working day', () => {
      const testDate = new Date('2025-12-15'); // Monday
      const duration = 60; // 1 hour
      
      const slots = slotCalculator.generateTimeSlots(testDate, duration);
      
      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);
      
      // Check slot structure
      if (slots.length > 0) {
        expect(slots[0]).toHaveProperty('startTime');
        expect(slots[0]).toHaveProperty('endTime');
        expect(typeof slots[0].startTime).toBe('string');
        expect(typeof slots[0].endTime).toBe('string');
      }
    });

    it('should return empty array for non-working days', () => {
      const sunday = new Date('2025-12-21'); // Sunday
      const duration = 60;
      
      const slots = slotCalculator.generateTimeSlots(sunday, duration);
      
      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBe(0);
    });

    it('should adjust slots based on duration', () => {
      const testDate = new Date('2025-12-15'); // Monday
      const shortDuration = 30; // 30 minutes
      const longDuration = 120; // 2 hours
      
      const shortSlots = slotCalculator.generateTimeSlots(testDate, shortDuration);
      const longSlots = slotCalculator.generateTimeSlots(testDate, longDuration);
      
      // More short slots should be available than long slots
      expect(shortSlots.length).toBeGreaterThanOrEqual(longSlots.length);
    });
  });

  describe('formatTimeDisplay', () => {
    it('should format 24-hour time to 12-hour display', () => {
      expect(slotCalculator.formatTimeDisplay('09:00')).toBe('9:00 AM');
      expect(slotCalculator.formatTimeDisplay('13:30')).toBe('1:30 PM');
      expect(slotCalculator.formatTimeDisplay('00:00')).toBe('12:00 AM');
      expect(slotCalculator.formatTimeDisplay('12:00')).toBe('12:00 PM');
    });

    it('should handle edge cases', () => {
      expect(slotCalculator.formatTimeDisplay('12:30')).toBe('12:30 PM');
      expect(slotCalculator.formatTimeDisplay('00:30')).toBe('12:30 AM');
    });
  });

  describe('calculateMultiVehicleDuration', () => {
    it('should calculate duration for single vehicle', () => {
      const baseDuration = 60; // 1 hour
      const vehicleCount = 1;
      
      const result = slotCalculator.calculateMultiVehicleDuration(baseDuration, vehicleCount);
      
      expect(result).toBe(baseDuration);
    });

    it('should calculate duration for multiple vehicles with sequential strategy', () => {
      const baseDuration = 60; // 1 hour
      const vehicleCount = 3;
      
      const result = slotCalculator.calculateMultiVehicleDuration(baseDuration, vehicleCount);
      
      // With sequential strategy, duration should be multiplied by vehicle count
      expect(result).toBe(baseDuration * vehicleCount);
    });

    it('should handle edge cases', () => {
      // For 0 vehicles, should still return some positive duration
      expect(slotCalculator.calculateMultiVehicleDuration(60, 0)).toBeGreaterThanOrEqual(0);
      
      // For 0 duration, should still work
      const result = slotCalculator.calculateMultiVehicleDuration(0, 2);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('meetsMinimumNotice', () => {
    it('should return true for appointments with sufficient notice', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      const time = '09:00';
      
      expect(slotCalculator.meetsMinimumNotice(futureDate, time)).toBe(true);
    });

    it('should return false for appointments with insufficient notice', () => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // For current time, it should not meet minimum notice (2 hours required)
      expect(slotCalculator.meetsMinimumNotice(now, time)).toBe(false);
    });
  });

  describe('isBlockedDate', () => {
    it('should return false for non-blocked dates', () => {
      const normalDate = new Date('2025-12-15');
      expect(slotCalculator.isBlockedDate(normalDate)).toBe(false);
    });

    it('should handle blocked dates if configured', () => {
      const testDate = new Date('2025-12-25'); // Christmas (might be in blocked dates)
      
      // This would depend on the actual implementation and configuration
      expect(typeof slotCalculator.isBlockedDate(testDate)).toBe('boolean');
    });
  });

  describe('timeToMinutes and minutesToTime', () => {
    it('should convert time to minutes correctly', () => {
      expect(slotCalculator.timeToMinutes('09:30')).toBe(570); // 9*60 + 30 = 570
      expect(slotCalculator.timeToMinutes('12:00')).toBe(720); // 12*60 = 720
      expect(slotCalculator.timeToMinutes('00:15')).toBe(15);   // 0*60 + 15 = 15
    });

    it('should convert minutes to time correctly', () => {
      expect(slotCalculator.minutesToTime(570)).toBe('09:30');
      expect(slotCalculator.minutesToTime(720)).toBe('12:00');
      expect(slotCalculator.minutesToTime(15)).toBe('00:15');
    });
  });

  describe('addMinutesToTime', () => {
    it('should add minutes to time correctly', () => {
      expect(slotCalculator.addMinutesToTime('09:00', 30)).toBe('09:30');
      expect(slotCalculator.addMinutesToTime('09:45', 30)).toBe('10:15');
      expect(slotCalculator.addMinutesToTime('23:30', 45)).toBe('00:15'); // Next day
    });
  });

  describe('getStartOfDay and getEndOfDay', () => {
    it('should get start of day correctly', () => {
      const testDate = new Date('2025-12-15T14:30:00');
      const startOfDay = slotCalculator.getStartOfDay(testDate);
      
      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);
      expect(startOfDay.getSeconds()).toBe(0);
      expect(startOfDay.getMilliseconds()).toBe(0);
    });

    it('should get end of day correctly', () => {
      const testDate = new Date('2025-12-15T14:30:00');
      const endOfDay = slotCalculator.getEndOfDay(testDate);
      
      expect(endOfDay.getHours()).toBe(23);
      expect(endOfDay.getMinutes()).toBe(59);
      expect(endOfDay.getSeconds()).toBe(59);
      expect(endOfDay.getMilliseconds()).toBe(999);
    });
  });

  describe('Business hour validation functions', () => {
    it('should validate lunch break correctly', () => {
      // During lunch break (12:00-13:00)
      expect(slotCalculator.isLunchBreak('12:30', 30)).toBe(true);
      
      // Outside lunch break
      expect(slotCalculator.isLunchBreak('11:30', 30)).toBe(false);
      expect(slotCalculator.isLunchBreak('14:00', 30)).toBe(false);
    });

    it('should check if appointment fits before closing', () => {
      // Should fit (ends at 18:00, closing at 20:00)
      expect(slotCalculator.fitsBeforeClosing('17:00', 60)).toBe(true);
      
      // Should not fit (ends at 21:00, closing at 20:00)
      expect(slotCalculator.fitsBeforeClosing('19:30', 90)).toBe(false);
    });
  });
});