require('dotenv').config();
const smsService = require('./services/smsService');

async function testSms() {
  console.log('🧪 Testing SMS Service...\n');
  
  // Test 1: Phone number normalization
  console.log('📱 Test 1: Phone Number Normalization');
  const testNumbers = [
    '0771234567',
    '771234567',
    '+94771234567',
    '94771234567'
  ];
  
  testNumbers.forEach(num => {
    const normalized = smsService.normalizePhoneNumber(num);
    const valid = smsService.isValidPhoneNumber(num);
    console.log(`  ${num} → ${normalized} (${valid ? '✅ Valid' : '❌ Invalid'})`);
  });
  
  console.log('\n📱 Test 2: Invalid Phone Numbers');
  const invalidNumbers = ['12345', '+1234567890', ''];
  invalidNumbers.forEach(num => {
    const valid = smsService.isValidPhoneNumber(num);
    console.log(`  ${num || '(empty)'} → ${valid ? '✅ Valid' : '❌ Invalid'}`);
  });
  
  // Test 3: Send test SMS (comment out if you don't want to send actual SMS)
  console.log('\n📱 Test 3: Sending Test SMS');
  console.log('⚠️  Uncomment the code below to send actual SMS\n');
  
  /*
  const testPhone = '0771234567'; // Replace with your Sri Lankan number
  const result = await smsService.sendSms(
    testPhone,
    'Test message from EAD Service Center. If you receive this, SMS integration is working!'
  );
  
  if (result.success) {
    console.log('✅ SMS sent successfully!');
    console.log('Response:', result.data);
  } else {
    console.log('❌ SMS failed:', result.message);
  }
  */
  
  // Test 4: Template messages
  console.log('📱 Test 4: Template Messages (Preview Only)');
  
  const appointmentData = {
    phoneNumber: '0771234567',
    customerName: 'John Doe',
    serviceName: 'Oil Change',
    date: new Date().toLocaleDateString(),
    time: '10:00 AM',
    referenceId: 'APT12345'
  };
  
  console.log('\n  📧 Appointment Confirmation:');
  const confirmMsg = `Hi ${appointmentData.customerName}! Your ${appointmentData.serviceName} appointment is confirmed for ${appointmentData.date} at ${appointmentData.time}. Ref: ${appointmentData.referenceId}. Thank you!`;
  console.log(`  "${confirmMsg}"`);
  console.log(`  Length: ${confirmMsg.length} chars`);
  
  const statusData = {
    phoneNumber: '0771234567',
    customerName: 'John Doe',
    status: 'completed',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry'
  };
  
  console.log('\n  📧 Status Update:');
  const statusMsg = `Hi ${statusData.customerName}! Your ${statusData.vehicleMake} ${statusData.vehicleModel} service is complete! You can pick up your vehicle now.`;
  console.log(`  "${statusMsg}"`);
  console.log(`  Length: ${statusMsg.length} chars`);
  
  const completionData = {
    phoneNumber: '0771234567',
    customerName: 'John Doe',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    totalCost: 150.50
  };
  
  console.log('\n  📧 Service Completion:');
  const completionMsg = `Hi ${completionData.customerName}! Your ${completionData.vehicleMake} ${completionData.vehicleModel} service is complete. Total: $${completionData.totalCost.toFixed(2)}. Thank you for choosing us!`;
  console.log(`  "${completionMsg}"`);
  console.log(`  Length: ${completionMsg.length} chars`);
  
  console.log('\n✅ SMS Service Test Complete!\n');
}

// Run the test
testSms().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
