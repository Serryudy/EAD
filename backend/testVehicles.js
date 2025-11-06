// Test script to check vehicles in database
require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');

async function testVehicleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autocare');
    console.log('✅ Connected to MongoDB');

    // Find all vehicles
    const vehicles = await Vehicle.find().populate('userId', 'firstName lastName phoneNumber');
    
    console.log('\n🚗 Vehicles in Database:');
    console.log('=====================================');
    
    if (vehicles.length === 0) {
      console.log('No vehicles found in database');
    } else {
      vehicles.forEach((vehicle, index) => {
        console.log(`\n${index + 1}. Vehicle ID: ${vehicle._id}`);
        console.log(`   Make: ${vehicle.make}`);
        console.log(`   Model: ${vehicle.model}`);
        console.log(`   Year: ${vehicle.year}`);
        console.log(`   License Plate: ${vehicle.licensePlate}`);
        if (vehicle.userId) {
          console.log(`   Owner: ${vehicle.userId.firstName} ${vehicle.userId.lastName}`);
          console.log(`   Owner Phone: ${vehicle.userId.phoneNumber}`);
        } else {
          console.log(`   Owner: UNKNOWN (userId: ${vehicle.userId})`);
        }
        console.log(`   Status: ${vehicle.status}`);
      });
    }

    // Show count by user
    const userVehicleCounts = await Vehicle.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Vehicle Counts by User:');
    for (const item of userVehicleCounts) {
      const user = await User.findById(item._id).select('firstName lastName phoneNumber');
      if (user) {
        console.log(`   ${user.firstName} ${user.lastName} (${user.phoneNumber}): ${item.count} vehicle(s)`);
      }
    }

    console.log('\n=====================================\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testVehicleData();
