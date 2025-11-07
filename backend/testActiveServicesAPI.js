/**
 * Direct test of the active-services endpoint
 */
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
require('dotenv').config();
// Don't load User yet - test if this is causing issues
// const User = require('./models/User');
const appointmentController = require('./controllers/appointmentController');

async function testEndpoint() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected!\n');

    // Find a customer with appointments
    const appointment = await Appointment.findOne({ status: 'in_progress' });
    if (!appointment) {
      console.log('❌ No in_progress appointments found');
      return;
    }

    console.log('📋 Testing with appointment:', appointment._id);
    console.log('   Customer ID:', appointment.customerId);
    console.log('   employeeName:', appointment.employeeName);
    console.log('   currentStage:', appointment.currentStage);
    console.log('   progress:', appointment.progress, '%\n');

    // Mock request and response objects
    const req = {
      user: { _id: appointment.customerId }
    };

    const res = {
      json: (data) => {
        console.log('📤 API Response:\n', JSON.stringify(data, null, 2));
        
        if (data.success && data.data.length > 0) {
          const service = data.data[0];
          console.log('\n✅ TECHNICIAN INFO:');
          console.log('   fullName:', service.technician.fullName);
          console.log('   firstName:', service.technician.firstName);
          console.log('   lastName:', service.technician.lastName);
        }
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error (${code}):`, data);
        }
      })
    };

    // Call the actual controller function
    await appointmentController.getActiveServices(req, res);

    await mongoose.connection.close();
    console.log('\n✅ Test complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testEndpoint();
