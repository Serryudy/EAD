/**
 * Test Booking Flow - API Endpoint Testing
 * Tests all 3 API endpoints used by the booking wizard
 */

const BASE_URL = 'http://localhost:5000';

// Test credentials (Admin user from seedAdmin.js)
const TEST_USER = {
  username: 'admin',
  password: 'Admin@123'
};

let authToken = '';

async function login() {
  console.log('\n🔐 Step 1: Login...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    const data = await response.json();
    
    if (response.ok && data.token) {
      authToken = data.token;
      console.log('✅ Login successful');
      console.log(`   User: ${data.user.firstName} ${data.user.lastName}`);
      console.log(`   Role: ${data.user.role}`);
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testServicesEndpoint() {
  console.log('\n📋 Step 2: Testing GET /api/services...');
  try {
    const response = await fetch(`${BASE_URL}/api/services`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Services endpoint working`);
      console.log(`   Found ${data.length} services`);
      if (data.length > 0) {
        console.log(`   Sample: "${data[0].name}" - ${data[0].estimatedDuration}h - $${data[0].basePrice}`);
      }
      return data;
    } else {
      console.log('❌ Services endpoint failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Services endpoint error:', error.message);
    return null;
  }
}

async function testVehiclesEndpoint() {
  console.log('\n🚗 Step 3: Testing GET /api/vehicles...');
  try {
    const response = await fetch(`${BASE_URL}/api/vehicles`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Vehicles endpoint working`);
      console.log(`   Found ${data.length} vehicle(s)`);
      if (data.length > 0) {
        console.log(`   Sample: ${data[0].year} ${data[0].make} ${data[0].model} (${data[0].licensePlate})`);
      } else {
        console.log('   ⚠️  No vehicles found - "Add Vehicle" flow will be tested');
      }
      return data;
    } else {
      console.log('❌ Vehicles endpoint failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Vehicles endpoint error:', error.message);
    return null;
  }
}

async function testAvailableDatesEndpoint() {
  console.log('\n📅 Step 4: Testing GET /api/appointments/available-dates...');
  try {
    const duration = 120; // 2 hours in minutes
    const vehicleCount = 1;
    
    const response = await fetch(
      `${BASE_URL}/api/appointments/available-dates?duration=${duration}&vehicleCount=${vehicleCount}`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Available dates endpoint working`);
      console.log(`   Found ${data.availableDates?.length || 0} available dates`);
      if (data.availableDates && data.availableDates.length > 0) {
        const firstDate = data.availableDates[0];
        console.log(`   First available: ${firstDate.date}`);
        console.log(`   Available slots: ${firstDate.availableSlots}/${firstDate.totalSlots}`);
        console.log(`   Status: ${firstDate.isFullyBooked ? '🔴 Fully Booked' : firstDate.isLimited ? '🟡 Limited' : '🟢 Available'}`);
      }
      return data;
    } else {
      console.log('❌ Available dates endpoint failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Available dates endpoint error:', error.message);
    return null;
  }
}

async function testAvailableSlotsEndpoint() {
  console.log('\n⏰ Step 5: Testing GET /api/appointments/available-slots...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().split('T')[0];
    const duration = 120; // 2 hours in minutes
    const vehicleCount = 1;
    
    const response = await fetch(
      `${BASE_URL}/api/appointments/available-slots?date=${date}&duration=${duration}&vehicleCount=${vehicleCount}`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Available slots endpoint working`);
      console.log(`   Date: ${data.date}`);
      console.log(`   Total slots: ${data.totalSlots}`);
      console.log(`   Available slots: ${data.availableSlots}`);
      if (data.slots && data.slots.length > 0) {
        const availableSlot = data.slots.find(s => s.isAvailable);
        if (availableSlot) {
          console.log(`   Sample slot: ${availableSlot.displayTime} - ${availableSlot.displayEndTime}`);
          console.log(`   Capacity: ${availableSlot.capacityRemaining}/3 available`);
        }
      }
      return data;
    } else {
      console.log('❌ Available slots endpoint failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Available slots endpoint error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Booking Wizard API Endpoints Test Suite     ║');
  console.log('╚════════════════════════════════════════════════╝');

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Tests aborted - Login failed');
    console.log('   Make sure backend server is running on port 5000');
    console.log('   Make sure admin user exists (run: node seedAdmin.js)');
    return;
  }

  // Test all endpoints
  const services = await testServicesEndpoint();
  const vehicles = await testVehiclesEndpoint();
  const availableDates = await testAvailableDatesEndpoint();
  const availableSlots = await testAvailableSlotsEndpoint();

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Authentication:     ${loginSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Services Endpoint:  ${services ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Vehicles Endpoint:  ${vehicles ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Dates Endpoint:     ${availableDates ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Slots Endpoint:     ${availableSlots ? '✅ PASS' : '❌ FAIL'}`);
  console.log('═'.repeat(50));

  const allPassed = loginSuccess && services && vehicles && availableDates && availableSlots;
  
  if (allPassed) {
    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('   ✅ Ready to test the frontend booking wizard');
    console.log('   👉 Open: http://localhost:5174');
    console.log('   👉 Navigate to: Dashboard → Book Appointment');
  } else {
    console.log('\n⚠️  Some tests failed - check errors above');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
