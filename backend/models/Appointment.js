const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Customer Information - Only store reference to User
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Now required - all appointments must be linked to a customer
  },

  // Vehicle Information
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true // Required - link to vehicle
  },

  // Service Information - Enhanced to support multiple services
  serviceIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  serviceType: {
    type: String,
    required: true,
    enum: [
      'Oil Change',
      'Brake Inspection & Service',
      'Tire Rotation & Alignment',
      'Engine Tune Up',
      'Full Diagnostics Scan',
      'AC Recharge & Service'
    ]
  },
  serviceDescription: {
    type: String,
    default: ''
  },

  // Schedule Information - Enhanced for precise time slot booking
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  appointmentTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: true
  },
  endTime: {
    type: String, // Calculated from appointmentTime + duration
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  preferredDate: {
    type: Date,
    required: true
  },
  timeWindow: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date
  },
  scheduledTime: {
    type: String
  },

  // Assignment
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employeeName: String,
  serviceBayAllocation: {
    type: String,
    default: 'Auto'
  },

  // Status and Progress
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-service', 'completed', 'cancelled'],
    default: 'pending'
  },
  serviceProgress: {
    type: String,
    enum: ['Received', 'Diagnostics', 'Repair', 'Quality Check', 'Ready for Pickup'],
    default: 'Received'
  },
  currentStep: {
    type: Number,
    default: 0,
    min: 0,
    max: 4
  },

  // Multi-vehicle booking support
  appointmentGroupId: {
    type: String // UUID for grouped appointments
  },
  isGrouped: {
    type: Boolean,
    default: false
  },
  vehicleSequence: {
    type: Number, // Order in group (1, 2, 3, etc.)
  },
  
  // Additional Information
  notes: {
    type: String,
    default: ''
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  estimatedDuration: {
    type: String,
    default: '~ 2 hours'
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number
  },

  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'deposit-paid', 'paid', 'refunded'],
    default: 'pending'
  },
  appointmentFee: {
    type: Number,
    default: 5.00
  },
  paymentMethod: String,
  paymentData: {
    cardNumber: String,
    cardHolderName: String,
    expiryDate: String,
    paymentDate: Date
  },

  // Modification tracking
  modificationCount: {
    type: Number,
    default: 0
  },
  modificationHistory: [{
    originalDate: Date,
    originalTime: String,
    newDate: Date,
    newTime: String,
    timestamp: { type: Date, default: Date.now },
    reason: String,
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Status history for tracking
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }],
  
  // Notification tracking
  notificationsSent: [{
    type: { type: String, enum: ['confirmation', 'reminder', 'status-change', 'cancellation'] },
    channel: { type: String, enum: ['email', 'sms', 'in-app'] },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'failed'] }
  }],
  
  // Timestamps
  estimatedCompletion: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  cancellationFee: {
    type: Number,
    default: 0
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Booking metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bookedVia: {
    type: String,
    enum: ['web', 'mobile', 'phone', 'walk-in'],
    default: 'web'
  }

}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ customerId: 1, status: 1 });
appointmentSchema.index({ assignedEmployee: 1, status: 1 });
appointmentSchema.index({ preferredDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ vehicleNumber: 1 });

// New indexes for time slot booking system
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ vehicleId: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentGroupId: 1 });

// Virtual for appointment date display
appointmentSchema.virtual('displayDate').get(function() {
  return this.scheduledDate || this.preferredDate;
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Method to check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Calculate end time before saving
appointmentSchema.pre('save', function(next) {
  // Calculate end time from start time + duration
  if (this.appointmentTime && this.duration && !this.endTime) {
    const [hours, minutes] = this.appointmentTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + this.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    this.endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  }
  
  // Update timestamps based on status changes
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
    
    // Add to status history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: `Status changed to ${this.status}`
    });
  }
  
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
