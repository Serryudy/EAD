const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');

dotenv.config();

const services = [
  {
    name: 'Periodic Maintenance',
    code: 'PM-001',
    category: 'Maintenance',
    description: 'Regular maintenance service including oil change, filter replacement, and multi-point inspection',
    shortDescription: 'Regular maintenance and inspection',
    estimatedDuration: 2,
    basePrice: 149.99,
    priceRange: { min: 129.99, max: 199.99 },
    steps: [
      { stepNumber: 1, title: 'Vehicle Inspection', description: 'Complete vehicle check', estimatedTime: 15 },
      { stepNumber: 2, title: 'Oil Change', description: 'Replace engine oil and filter', estimatedTime: 30 },
      { stepNumber: 3, title: 'Fluid Check', description: 'Check all fluid levels', estimatedTime: 15 },
      { stepNumber: 4, title: 'Final Inspection', description: 'Quality check', estimatedTime: 10 }
    ],
    requiredParts: [
      { partName: 'Engine Oil', quantity: 1, optional: false },
      { partName: 'Oil Filter', quantity: 1, optional: false },
      { partName: 'Air Filter', quantity: 1, optional: true }
    ],
    skillLevel: 'Basic',
    isPopular: true,
    tags: ['maintenance', 'oil-change', 'inspection']
  },
  {
    name: 'Oil Change',
    code: 'OC-001',
    category: 'Maintenance',
    description: 'Full synthetic oil change with filter replacement and multi-point inspection',
    shortDescription: 'Oil and filter replacement',
    estimatedDuration: 1,
    basePrice: 89.99,
    priceRange: { min: 69.99, max: 129.99 },
    steps: [
      { stepNumber: 1, title: 'Drain Old Oil', description: 'Remove old engine oil', estimatedTime: 15 },
      { stepNumber: 2, title: 'Replace Filter', description: 'Install new oil filter', estimatedTime: 10 },
      { stepNumber: 3, title: 'Add New Oil', description: 'Fill with fresh synthetic oil', estimatedTime: 10 },
      { stepNumber: 4, title: 'Check Levels', description: 'Verify oil level', estimatedTime: 5 }
    ],
    requiredParts: [
      { partName: 'Synthetic Engine Oil', quantity: 1, optional: false },
      { partName: 'Oil Filter', quantity: 1, optional: false }
    ],
    skillLevel: 'Basic',
    isPopular: true,
    tags: ['oil-change', 'maintenance', 'quick-service']
  },
  {
    name: 'Brake Service',
    code: 'BS-001',
    category: 'Repair',
    description: 'Complete brake system inspection and service including pad replacement if needed',
    shortDescription: 'Brake inspection and repair',
    estimatedDuration: 2.5,
    basePrice: 249.99,
    priceRange: { min: 199.99, max: 399.99 },
    steps: [
      { stepNumber: 1, title: 'Brake Inspection', description: 'Check brake pads and rotors', estimatedTime: 20 },
      { stepNumber: 2, title: 'Remove Wheels', description: 'Access brake components', estimatedTime: 15 },
      { stepNumber: 3, title: 'Replace Pads', description: 'Install new brake pads', estimatedTime: 45 },
      { stepNumber: 4, title: 'Test Brakes', description: 'Verify brake performance', estimatedTime: 15 }
    ],
    requiredParts: [
      { partName: 'Brake Pads (Front)', quantity: 1, optional: false },
      { partName: 'Brake Pads (Rear)', quantity: 1, optional: true },
      { partName: 'Brake Fluid', quantity: 1, optional: false }
    ],
    skillLevel: 'Intermediate',
    isPopular: true,
    tags: ['brakes', 'safety', 'repair']
  },
  {
    name: 'Tire Rotation',
    code: 'TR-001',
    category: 'Maintenance',
    description: 'Rotate tires to ensure even wear and extend tire life',
    shortDescription: 'Tire rotation service',
    estimatedDuration: 0.5,
    basePrice: 49.99,
    priceRange: { min: 39.99, max: 69.99 },
    steps: [
      { stepNumber: 1, title: 'Lift Vehicle', description: 'Safely elevate vehicle', estimatedTime: 5 },
      { stepNumber: 2, title: 'Remove Tires', description: 'Remove all four tires', estimatedTime: 10 },
      { stepNumber: 3, title: 'Rotate Tires', description: 'Rotate according to pattern', estimatedTime: 10 },
      { stepNumber: 4, title: 'Torque Check', description: 'Verify lug nut torque', estimatedTime: 5 }
    ],
    skillLevel: 'Basic',
    isPopular: false,
    tags: ['tires', 'maintenance', 'quick-service']
  },
  {
    name: 'Engine Diagnostics',
    code: 'ED-001',
    category: 'Diagnostic',
    description: 'Comprehensive engine diagnostics using advanced computer systems',
    shortDescription: 'Computer engine diagnostics',
    estimatedDuration: 1.5,
    basePrice: 99.99,
    priceRange: { min: 79.99, max: 149.99 },
    steps: [
      { stepNumber: 1, title: 'Connect Scanner', description: 'Connect diagnostic equipment', estimatedTime: 5 },
      { stepNumber: 2, title: 'Read Codes', description: 'Scan for error codes', estimatedTime: 15 },
      { stepNumber: 3, title: 'Analyze Data', description: 'Interpret diagnostic data', estimatedTime: 30 },
      { stepNumber: 4, title: 'Report Findings', description: 'Prepare diagnostic report', estimatedTime: 20 }
    ],
    skillLevel: 'Advanced',
    isPopular: false,
    tags: ['diagnostics', 'engine', 'check-engine']
  },
  {
    name: 'Full Service',
    code: 'FS-001',
    category: 'Maintenance',
    description: 'Complete vehicle maintenance and inspection service',
    shortDescription: 'Comprehensive vehicle service',
    estimatedDuration: 3,
    basePrice: 399.99,
    priceRange: { min: 349.99, max: 499.99 },
    steps: [
      { stepNumber: 1, title: 'Complete Inspection', description: 'Full vehicle assessment', estimatedTime: 30 },
      { stepNumber: 2, title: 'Oil Change', description: 'Replace oil and filter', estimatedTime: 30 },
      { stepNumber: 3, title: 'Brake Check', description: 'Inspect brake system', estimatedTime: 20 },
      { stepNumber: 4, title: 'Tire Service', description: 'Check and rotate tires', estimatedTime: 20 },
      { stepNumber: 5, title: 'Fluid Top-up', description: 'Top up all fluids', estimatedTime: 15 },
      { stepNumber: 6, title: 'Final Check', description: 'Quality assurance', estimatedTime: 15 }
    ],
    requiredParts: [
      { partName: 'Engine Oil', quantity: 1, optional: false },
      { partName: 'Oil Filter', quantity: 1, optional: false },
      { partName: 'Air Filter', quantity: 1, optional: true },
      { partName: 'Cabin Filter', quantity: 1, optional: true }
    ],
    skillLevel: 'Intermediate',
    isPopular: true,
    tags: ['full-service', 'maintenance', 'comprehensive']
  },
  {
    name: 'Tire Replacement',
    code: 'TRE-001',
    category: 'Repair',
    description: 'Four tire replacement with wheel alignment',
    shortDescription: 'New tire installation and alignment',
    estimatedDuration: 2,
    basePrice: 699.99,
    priceRange: { min: 599.99, max: 999.99 },
    steps: [
      { stepNumber: 1, title: 'Remove Old Tires', description: 'Remove existing tires', estimatedTime: 20 },
      { stepNumber: 2, title: 'Mount New Tires', description: 'Install new tires', estimatedTime: 40 },
      { stepNumber: 3, title: 'Balance Wheels', description: 'Balance all wheels', estimatedTime: 30 },
      { stepNumber: 4, title: 'Alignment', description: 'Perform wheel alignment', estimatedTime: 20 }
    ],
    requiredParts: [
      { partName: 'Tires (Set of 4)', quantity: 1, optional: false },
      { partName: 'Valve Stems', quantity: 4, optional: false }
    ],
    skillLevel: 'Intermediate',
    isPopular: false,
    tags: ['tires', 'replacement', 'alignment']
  },
  {
    name: 'AC Repair',
    code: 'AC-001',
    category: 'Repair',
    description: 'Air conditioning system diagnostics and repair',
    shortDescription: 'AC system service and repair',
    estimatedDuration: 2.5,
    basePrice: 450.00,
    priceRange: { min: 350.00, max: 650.00 },
    steps: [
      { stepNumber: 1, title: 'AC Diagnostics', description: 'Test AC system', estimatedTime: 30 },
      { stepNumber: 2, title: 'Leak Check', description: 'Check for refrigerant leaks', estimatedTime: 20 },
      { stepNumber: 3, title: 'Repair/Replace', description: 'Fix identified issues', estimatedTime: 60 },
      { stepNumber: 4, title: 'Recharge', description: 'Refill refrigerant', estimatedTime: 20 }
    ],
    requiredParts: [
      { partName: 'Refrigerant', quantity: 1, optional: false },
      { partName: 'AC Compressor', quantity: 1, optional: true }
    ],
    skillLevel: 'Advanced',
    isPopular: false,
    tags: ['ac', 'air-conditioning', 'repair', 'climate']
  },
  {
    name: 'Brake Check',
    code: 'BC-001',
    category: 'Inspection',
    description: 'Complete brake system inspection',
    shortDescription: 'Brake system inspection',
    estimatedDuration: 0.75,
    basePrice: 39.99,
    priceRange: { min: 29.99, max: 59.99 },
    steps: [
      { stepNumber: 1, title: 'Visual Inspection', description: 'Check brake components', estimatedTime: 15 },
      { stepNumber: 2, title: 'Measure Pads', description: 'Check pad thickness', estimatedTime: 15 },
      { stepNumber: 3, title: 'Test Brakes', description: 'Road test brakes', estimatedTime: 10 },
      { stepNumber: 4, title: 'Report', description: 'Provide inspection report', estimatedTime: 5 }
    ],
    skillLevel: 'Basic',
    isPopular: true,
    tags: ['inspection', 'brakes', 'safety']
  },
  {
    name: 'Vehicle Inspection',
    code: 'VI-001',
    category: 'Inspection',
    description: 'Comprehensive multi-point vehicle inspection',
    shortDescription: 'Complete vehicle inspection',
    estimatedDuration: 1,
    basePrice: 79.99,
    priceRange: { min: 59.99, max: 99.99 },
    steps: [
      { stepNumber: 1, title: 'Exterior Check', description: 'Inspect body and lights', estimatedTime: 10 },
      { stepNumber: 2, title: 'Under Hood', description: 'Check engine components', estimatedTime: 15 },
      { stepNumber: 3, title: 'Undercarriage', description: 'Inspect underneath', estimatedTime: 15 },
      { stepNumber: 4, title: 'Test Drive', description: 'Road test vehicle', estimatedTime: 10 },
      { stepNumber: 5, title: 'Report', description: 'Detailed inspection report', estimatedTime: 10 }
    ],
    skillLevel: 'Intermediate',
    isPopular: true,
    tags: ['inspection', 'comprehensive', 'check']
  }
];

const seedServices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing services');

    // Insert new services
    await Service.insertMany(services);
    console.log('✅ Successfully seeded services');
    console.log(`📊 Inserted ${services.length} services`);

    mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();
