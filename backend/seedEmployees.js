const mongoose = require('mongoose');
require('dotenv').config();

// Define User schema and model inline
const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  mobile: String,
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'customer'],
    required: true
  },
  department: String,
  position: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

const employees = [
  {
    employeeId: 'EMP001',
    name: 'Alex Johnson',
    password: 'password123',
    role: 'employee',
    department: 'Service',
    position: 'Senior Technician',
    isActive: true,
    isVerified: true
  },
  {
    employeeId: 'EMP002',
    name: 'Sarah Williams',
    password: 'password123',
    role: 'employee',
    department: 'Service',
    position: 'Technician',
    isActive: true,
    isVerified: true
  },
  {
    employeeId: 'EMP003',
    name: 'Mike Chen',
    password: 'password123',
    role: 'employee',
    department: 'Service',
    position: 'Technician',
    isActive: true,
    isVerified: true
  },
  {
    employeeId: 'EMP004',
    name: 'Emily Davis',
    password: 'password123',
    role: 'employee',
    department: 'Service',
    position: 'Junior Technician',
    isActive: true,
    isVerified: true
  },
  {
    employeeId: 'EMP005',
    name: 'James Martinez',
    password: 'password123',
    role: 'employee',
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
      const existing = await User.findOne({ employeeId: empData.employeeId });
      
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
