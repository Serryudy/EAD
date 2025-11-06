const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const employees = [
  {
    role: 'employee',
    employeeId: 'EMP001',
    password: 'password123',
    name: 'Alex Johnson',
    email: 'alex.johnson@vehicleservice.com',
    phoneNumber: '0771234567',
    department: 'Service',
    position: 'Senior Technician',
    isActive: true,
    isVerified: true
  },
  {
    role: 'employee',
    employeeId: 'EMP002',
    password: 'password123',
    name: 'Sarah Williams',
    email: 'sarah.williams@vehicleservice.com',
    phoneNumber: '0772234567',
    department: 'Service',
    position: 'Technician',
    isActive: true,
    isVerified: true
  },
  {
    role: 'employee',
    employeeId: 'EMP003',
    password: 'password123',
    name: 'Mike Chen',
    email: 'mike.chen@vehicleservice.com',
    phoneNumber: '0773234567',
    department: 'Service',
    position: 'Technician',
    isActive: true,
    isVerified: true
  },
  {
    role: 'employee',
    employeeId: 'EMP004',
    password: 'password123',
    name: 'Emily Davis',
    email: 'emily.davis@vehicleservice.com',
    phoneNumber: '0774234567',
    department: 'Service',
    position: 'Junior Technician',
    isActive: true,
    isVerified: true
  },
  {
    role: 'employee',
    employeeId: 'EMP005',
    password: 'password123',
    name: 'James Martinez',
    email: 'james.martinez@vehicleservice.com',
    phoneNumber: '0775234567',
    department: 'Service',
    position: 'Senior Technician',
    isActive: true,
    isVerified: true
  }
];

async function seedEmployees() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB');

    // Create employees
    for (const empData of employees) {
      const existing = await User.findOne({ employeeId: empData.employeeId, role: 'employee' });
      
      if (existing) {
        console.log(`Employee ${empData.employeeId} (${empData.name}) already exists`);
        continue;
      }

      const employee = new User(empData);
      await employee.save();
      console.log(`✅ Created employee: ${empData.employeeId} - ${empData.name}`);
    }

    console.log('\n✨ Employee seeding completed!');
    console.log('\nEmployee Credentials:');
    console.log('─────────────────────────────────────');
    employees.forEach(emp => {
      console.log(`Employee ID: ${emp.employeeId}`);
      console.log(`Name: ${emp.name}`);
      console.log(`Email: ${emp.email}`);
      console.log(`Phone: ${emp.phoneNumber}`);
      console.log(`Password: ${emp.password}`);
      console.log(`Department: ${emp.department}`);
      console.log(`Position: ${emp.position}`);
      console.log('─────────────────────────────────────');
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding employees:', error);
    process.exit(1);
  }
}

seedEmployees();
