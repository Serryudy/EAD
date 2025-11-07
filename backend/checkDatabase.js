require('dotenv').config();
const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📊 Collections (Tables) in database:');
    console.log('====================================');
    
    if (collections.length === 0) {
      console.log('  No collections found. Database is empty.');
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`  📁 ${collection.name}: ${count} documents`);
      }
    }

    console.log('\n📋 Detailed Collection Info:');
    console.log('====================================');
    
    for (const collection of collections) {
      console.log(`\n📁 ${collection.name}:`);
      const docs = await mongoose.connection.db.collection(collection.name).find({}).limit(1).toArray();
      if (docs.length > 0) {
        console.log('  Sample document structure:', Object.keys(docs[0]).join(', '));
      } else {
        console.log('  (Empty collection)');
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
