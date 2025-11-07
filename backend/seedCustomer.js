const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const customer = {
  role: 'customer',
  password: 'Customer@123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@gmail.com',
  phone: '0771234567',
  nic: '199012345678',
  address: {
    street: '123 Main Street',
    city: 'Colombo',
    province: 'Western',
    postalCode: '00100'
  },
  isVerified: true,
  isActive: true
};

async function seedCustomer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');

    // Check if customer already exists
    const existingCustomer = await User.findOne({ 
      phone: customer.phone,
      role: 'customer' 
    });

    if (existingCustomer) {
      console.log('⚠️  Customer already exists:', existingCustomer.firstName, existingCustomer.lastName);
      console.log('📞 Phone:', existingCustomer.phone);
      console.log('📧 Email:', existingCustomer.email);
      console.log('🔑 Password: Customer@123');
      process.exit(0);
    }

    // Create new customer
    const newCustomer = new User(customer);
    await newCustomer.save();

    console.log('\n✅ Customer created successfully!');
    console.log('👤 Name:', `${newCustomer.firstName} ${newCustomer.lastName}`);
    console.log('📞 Phone:', newCustomer.phone);
    console.log('📧 Email:', newCustomer.email);
    console.log('🔑 Password: Customer@123');
    console.log('\n📝 Login with phone number:', newCustomer.phone);
    console.log('   You will receive an OTP (check backend console)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedCustomer();
