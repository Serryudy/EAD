const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
  // Appointment Reference
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true // One service record per appointment
  },

  // Vehicle and Customer Info (references only)
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Assigned Employee
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },

  // Service Details
  serviceType: {
    type: String,
    required: true
  },
  serviceDescription: String,

  // Service Timeline
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  estimatedCompletionTime: Date,
  actualCompletionTime: Date,
  checkOutTime: Date,

  // Service Status
  status: {
    type: String,
    enum: ['checked-in', 'in-progress', 'completed', 'on-hold', 'cancelled', 'checked-out'],
    default: 'checked-in'
  },

  // Work Progress Tracking
  serviceProgress: [{
    stage: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'skipped'],
      default: 'pending'
    },
    startTime: Date,
    endTime: Date,
    notes: String,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Work Logs (references to WorkLog documents)
  workLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkLog'
  }],

  // Parts and Costs
  partsUsed: [{
    partName: String,
    quantity: Number,
    unitCost: Number,
    totalCost: Number
  }],
  totalPartsCost: {
    type: Number,
    default: 0
  },
  totalLaborCost: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },

  // Service Observations
  initialInspectionNotes: String,
  finalInspectionNotes: String,
  customerComplaints: [String],
  workPerformed: [String],
  recommendedServices: [String],

  // Quality Control
  qualityCheckPerformed: {
    type: Boolean,
    default: false
  },
  qualityCheckBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  qualityCheckNotes: String,

  // Customer Satisfaction
  customerNotified: {
    type: Boolean,
    default: false
  },
  customerApproved: {
    type: Boolean,
    default: false
  },
  customerSignature: String,

  // Metadata
  notes: String,
  internalNotes: String

}, {
  timestamps: true
});

// Indexes
serviceRecordSchema.index({ appointmentId: 1 });
serviceRecordSchema.index({ vehicleNumber: 1, createdAt: -1 });
serviceRecordSchema.index({ assignedEmployee: 1, status: 1 });
serviceRecordSchema.index({ status: 1, checkInTime: -1 });

// Calculate total cost before saving
serviceRecordSchema.pre('save', function(next) {
  // Calculate total parts cost
  if (this.partsUsed && this.partsUsed.length > 0) {
    this.totalPartsCost = this.partsUsed.reduce((sum, part) => sum + (part.totalCost || 0), 0);
  }
  
  // Calculate total cost
  this.totalCost = this.totalPartsCost + this.totalLaborCost;
  
  next();
});

// Virtual for service duration
serviceRecordSchema.virtual('serviceDuration').get(function() {
  if (!this.checkInTime) return 0;
  
  const endTime = this.actualCompletionTime || this.checkOutTime || new Date();
  const durationMs = endTime - this.checkInTime;
  return Number((durationMs / (1000 * 60 * 60)).toFixed(2)); // Hours
});

// Virtual for estimated vs actual comparison
serviceRecordSchema.virtual('isOnSchedule').get(function() {
  if (!this.estimatedCompletionTime || !this.actualCompletionTime) return null;
  return this.actualCompletionTime <= this.estimatedCompletionTime;
});

// Method to add work log reference
serviceRecordSchema.methods.addWorkLog = function(workLogId) {
  if (!this.workLogs.includes(workLogId)) {
    this.workLogs.push(workLogId);
  }
};

// Method to update service progress stage
serviceRecordSchema.methods.updateProgressStage = function(stageName, status, notes) {
  const stage = this.serviceProgress.find(s => s.stage === stageName);
  
  if (stage) {
    stage.status = status;
    if (notes) stage.notes = notes;
    
    if (status === 'in-progress' && !stage.startTime) {
      stage.startTime = new Date();
    } else if (status === 'completed' && !stage.endTime) {
      stage.endTime = new Date();
    }
  } else {
    // Create new stage if it doesn't exist
    this.serviceProgress.push({
      stage: stageName,
      status: status,
      startTime: status === 'in-progress' ? new Date() : undefined,
      endTime: status === 'completed' ? new Date() : undefined,
      notes: notes
    });
  }
};

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
