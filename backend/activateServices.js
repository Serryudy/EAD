const mongoose = require('mongoose');
require('dotenv').config();

async function checkAndActivateServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    const Service = require('./models/Service');
    const services = await Service.find();
    
    console.log(`📊 Found ${services.length} services in database:\n`);
    services.forEach(s => {
      console.log(`${s.isActive ? '✅' : '❌'} ${s.name} (${s.code}) - Active: ${s.isActive}`);
    });
    
    // Activate all services
    console.log('\n🔄 Activating all services...');
    await Service.updateMany({}, { isActive: true });
    
    console.log('✅ All services activated!');
    console.log('\n🔄 Refresh your browser to see services');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAndActivateServices();
