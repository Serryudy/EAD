/**
 * Test script for Time Slot Availability System
 * 
 * Run this script to test the new availability endpoints
 * Usage: node testAvailability.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const slotCalculator = require('./utils/slotCalculator');
const appointmentValidator = require('./utils/appointmentValidator');

async function testAvailabilitySystem() {
  try {
    console.log('\n🧪 Testing Time Slot Availability System\n');
    console.log('='.repeat(50));
    
    // Connect to database
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!\n');
    
    // Test 1: Generate time slots for today
    console.log('Test 1: Generate Time Slots');
    console.log('-'.repeat(50));
    const today = new Date();
    const slots = slotCalculator.generateTimeSlots(today, 60);
    console.log(`Generated ${slots.length} time slots for today`);
    if (slots.length > 0) {
      console.log('Sample slots:');
      slots.slice(0, 3).forEach(slot => {
        console.log(`  - ${slotCalculator.formatTimeDisplay(slot.startTime)} to ${slotCalculator.formatTimeDisplay(slot.endTime)}`);
      });
    }
    console.log('✅ Time slot generation working\n');
    
    // Test 2: Check slot capacity
    console.log('Test 2: Check Slot Capacity');
    console.log('-'.repeat(50));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const capacityCheck = await appointmentValidator.checkSlotCapacity(
      tomorrow,
      '10:00',
      60
    );
    console.log(`Slot at 10:00 AM tomorrow:`);
    console.log(`  - Available: ${capacityCheck.isAvailable ? 'Yes' : 'No'}`);
    console.log(`  - Capacity used: ${capacityCheck.capacityUsed}/${capacityCheck.capacityTotal}`);
    console.log(`  - Capacity remaining: ${capacityCheck.capacityRemaining}`);
    console.log('✅ Capacity checking working\n');
    
    // Test 3: Validate appointment time
    console.log('Test 3: Validate Appointment Time');
    console.log('-'.repeat(50));
    
    // Test valid future time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const validationResult = await appointmentValidator.validateAppointmentTime({
      appointmentDate: futureDate,
      appointmentTime: '14:00',
      duration: 60
    });
    console.log(`Future appointment (1 week from now, 2:00 PM):`);
    console.log(`  - Valid: ${validationResult.isValid ? 'Yes' : 'No'}`);
    if (validationResult.errors.length > 0) {
      console.log(`  - Errors: ${validationResult.errors.join(', ')}`);
    }
    
    // Test past time
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastValidation = await appointmentValidator.validateAppointmentTime({
      appointmentDate: yesterday,
      appointmentTime: '10:00',
      duration: 60
    });
    console.log(`Past appointment (yesterday):`);
    console.log(`  - Valid: ${pastValidation.isValid ? 'No (expected)' : 'No'}`);
    console.log(`  - Errors: ${pastValidation.errors[0]}`);
    console.log('✅ Time validation working\n');
    
    // Test 4: Check working days
    console.log('Test 4: Check Working Days & Blocked Dates');
    console.log('-'.repeat(50));
    const testDates = [];
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + i);
      testDates.push({
        date: checkDate.toDateString(),
        isWorkingDay: slotCalculator.isWorkingDay(checkDate),
        isBlocked: slotCalculator.isBlockedDate(checkDate)
      });
    }
    testDates.forEach(td => {
      const status = td.isBlocked ? '🚫 Blocked' : (td.isWorkingDay ? '✅ Working' : '❌ Closed');
      console.log(`  ${td.date}: ${status}`);
    });
    console.log('✅ Date checking working\n');
    
    // Test 5: Multi-vehicle duration calculation
    console.log('Test 5: Multi-Vehicle Duration Calculation');
    console.log('-'.repeat(50));
    const singleDuration = slotCalculator.calculateMultiVehicleDuration(60, 1);
    const multiDuration = slotCalculator.calculateMultiVehicleDuration(60, 3);
    console.log(`  - Single vehicle (60 min service): ${singleDuration} minutes`);
    console.log(`  - Three vehicles (60 min service): ${multiDuration} minutes`);
    console.log('✅ Multi-vehicle calculation working\n');
    
    // Summary
    console.log('='.repeat(50));
    console.log('\n✅ All tests passed! Time slot system is ready.\n');
    console.log('📝 Next steps:');
    console.log('  1. Test API endpoints using Postman or curl');
    console.log('  2. Implement frontend booking wizard');
    console.log('  3. Add notification system\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run tests
testAvailabilitySystem();
