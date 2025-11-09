/**
 * Test Vehicle Creation After Signup
 * Run this script to test the vehicle creation flow
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
require('dotenv').config();

async function testVehicleCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test customer user
    const customer = await User.findOne({ role: 'customer' });
    
    if (!customer) {
      console.log('❌ No customer user found. Please create a customer first.');
      return;
    }

    console.log('\n📋 Customer found:');
    console.log('- ID:', customer._id);
    console.log('- Name:', customer.firstName, customer.lastName);
    console.log('- Phone:', customer.phoneNumber);
    console.log('- name field:', customer.name || 'NOT SET');

    // Test data
    const vehicleData = {
      ownerId: customer._id,
      ownerName: customer.name || `${customer.firstName} ${customer.lastName}`.trim(),
      licensePlate: 'TEST-' + Date.now(),
      make: 'Toyota',
      model: 'Camry',
      year: 2022
    };

    console.log('\n🚗 Creating vehicle with data:');
    console.log(JSON.stringify(vehicleData, null, 2));

    // Create vehicle
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    console.log('\n✅ Vehicle created successfully!');
    console.log('- Vehicle ID:', vehicle._id);
    console.log('- License Plate:', vehicle.licensePlate);
    console.log('- Owner Name:', vehicle.ownerName);

    // Clean up test vehicle
    await Vehicle.deleteOne({ _id: vehicle._id });
    console.log('\n🧹 Test vehicle cleaned up');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testVehicleCreation();
