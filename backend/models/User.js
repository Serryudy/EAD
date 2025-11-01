const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Employee Schema
const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    default: 'employee',
    immutable: true
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  profilePicture: {
    type: String,
    default: null
  },
  profilePicturePublicId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    match: [/^07[0-9]\d{7}$/, 'Please provide a valid Sri Lankan mobile number (e.g., 0771234567)']
  },
  role: {
    type: String,
    default: 'customer',
    immutable: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  profilePicturePublicId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Employee Schema Methods

// Virtual for checking if employee account is locked
employeeSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash employee password
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check employee password (with bcrypt)
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to handle failed login attempts for employee
employeeSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1
      },
      $set: {
        loginAttempts: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 attempts for 30 minutes
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 30 * 60 * 1000 // 30 minutes
    };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts for employee
employeeSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Static method to find employee by credentials
employeeSchema.statics.findByCredentials = async function(employeeId, password) {
  const employee = await this.findOne({ 
    employeeId: employeeId.toUpperCase(),
    isActive: true 
  }).select('+password');
  
  if (!employee) {
    throw new Error('Invalid employee ID or password');
  }

  if (employee.isLocked) {
    await employee.incLoginAttempts();
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await employee.comparePassword(password);
  
  if (!isMatch) {
    await employee.incLoginAttempts();
    throw new Error('Invalid employee ID or password');
  }
  
  if (employee.loginAttempts > 0) {
    await employee.resetLoginAttempts();
  }
  
  employee.lastLogin = new Date();
  await employee.save();
  
  return employee;
};

// Customer Schema Methods

// Instance method to generate OTP for customer
customerSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.otpCode = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  this.otpAttempts = 0;
  
  return otp;
};

// Instance method to verify OTP for customer
customerSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otpCode || !this.otpExpires) {
    throw new Error('No OTP generated for this number');
  }
  
  if (Date.now() > this.otpExpires) {
    this.otpCode = undefined;
    this.otpExpires = undefined;
    this.otpAttempts = 0;
    throw new Error('OTP has expired');
  }
  
  if (this.otpAttempts >= 3) {
    this.otpCode = undefined;
    this.otpExpires = undefined;
    this.otpAttempts = 0;
    throw new Error('Too many failed OTP attempts');
  }
  
  if (this.otpCode !== enteredOTP) {
    this.otpAttempts += 1;
    throw new Error('Invalid OTP');
  }
  
  // OTP verified successfully
  this.otpCode = undefined;
  this.otpExpires = undefined;
  this.otpAttempts = 0;
  this.isVerified = true;
  this.lastLogin = new Date();
  
  return true;
};

// Static method to find or create customer by mobile
customerSchema.statics.findOrCreateByMobile = async function(mobile, name = null) {
  let customer = await this.findOne({ mobile, isActive: true });
  
  if (!customer && name) {
    // Create new customer during signup
    customer = new this({
      mobile,
      name: name.trim()
    });
    await customer.save();
  }
  
  if (!customer) {
    throw new Error('Customer not found. Please sign up first.');
  }
  
  return customer;
};

// Create models
const Employee = mongoose.model('Employee', employeeSchema);
const Customer = mongoose.model('Customer', customerSchema);

module.exports = {
  Employee,
  Customer
};