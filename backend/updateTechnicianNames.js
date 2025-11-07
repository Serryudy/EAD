/**
 * Quick script to update technician names for existing in_progress appointments
 */

const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
require('dotenv').config();

const sriLankanNames = [
  'Kamal Perera',
  'Nuwan Silva',
  'Roshan Fernando',
  'Dilshan Jayawardena',
  'Chaminda Wickramasinghe',
  'Kasun Rajapakse',
  'Pradeep Mendis',
  'Tharaka Gunasekara'
];

async function updateNames() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected!\n');

    const appointments = await Appointment.find({ status: 'in_progress' });
    console.log(`Found ${appointments.length} appointments\n`);

    for (const apt of appointments) {
      const randomName = sriLankanNames[Math.floor(Math.random() * sriLankanNames.length)];
      apt.employeeName = randomName;
      await apt.save();
      console.log(`✅ Updated ${apt._id} with technician: ${randomName}`);
    }

    console.log('\n✅ All done!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateNames();
