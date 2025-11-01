const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },

  // Vehicle Information
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  vehicleMake: String,
  vehicleModel: String,
  vehicleYear: Number,

  // Service Information
  serviceType: {
    type: String,
    required: true,
    enum: [
      'Periodic Maintenance',
      'Oil Change',
      'Brake Service',
      'Tire Rotation',
      'Engine Diagnostics',
      'Full Service',
      'Tire Replacement',
      'AC Repair',
      'Brake Check',
      'Inspection',
      'Other'
    ]
  },
  serviceDescription: {
    type: String,
    default: ''
  },

  // Schedule Information
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

  // Additional Information
  notes: {
    type: String,
    default: ''
  },
  additionalNotes: {
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

  // Timestamps
  estimatedCompletion: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String

}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ customerId: 1, status: 1 });
appointmentSchema.index({ assignedEmployee: 1, status: 1 });
appointmentSchema.index({ preferredDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ vehicleNumber: 1 });

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

// Pre-save hook to update timestamps
appointmentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
