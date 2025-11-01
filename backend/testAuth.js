/**
 * Test script to verify HTTP-only cookie authentication and guest appointments
 * 
 * Run this after starting the server to test:
 * node testAuth.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Create axios instance that handles cookies
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: enables cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

let cookies = '';

async function testEmployeeLogin() {
  console.log('\n📋 Test 1: Employee Login with Cookies');
  console.log('=====================================');
  
  try {
    const response = await api.post('/auth/employee/login', {
      employeeId: 'EMP001',
      password: 'password123'
    });
    
    // Extract cookies from response
    if (response.headers['set-cookie']) {
      cookies = response.headers['set-cookie'].join('; ');
      console.log('✅ Login successful!');
      console.log('🍪 Cookies received:', cookies.split(';').slice(0, 2).join(';'));
      console.log('👤 User:', response.data.data.user.name);
      return true;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetAllAppointments() {
  console.log('\n📋 Test 2: Get All Appointments (with Cookie Auth)');
  console.log('===================================================');
  
  try {
    const response = await api.get('/appointments', {
      headers: { Cookie: cookies }
    });
    
    console.log('✅ Fetched appointments successfully!');
    console.log(`📊 Total appointments: ${response.data.pagination.total}`);
    console.log('📝 Appointments:');
    response.data.data.forEach((apt, i) => {
      console.log(`   ${i + 1}. ${apt.customerName} - ${apt.vehicleNumber} - ${apt.serviceType} - ${apt.status}`);
      if (!apt.customerId) {
        console.log('      ⚠️  Guest appointment (no customerId)');
      }
    });
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testDashboardStats() {
  console.log('\n📋 Test 3: Get Dashboard Stats (with Cookie Auth)');
  console.log('==================================================');
  
  try {
    const response = await api.get('/dashboard/stats', {
      headers: { Cookie: cookies }
    });
    
    console.log('✅ Fetched dashboard stats successfully!');
    console.log('📊 Statistics:');
    console.log(`   Total: ${response.data.data.appointments.total}`);
    console.log(`   Pending: ${response.data.data.appointments.pending}`);
    console.log(`   Confirmed: ${response.data.data.appointments.confirmed}`);
    console.log(`   In Service: ${response.data.data.appointments.inService}`);
    console.log(`   Completed: ${response.data.data.appointments.completed}`);
    console.log(`   Cancelled: ${response.data.data.appointments.cancelled}`);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testTodaySchedule() {
  console.log('\n📋 Test 4: Get Today\'s Schedule (with Cookie Auth)');
  console.log('===================================================');
  
  try {
    const response = await api.get('/dashboard/schedule/today', {
      headers: { Cookie: cookies }
    });
    
    console.log('✅ Fetched today\'s schedule successfully!');
    console.log(`📅 Appointments today: ${response.data.data.length}`);
    response.data.data.forEach((apt, i) => {
      console.log(`   ${i + 1}. ${apt.customerName} - ${apt.timeWindow} - ${apt.status}`);
    });
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testWithoutAuth() {
  console.log('\n📋 Test 5: Access Protected Endpoint Without Auth');
  console.log('===================================================');
  
  try {
    await api.get('/dashboard/stats');
    console.log('❌ Should have failed but didn\'t!');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly denied access without authentication');
      console.log('📝 Message:', error.response.data.message);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testLogout() {
  console.log('\n📋 Test 6: Logout (Clear Cookies)');
  console.log('===================================');
  
  try {
    const response = await api.post('/auth/logout', {}, {
      headers: { Cookie: cookies }
    });
    
    console.log('✅ Logout successful!');
    console.log('📝 Message:', response.data.message);
    cookies = ''; // Clear cookies
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 Starting Authentication Tests with HTTP-Only Cookies');
  console.log('=========================================================\n');
  
  const results = [];
  
  // Run tests sequentially
  results.push(await testWithoutAuth());
  results.push(await testEmployeeLogin());
  results.push(await testGetAllAppointments());
  results.push(await testDashboardStats());
  results.push(await testTodaySchedule());
  results.push(await testLogout());
  
  // Summary
  console.log('\n\n📊 Test Summary');
  console.log('===============');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Authentication with HTTP-only cookies is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Test suite failed with error:', error.message);
  process.exit(1);
});
