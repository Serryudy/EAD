const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema({
  // Appointment Reference
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },

  // Technician Information
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technicianName: {
    type: String,
    required: true
  },

  // Work Details
  task: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'in-progress'
  },

  // Time Tracking
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in hours
    default: 0
  },
  estimatedDuration: {
    type: Number // in hours
  },

  // Additional Information
  notes: String,
  partsUsed: [{
    partName: String,
    quantity: Number,
    cost: Number
  }],
  laborCost: {
    type: Number,
    default: 0
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// Indexes
workLogSchema.index({ appointmentId: 1, createdAt: -1 });
workLogSchema.index({ technicianId: 1, status: 1 });

// Calculate duration when endTime is set
workLogSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    const durationMs = this.endTime - this.startTime;
    this.duration = Number((durationMs / (1000 * 60 * 60)).toFixed(2)); // Convert to hours
  }
  next();
});

// Virtual for formatted duration
workLogSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0h';
  return `${this.duration}h`;
});

module.exports = mongoose.model('WorkLog', workLogSchema);
