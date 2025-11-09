/**
 * Test Vehicle Query
 * Run this to check vehicles in database and their ownerId format
 */

const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');
require('dotenv').config();

async function testVehicleQuery() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all vehicles
    console.log('📋 === ALL VEHICLES IN DATABASE ===');
    const allVehicles = await Vehicle.find();
    console.log(`Found ${allVehicles.length} vehicles total\n`);

    allVehicles.forEach((vehicle, index) => {
      console.log(`🚗 Vehicle ${index + 1}:`);
      console.log('  - ID:', vehicle._id);
      console.log('  - Owner ID:', vehicle.ownerId);
      console.log('  - Owner ID Type:', typeof vehicle.ownerId);
      console.log('  - Owner Name:', vehicle.ownerName);
      console.log('  - License Plate:', vehicle.licensePlate);
      console.log('  - Make/Model:', `${vehicle.make} ${vehicle.model}`);
      console.log('  - Year:', vehicle.year);
      console.log('  - Is Active:', vehicle.isActive);
      console.log('');
    });

    // Get all customers
    console.log('👥 === ALL CUSTOMERS IN DATABASE ===');
    const allCustomers = await User.find({ role: 'customer' });
    console.log(`Found ${allCustomers.length} customers total\n`);

    allCustomers.forEach((customer, index) => {
      console.log(`👤 Customer ${index + 1}:`);
      console.log('  - ID:', customer._id);
      console.log('  - ID Type:', typeof customer._id);
      console.log('  - Name:', `${customer.firstName} ${customer.lastName}`);
      console.log('  - Phone:', customer.phoneNumber);
      console.log('  - Is Verified:', customer.isVerified);
      console.log('');
    });

    // Try to match vehicles to customers
    console.log('🔍 === MATCHING VEHICLES TO CUSTOMERS ===');
    for (const customer of allCustomers) {
      const customerVehicles = await Vehicle.find({ ownerId: customer._id });
      console.log(`👤 ${customer.firstName} ${customer.lastName} (${customer._id}):`);
      console.log(`   Has ${customerVehicles.length} vehicles`);
      
      if (customerVehicles.length > 0) {
        customerVehicles.forEach(v => {
          console.log(`   - ${v.make} ${v.model} (${v.licensePlate})`);
        });
      }
      console.log('');
    }

    // Test specific query
    if (allCustomers.length > 0) {
      const testCustomer = allCustomers[0];
      console.log('🧪 === TEST QUERY ===');
      console.log('Testing query for customer:', testCustomer._id);
      
      const query = { ownerId: testCustomer._id };
      console.log('Query:', JSON.stringify(query, null, 2));
      
      const results = await Vehicle.find(query);
      console.log('Results:', results.length, 'vehicles found');
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

testVehicleQuery();
