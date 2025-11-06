const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Owner Information
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },

  // Vehicle Identification
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Vehicle Details
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  type: {
    type: String,
    enum: ['Sedan', 'SUV', 'Truck', 'Van', 'Coupe', 'Hatchback', 'Convertible', 'Wagon', 'Other'],
    default: 'Sedan'
  },
  color: String,
  
  // Technical Details
  engineType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Other']
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic', 'CVT', 'Other']
  },
  mileage: {
    type: Number,
    default: 0
  },
  vin: {
    type: String,
    sparse: true,
    unique: true
  },

  // Service History
  lastServiceDate: Date,
  nextServiceDue: Date,
  serviceHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }],

  // Additional Information
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// Indexes
vehicleSchema.index({ ownerId: 1 });

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for display info
vehicleSchema.virtual('displayInfo').get(function() {
  return `${this.make} ${this.model} (${this.year}) • ${this.licensePlate}`;
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
