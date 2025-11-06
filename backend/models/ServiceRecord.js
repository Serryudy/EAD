const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true
  },
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
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  serviceDescription: String,
  dateScheduled: {
    type: Date,
    required: true
  },
  timeScheduled: {
    type: String,
    required: true
  },
  startedAt: Date,
  estimatedCompletionTime: Date,
  completedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timerStarted: {
    type: Boolean,
    default: false
  },
  timerStartTime: Date,
  timerDuration: {
    type: Number,
    default: 0
  },
  liveUpdates: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  laborCost: {
    type: Number,
    default: 0
  },
  notes: String
}, { timestamps: true });

serviceRecordSchema.methods.startTimer = function() {
  this.timerStarted = true;
  this.timerStartTime = new Date();
  if (!this.startedAt) this.startedAt = new Date();
};

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
