const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const Service = require('./models/Service');

async function testServices() {
  try {
    console.log('\n🔍 Fetching all services from database...\n');
    
    const services = await Service.find({});
    
    console.log(`📊 Total services found: ${services.length}\n`);
    
    if (services.length > 0) {
      console.log('First 3 services:');
      services.slice(0, 3).forEach((service, index) => {
        console.log(`\n${index + 1}. ${service.name}`);
        console.log(`   - Code: ${service.code}`);
        console.log(`   - Price: $${service.basePrice}`);
        console.log(`   - Duration: ${service.estimatedDuration}h`);
        console.log(`   - Active: ${service.isActive}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setTimeout(testServices, 1000);
