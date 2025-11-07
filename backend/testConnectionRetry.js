const mongoose = require('mongoose');
require('dotenv').config();

async function testWithRetry() {
  console.log('🔄 Testing MongoDB connection with retry...\n');
  
  const uri = process.env.MONGODB_URI;
  
  for (let i = 1; i <= 3; i++) {
    try {
      console.log(`Attempt ${i}/3...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ Connected successfully!');
      console.log('📊 Database:', mongoose.connection.name);
      
      // Quick query
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📦 Collections found:', collections.map(c => c.name).join(', '));
      
      await mongoose.connection.close();
      return true;
      
    } catch (error) {
      console.log(`❌ Attempt ${i} failed:`, error.message);
      if (i < 3) {
        console.log('⏳ Waiting 2 seconds before retry...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log('\n❌ All attempts failed');
  console.log('💡 The MongoDB Atlas cluster might be temporarily unavailable');
  console.log('💡 Try restarting your backend in 1-2 minutes');
  return false;
}

testWithRetry();
