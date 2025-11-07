/**
 * Seed Service Progress Data
 * 
 * This script populates existing appointments with realistic progress tracking data
 * for demonstration purposes until the employee system is implemented.
 */

const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Service = require('./models/Service');
const Vehicle = require('./models/Vehicle');
require('dotenv').config();

// Service-specific update messages
const serviceUpdateMessages = {
  'AC Repair': [
    'AC compressor inspection completed',
    'Refrigerant levels checked and adjusted',
    'Cooling system diagnostics running',
    'Leak test performed - no leaks detected',
    'Temperature output verified',
    'AC system cleaned and sanitized'
  ],
  'Oil Change': [
    'Old oil drained completely',
    'Oil filter replaced with premium filter',
    'New synthetic oil filled to proper level',
    'Oil level and quality verified',
    'Oil pan and drain plug inspected',
    'Engine compartment cleaned'
  ],
  'Brake Service': [
    'Brake pads inspection completed',
    'Rotor thickness measured - within spec',
    'Brake fluid level checked and topped off',
    'Caliper cleaned and lubricated',
    'Brake lines inspected for wear',
    'Test drive brake performance verified'
  ],
  'Engine Diagnostics': [
    'OBD scanner connected',
    'Diagnostic codes retrieved and analyzed',
    'Spark plug condition inspected',
    'Air filter checked - replacement recommended',
    'Engine compression test performed',
    'Emission system diagnostics completed'
  ],
  'Battery Replacement': [
    'Old battery removed safely',
    'Battery terminals cleaned',
    'New battery installed and secured',
    'Electrical system voltage tested',
    'Battery charging system verified',
    'Load test performed - excellent results'
  ],
  'Coolant Flush': [
    'Old coolant drained from system',
    'Cooling system flushed thoroughly',
    'Hoses and connections inspected',
    'New coolant mixture prepared',
    'System refilled with fresh coolant',
    'Pressure test completed - no leaks'
  ],
  'default': [
    'Vehicle received and checked in',
    'Initial inspection completed',
    'Service work in progress',
    'Components tested and verified',
    'Quality inspection performed',
    'Final checks completed'
  ]
};

// Get service-specific messages or default
function getServiceMessages(serviceName) {
  for (const [key, messages] of Object.entries(serviceUpdateMessages)) {
    if (serviceName.includes(key)) {
      return messages;
    }
  }
  return serviceUpdateMessages.default;
}

// Generate realistic updates
function generateUpdates(serviceName, startTime, progressStage) {
  const messages = getServiceMessages(serviceName);
  const updates = [];
  const now = new Date(startTime);
  
  // Determine how many updates based on progress
  let updateCount = 3;
  if (progressStage === 'received') updateCount = 2;
  if (progressStage === 'in-progress') updateCount = 4;
  if (progressStage === 'quality-check') updateCount = 5;
  
  // Generate updates with timestamps spread across the service duration
  for (let i = 0; i < updateCount && i < messages.length; i++) {
    const updateTime = new Date(now.getTime() + (i * 30 * 60 * 1000)); // 30 min intervals
    updates.push({
      time: updateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      message: messages[i],
      createdAt: updateTime
    });
  }
  
  // Sort updates newest first
  return updates.reverse();
}

// Generate stages based on progress
function generateStages(currentStage, startTime) {
  const stages = [
    { name: 'Received', icon: 'Package', status: 'pending', timestamp: null },
    { name: 'In Progress', icon: 'Wrench', status: 'pending', timestamp: null },
    { name: 'Quality Check', icon: 'Shield', status: 'pending', timestamp: null },
    { name: 'Completed', icon: 'CheckCircle2', status: 'pending', timestamp: null }
  ];
  
  const now = new Date(startTime);
  
  // Update stage statuses based on currentStage
  if (currentStage === 'received') {
    stages[0].status = 'completed';
    stages[0].timestamp = now;
  } else if (currentStage === 'in-progress') {
    stages[0].status = 'completed';
    stages[0].timestamp = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    stages[1].status = 'in-progress';
    stages[1].timestamp = new Date(now.getTime() - 30 * 60 * 1000); // 30 min ago
  } else if (currentStage === 'quality-check') {
    stages[0].status = 'completed';
    stages[0].timestamp = new Date(now.getTime() - 120 * 60 * 1000); // 2 hours ago
    stages[1].status = 'completed';
    stages[1].timestamp = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    stages[2].status = 'in-progress';
    stages[2].timestamp = new Date(now.getTime() - 15 * 60 * 1000); // 15 min ago
  } else if (currentStage === 'completed') {
    stages.forEach((stage, index) => {
      stage.status = 'completed';
      stage.timestamp = new Date(now.getTime() - (stages.length - index) * 30 * 60 * 1000);
    });
  }
  
  return stages;
}

