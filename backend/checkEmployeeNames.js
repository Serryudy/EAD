const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Appointment = require('./models/Appointment');

async function checkNames() {
  try {
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected\n');

    const appointments = await Appointment.find({ status: 'in_progress' })
      .populate('assignedEmployee')
      .limit(3);

    console.log('Found appointments:', appointments.length);
    
    appointments.forEach(apt => {
      console.log('\n📋 Appointment:', apt._id);
      console.log('  employeeName:', apt.employeeName);
      console.log('  assignedEmployee:', apt.assignedEmployee ? `${apt.assignedEmployee.firstName} ${apt.assignedEmployee.lastName}` : 'null');
      console.log('  currentStage:', apt.currentStage);
      console.log('  progress:', apt.progress);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkNames();
