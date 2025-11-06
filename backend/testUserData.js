// Test script to check user data in database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testUserData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autocare');
    console.log('✅ Connected to MongoDB');

    // Find all customers
    const customers = await User.find({ role: 'customer' }).select('firstName lastName phoneNumber email nic role isVerified');
    
    console.log('\n📋 Customer Users in Database:');
    console.log('=====================================');
    
    if (customers.length === 0) {
      console.log('No customers found in database');
    } else {
      customers.forEach((customer, index) => {
        console.log(`\n${index + 1}. Customer ID: ${customer._id}`);
        console.log(`   Name: ${customer.firstName} ${customer.lastName}`);
        console.log(`   Phone: ${customer.phoneNumber}`);
        console.log(`   Email: ${customer.email || 'NOT SET'}`);
        console.log(`   NIC: ${customer.nic || 'NOT SET'}`);
        console.log(`   Role: ${customer.role}`);
        console.log(`   Verified: ${customer.isVerified}`);
      });
    }

    console.log('\n=====================================\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testUserData();
