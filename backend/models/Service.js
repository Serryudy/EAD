const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // Service Information
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    enum: ['Maintenance', 'Repair', 'Inspection', 'Diagnostic', 'Other'],
    default: 'Maintenance'
  },

  // Service Details
  description: {
    type: String,
    default: ''
  },
  shortDescription: {
    type: String,
    default: ''
  },

  // Pricing and Duration
  estimatedDuration: {
    type: Number, // in hours
    required: true,
    default: 1
  },
  basePrice: {
    type: Number,
    required: true,
    default: 0
  },
  priceRange: {
    min: Number,
    max: Number
  },

  // Service Steps/Checklist
  steps: [{
    stepNumber: Number,
    title: String,
    description: String,
    estimatedTime: Number // in minutes
  }],

  // Requirements
  requiredParts: [{
    partName: String,
    quantity: Number,
    optional: Boolean
  }],
  requiredTools: [String],
  skillLevel: {
    type: String,
    enum: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Basic'
  },

  // Availability
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },

  // Statistics
  timesBooked: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  // Metadata
  notes: String,
  tags: [String]

}, {
  timestamps: true
});

// Indexes
serviceSchema.index({ category: 1, isActive: 1 });

// Virtual for formatted duration
serviceSchema.virtual('formattedDuration').get(function() {
  if (this.estimatedDuration < 1) {
    return `${Math.round(this.estimatedDuration * 60)} mins`;
  }
  return `${this.estimatedDuration}h`;
});

module.exports = mongoose.model('Service', serviceSchema);
