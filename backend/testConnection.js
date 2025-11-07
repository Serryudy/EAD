/**
 * Quick Fix: Test MongoDB Connection and Provide Alternatives
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  const uri = process.env.MONGODB_URI;
  console.log('📝 Connection String:', uri ? uri.substring(0, 30) + '...' : 'NOT SET');
  
  try {
    console.log('⏳ Attempting to connect...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Check services collection
    const Service = require('./models/Service');
    const count = await Service.countDocuments();
    console.log('📦 Services in database:', count);
    
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    
  } catch (error) {
    console.log('❌ Connection Failed!');
    console.log('Error:', error.message);
    console.log('\n');
    
    console.log('🔧 TROUBLESHOOTING OPTIONS:\n');
    
    console.log('1️⃣  CHECK NETWORK:');
    console.log('   - Are you connected to internet?');
    console.log('   - Try: ping google.com');
    console.log('');
    
    console.log('2️⃣  CHECK MONGODB ATLAS:');
    console.log('   - Login to https://cloud.mongodb.com');
    console.log('   - Verify cluster "EAD" is running (not paused)');
    console.log('   - Check Network Access whitelist (allow your IP)');
    console.log('');
    
    console.log('3️⃣  ALTERNATIVE - USE LOCAL MONGODB:');
    console.log('   a) Install MongoDB locally:');
    console.log('      - Download: https://www.mongodb.com/try/download/community');
    console.log('   b) Start MongoDB service');
    console.log('   c) Update .env:');
    console.log('      MONGODB_URI=mongodb://localhost:27017/EAD');
    console.log('   d) Re-seed data:');
    console.log('      node seedAdmin.js');
    console.log('      node seedServices.js');
    console.log('');
    
    console.log('4️⃣  QUICK FIX - CONTINUE WITH LIMITED FEATURES:');
    console.log('   The server will run, but:');
    console.log('   - Services won\'t load');
    console.log('   - Login won\'t work');
    console.log('   - Appointments can\'t be saved');
    console.log('');
    
    console.log('🎯 RECOMMENDED: Fix MongoDB Atlas connection');
    console.log('   Most likely: Network issue or cluster paused\n');
  }
}

testConnection();
