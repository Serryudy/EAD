const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Admin seed data
const adminData = {
  role: 'admin',
  username: 'admin',
  password: 'Admin@123',
  firstName: 'System',
  lastName: 'Administrator',
  email: 'admin@vehicleservice.com',
  isActive: true
};

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin', role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('   Username:', existingAdmin.username);
      console.log('   Email:', existingAdmin.email);
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully');
    console.log('=====================================');
    console.log('📋 Admin Credentials:');
    console.log('   Username:', adminData.username);
    console.log('   Password:', adminData.password);
    console.log('   Email:', adminData.email);
    console.log('=====================================');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();