async function seedServiceProgress() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Sri Lankan technician names
    const sriLankanTechnicians = [
      { firstName: 'Kamal', lastName: 'Perera' },
      { firstName: 'Nuwan', lastName: 'Silva' },
      { firstName: 'Roshan', lastName: 'Fernando' },
      { firstName: 'Dilshan', lastName: 'Jayawardena' },
      { firstName: 'Chaminda', lastName: 'Wickramasinghe' },
      { firstName: 'Kasun', lastName: 'Rajapakse' },
      { firstName: 'Pradeep', lastName: 'Mendis' },
      { firstName: 'Tharaka', lastName: 'Gunasekara' }
    ];

    // Find appointments that can be converted to in-progress
    // We'll target 'confirmed' or 'pending' appointments from the last 7 days
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);

    const appointments = await Appointment.find({
      status: { $in: ['confirmed', 'pending'] },
      appointmentDate: { $gte: recentDate }
    })
    .populate('serviceIds')
    .populate('vehicleId')
    .limit(5) // Limit to 5 appointments for demonstration
    .sort({ createdAt: -1 });

    console.log(`📊 Found ${appointments.length} appointments to seed with progress data\n`);

    if (appointments.length === 0) {
      console.log('⚠️  No suitable appointments found. Create some appointments first.');
      await mongoose.connection.close();
      return;
    }

    let updatedCount = 0;

    for (const appointment of appointments) {
      try {
        // Assign a random Sri Lankan technician name
        const randomTechnician = sriLankanTechnicians[Math.floor(Math.random() * sriLankanTechnicians.length)];
        
        // Randomly determine progress stage
        const progressOptions = ['received', 'in-progress', 'quality-check'];
        const currentStage = progressOptions[Math.floor(Math.random() * progressOptions.length)];
        
        // Determine progress percentage based on stage
        let progress = 0;
        if (currentStage === 'received') progress = 25;
        if (currentStage === 'in-progress') progress = Math.floor(Math.random() * 30) + 40; // 40-70%
        if (currentStage === 'quality-check') progress = Math.floor(Math.random() * 15) + 80; // 80-95%
        
        // Set start time (random between 1-5 hours ago)
        const hoursAgo = Math.floor(Math.random() * 5) + 1;
        const startedAt = new Date();
        startedAt.setHours(startedAt.getHours() - hoursAgo);
        
        // Calculate estimated completion time
        const serviceDuration = appointment.duration || 120; // default 2 hours in minutes
        const estimatedCompletionTime = new Date(startedAt.getTime() + serviceDuration * 60 * 1000);
        
        // Get service name for realistic messages
        const serviceName = appointment.serviceIds && appointment.serviceIds.length > 0
          ? appointment.serviceIds[0].name
          : appointment.serviceType;
        
        // Generate stages and updates
        const stages = generateStages(currentStage, startedAt);
        const updates = generateUpdates(serviceName, startedAt, currentStage);
        
        // Update appointment
        appointment.status = 'in_progress';
        appointment.currentStage = currentStage;
        appointment.progress = progress;
        appointment.startedAt = startedAt;
        appointment.estimatedCompletionTime = estimatedCompletionTime;
        appointment.stages = stages;
        appointment.updates = updates;
        appointment.employeeName = `${randomTechnician.firstName} ${randomTechnician.lastName}`;
        
        await appointment.save();
        
        updatedCount++;
        console.log(`✅ Updated appointment ${appointment._id}`);
        console.log(`   Vehicle: ${appointment.vehicleId?.make} ${appointment.vehicleId?.model}`);
        console.log(`   Service: ${serviceName}`);
        console.log(`   Technician: ${randomTechnician.firstName} ${randomTechnician.lastName}`);
        console.log(`   Stage: ${currentStage} (${progress}%)`);
        console.log(`   Updates: ${updates.length} messages`);
        console.log('');
        
      } catch (error) {
        console.error(`❌ Error updating appointment ${appointment._id}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully seeded ${updatedCount} appointments with progress data!`);
    console.log('\n📝 Summary:');
    console.log(`   - Total appointments processed: ${appointments.length}`);
    console.log(`   - Successfully updated: ${updatedCount}`);
    console.log(`   - Failed: ${appointments.length - updatedCount}`);

  } catch (error) {
    console.error('❌ Error seeding service progress:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed script
seedServiceProgress();
