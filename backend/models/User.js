const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Unified User Schema for all roles (customer, employee, admin)
const userSchema = new mongoose.Schema({
  // Common fields
  role: {
    type: String,
    enum: ['customer', 'employee', 'admin'],
    required: true,
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  profilePicture: {
    type: String,
    default: null
  },
  profilePicturePublicId: {
    type: String,
    default: null
  },

  // Customer-specific fields
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  nic: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^0\d{9}$/, 'Please provide a valid phone number']
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

  // Employee-specific fields
  employeeId: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true,
    unique: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Admin-specific fields
  username: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  }

}, {
  timestamps: true
});

// Indexes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ phoneNumber: 1 }, { sparse: true });
userSchema.index({ employeeId: 1 }, { sparse: true });
userSchema.index({ username: 1 }, { sparse: true });
userSchema.index({ email: 1 }, { sparse: true });

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full name (customers)
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || '';
});

// Pre-save middleware to hash password (for employees and admins)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
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

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
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

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Instance method to generate OTP (for customers)
userSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.otpCode = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  this.otpAttempts = 0;
  
  return otp;
};

// Instance method to verify OTP (for customers)
userSchema.methods.verifyOTP = function(enteredOTP) {
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

// Static method to find employee by credentials
userSchema.statics.findEmployeeByCredentials = async function(employeeId, password) {
  const employee = await this.findOne({ 
    employeeId: employeeId.toUpperCase(),
    role: 'employee',
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

// Static method to find admin by credentials
userSchema.statics.findAdminByCredentials = async function(username, password) {
  const admin = await this.findOne({ 
    username: username,
    role: 'admin',
    isActive: true 
  }).select('+password');
  
  if (!admin) {
    throw new Error('Invalid username or password');
  }

  if (admin.isLocked) {
    await admin.incLoginAttempts();
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await admin.comparePassword(password);
  
  if (!isMatch) {
    await admin.incLoginAttempts();
    throw new Error('Invalid username or password');
  }
  
  if (admin.loginAttempts > 0) {
    await admin.resetLoginAttempts();
  }
  
  admin.lastLogin = new Date();
  await admin.save();
  
  return admin;
};

// Static method to find or create customer by phone number
userSchema.statics.findOrCreateCustomerByPhone = async function(phoneNumber, firstName = null, lastName = null) {
  let customer = await this.findOne({ 
    phoneNumber, 
    role: 'customer',
    isActive: true 
  });
  
  if (!customer && firstName) {
    // Create new customer during signup
    customer = new this({
      phoneNumber,
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : undefined,
      role: 'customer'
    });
    await customer.save();
  }
  
  if (!customer) {
    throw new Error('Customer not found. Please sign up first.');
  }
  
  return customer;
};

const User = mongoose.model('User', userSchema);

module.exports = User;