const User = require('../models/User');
const JWTService = require('../services/jwtService');
const smsService = require('../services/emailService'); // Now SMS service
const OTPService = require('../services/otpService');

class AuthController {
  // ========================
  // EMPLOYEE AUTHENTICATION
  // ========================

  /**
   * Employee login with employee ID and password
   */
  static async employeeLogin(req, res) {
    try {
      const { employeeId, password } = req.body;

      // Validation
      if (!employeeId || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide employee ID and password'
        });
      }

      // Find employee and validate credentials
      const employee = await User.findEmployeeByCredentials(employeeId.trim(), password);

      // Generate tokens
      const tokens = JWTService.generateTokenPair(employee);

      // Set HTTP-only cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 70 * 24 * 60 * 60 * 1000 // 70 days
      });

      res.json({
        success: true,
        message: 'Employee login successful',
        data: {
          user: {
            id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            role: employee.role,
            department: employee.department,
            position: employee.position,
            lastLogin: employee.lastLogin
          },
          ...tokens // Still send tokens in response for API clients
        }
      });

    } catch (error) {
      console.error('Employee login error:', error);

      res.status(401).json({
        success: false,
        message: error.message || 'Invalid employee credentials'
      });
    }
  }

  /**
   * Employee registration - Create new employee account
   */
  static async employeeRegister(req, res) {
    try {
      const { employeeId, name, password, department, position } = req.body;

      // Validation
      if (!employeeId || !name || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide employee ID, name, and password'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if employee ID already exists
      const existingEmployee = await User.findOne({ 
        employeeId: employeeId.trim().toUpperCase(),
        role: 'employee'
      });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }

      // Create new employee
      const employee = new User({
        role: 'employee',
        employeeId: employeeId.trim().toUpperCase(),
        name: name.trim(),
        password: password.trim(),
        department: department ? department.trim() : undefined,
        position: position ? position.trim() : undefined
      });

      await employee.save();

      res.status(201).json({
        success: true,
        message: 'Employee registration successful',
        data: {
          user: {
            id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            role: employee.role,
            department: employee.department,
            position: employee.position,
            isActive: employee.isActive
          }
        }
      });

    } catch (error) {
      console.error('Employee registration error:', error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }

      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(', ')
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  }

  /**
   * Get employee profile
   */
  static async getEmployeeProfile(req, res) {
    try {
      const employee = req.user;

      res.json({
        success: true,
        data: {
          user: {
            id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            role: employee.role,
            department: employee.department,
            position: employee.position,
            isActive: employee.isActive,
            lastLogin: employee.lastLogin,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('Get employee profile error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to get employee profile'
      });
    }
  }

  // ========================
  // ADMIN AUTHENTICATION
  // ========================

  /**
   * Admin login with username and password
   */
  static async adminLogin(req, res) {
    try {
      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide username and password'
        });
      }

      // Find admin and validate credentials
      const admin = await User.findAdminByCredentials(username.trim(), password);

      // Generate tokens
      const tokens = JWTService.generateTokenPair(admin);

      // Set HTTP-only cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 70 * 24 * 60 * 60 * 1000 // 70 days
      });

      res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: {
            id: admin._id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
            lastLogin: admin.lastLogin
          },
          ...tokens
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);

      res.status(401).json({
        success: false,
        message: error.message || 'Invalid admin credentials'
      });
    }
  }

  /**
   * Admin registration - Create new admin account (Super Admin only or initial setup)
   */
  static async adminRegister(req, res) {
    try {
      const { username, password, name } = req.body;

      // Validation
      if (!username || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Please provide username, password, and name'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }

      // Check if username already exists
      const existingAdmin = await User.findOne({ 
        username: username.trim().toLowerCase(),
        role: 'admin'
      });

      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: 'Admin username already exists'
        });
      }

      // Create new admin
      const admin = new User({
        role: 'admin',
        username: username.trim().toLowerCase(),
        name: name.trim(),
        password: password.trim(),
        isActive: true
      });

      await admin.save();

      res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        data: {
          user: {
            _id: admin._id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
            isActive: admin.isActive
          }
        }
      });

    } catch (error) {
      console.error('Admin registration error:', error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Admin username already exists'
        });
      }

      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(', ')
        });
      }

      res.status(500).json({
        success: false,
        message: 'Admin registration failed. Please try again.'
      });
    }
  }

  /**
   * Get admin profile
   */
  static async getAdminProfile(req, res) {
    try {
      const admin = req.user;

      res.json({
        success: true,
        data: {
          user: {
            id: admin._id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('Get admin profile error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to get admin profile'
      });
    }
  }

  // ========================
  // CUSTOMER AUTHENTICATION
  // ========================

  /**
   * Customer signup with phone number and name
   */
  static async customerSignup(req, res) {
    try {
      const { phoneNumber, firstName, lastName, email, nic } = req.body;

      // Validation
      if (!phoneNumber || !firstName) {
        return res.status(400).json({
          success: false,
          message: 'Please provide phone number and first name'
        });
      }

      // Validate phone number format
      if (!OTPService.isValidMobile(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit phone number'
        });
      }

      const formattedPhone = OTPService.formatMobile(phoneNumber);

      // Check if phone number already exists
      const existingPhone = await User.findOne({ 
        phoneNumber: formattedPhone,
        role: 'customer'
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'A user with this phone number already exists in the system. Please login instead.'
        });
      }

      // Check if NIC already exists (only if NIC is provided)
      if (nic && nic.trim()) {
        const existingNIC = await User.findOne({ 
          nic: nic.trim().toUpperCase(),
          role: 'customer'
        });
        if (existingNIC) {
          return res.status(409).json({
            success: false,
            message: 'A user with this NIC already exists in the system.'
          });
        }
      }

      // Check if email already exists (only if email is provided)
      if (email && email.trim()) {
        const existingEmail = await User.findOne({ 
          email: email.trim().toLowerCase(),
          role: 'customer'
        });
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'A user with this email already exists in the system.'
          });
        }
      }

      // Create new customer
      const customer = new User({
        role: 'customer',
        phoneNumber: formattedPhone,
        firstName: firstName.trim(),
        lastName: lastName ? lastName.trim() : undefined,
        email: email ? email.trim().toLowerCase() : undefined,
        nic: nic ? nic.trim().toUpperCase() : undefined
      });

      await customer.save();

      // Send welcome SMS
      try {
        await smsService.sendWelcomeSMS(formattedPhone, firstName.trim());
      } catch (smsError) {
        console.error('Failed to send welcome SMS:', smsError);
        // Continue with signup even if SMS fails
      }

      // Generate JWT tokens for immediate login
      const tokens = JWTService.generateTokenPair(customer);

      // Set HTTP-only cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 70 * 24 * 60 * 60 * 1000 // 70 days
      });

      res.status(201).json({
        success: true,
        message: 'Customer account created successfully.',
        data: {
          token: tokens.accessToken,
          user: {
            _id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phoneNumber: customer.phoneNumber,
            email: customer.email,
            nic: customer.nic,
            role: customer.role,
            isVerified: customer.isVerified
          }
        }
      });

    } catch (error) {
      console.error('Customer signup error:', error);

      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Customer signup failed. Please try again.'
      });
    }
  }

  /**
   * Customer login - Step 1: Send OTP
   */
  static async customerSendOTP(req, res) {
    try {
      const { phoneNumber } = req.body;

      // Validation
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Please provide phone number'
        });
      }

      // Validate phone number format
      if (!OTPService.isValidMobile(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit phone number'
        });
      }

      const formattedPhone = OTPService.formatMobile(phoneNumber);

      // Check rate limit
      const rateLimit = OTPService.checkRateLimit(formattedPhone);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          message: rateLimit.message
        });
      }

      // Find customer
      const customer = await User.findOne({
        phoneNumber: formattedPhone,
        role: 'customer',
        isActive: true
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found. Please sign up first.'
        });
      }

      // Generate OTP
      const otp = customer.generateOTP();
      await customer.save();

      // Send OTP via SMS
      try {
        await smsService.sendCustomerOTP(formattedPhone, otp, customer.firstName);
      } catch (smsError) {
        console.error('Failed to send OTP SMS:', smsError);
        
        // Clear OTP if SMS fails
        customer.otpCode = undefined;
        customer.otpExpires = undefined;
        await customer.save();
        
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.'
        });
      }

      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          phoneNumber: OTPService.maskMobile(formattedPhone),
          otpSent: true,
          expiresIn: 300 // 5 minutes in seconds
        }
      });

    } catch (error) {
      console.error('Customer send OTP error:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send OTP'
      });
    }
  }

  /**
   * Customer login - Step 2: Verify OTP
   */
  static async customerVerifyOTP(req, res) {
    try {
      const { phoneNumber, otp } = req.body;

      // Validation
      if (!phoneNumber || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Please provide phone number and OTP'
        });
      }

      const formattedPhone = OTPService.formatMobile(phoneNumber);

      // Find customer
      const customer = await User.findOne({ 
        phoneNumber: formattedPhone,
        role: 'customer',
        isActive: true 
      }).select('+otpCode +otpExpires +otpAttempts');

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Verify OTP
      try {
        customer.verifyOTP(otp.toString());
        await customer.save();
      } catch (otpError) {
        await customer.save(); // Save attempt count
        return res.status(400).json({
          success: false,
          message: otpError.message
        });
      }

      // Generate tokens
      const tokens = JWTService.generateTokenPair(customer);

      // Set HTTP-only cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 70 * 24 * 60 * 60 * 1000 // 70 days
      });

      res.json({
        success: true,
        message: 'Customer login successful',
        data: {
          user: {
            id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phoneNumber: OTPService.maskMobile(customer.phoneNumber),
            email: customer.email,
            nic: customer.nic,
            role: customer.role,
            isVerified: customer.isVerified,
            lastLogin: customer.lastLogin
          },
          ...tokens // Still send tokens in response for API clients
        }
      });

    } catch (error) {
      console.error('Customer verify OTP error:', error);

      res.status(500).json({
        success: false,
        message: 'OTP verification failed'
      });
    }
  }

  /**
   * Get customer profile
   */
  static async getCustomerProfile(req, res) {
    try {
      const customer = req.user;

      res.json({
        success: true,
        data: {
          user: {
            id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phoneNumber: customer.phoneNumber ? OTPService.maskMobile(customer.phoneNumber) : null,
            email: customer.email,
            nic: customer.nic,
            role: customer.role,
            isVerified: customer.isVerified,
            isActive: customer.isActive,
            lastLogin: customer.lastLogin,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('Get customer profile error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to get customer profile'
      });
    }
  }

  /**
   * Update customer profile
   */
  static async updateCustomerProfile(req, res) {
    try {
      const { firstName, lastName, email, nic } = req.body;
      const customerId = req.user._id;

      const updateData = {};
      if (firstName && firstName.trim()) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName ? lastName.trim() : undefined;
      if (email !== undefined) updateData.email = email ? email.trim() : undefined;
      if (nic !== undefined) updateData.nic = nic ? nic.trim() : undefined;

      const customer = await User.findByIdAndUpdate(
        customerId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phoneNumber: customer.phoneNumber ? OTPService.maskMobile(customer.phoneNumber) : null,
            email: customer.email,
            nic: customer.nic,
            role: customer.role,
            isVerified: customer.isVerified,
            updatedAt: customer.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('Update customer profile error:', error);

      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Profile update failed'
      });
    }
  }

  // ========================
  // COMMON FUNCTIONALITY
  // ========================

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(req, res) {
    try {
      // User is attached to req by validateRefreshToken middleware
      const user = req.user;

      // Generate new token pair
      const tokens = JWTService.generateTokenPair(user);

      // Update HTTP-only cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 70 * 24 * 60 * 60 * 1000 // 70 days
      });

      const userData = user.role === 'employee' 
        ? {
            id: user._id,
            employeeId: user.employeeId,
            name: user.name,
            role: user.role,
            department: user.department,
            position: user.position
          }
        : user.role === 'admin'
        ? {
            id: user._id,
            username: user.username,
            name: user.name,
            role: user.role
          }
        : {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber ? OTPService.maskMobile(user.phoneNumber) : null,
            role: user.role,
            isVerified: user.isVerified
          };

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: userData,
          ...tokens // Still send tokens for API clients
        }
      });

    } catch (error) {
      console.error('Token refresh error:', error);

      res.status(401).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  /**
   * Logout user - Clear HTTP-only cookies
   */
  static async logout(req, res) {
    try {
      // Clear HTTP-only cookies
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Log the logout event
      const user = req.user;
      if (user) {
        console.log(`${user.role} ${user.role === 'employee' ? user.employeeId : user.mobile} logged out`);
      }
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);

      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  /**
   * Get current user profile (works for both employee and customer)
   */
  static async getProfile(req, res) {
    try {
      const user = req.user;

      if (user.role === 'employee') {
        return AuthController.getEmployeeProfile(req, res);
      } else if (user.role === 'customer') {
        return AuthController.getCustomerProfile(req, res);
      } else if (user.role === 'admin') {
        return AuthController.getAdminProfile(req, res);
      }

      res.status(400).json({
        success: false,
        message: 'Invalid user role'
      });

    } catch (error) {
      console.error('Get profile error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to get user profile'
      });
    }
  }

  // ========================
  // ADMIN/EMPLOYEE FUNCTIONS
  // ========================

  /**
   * Get all customers (Admin/Employee only)
   */
  static async getAllCustomers(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      const query = { 
        role: 'customer',
        ...(search && {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } }
          ]
        })
      };

      const customers = await User.find(query)
        .select('-otpCode -otpExpires -otpAttempts -password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      // Mask phone numbers for display
      const maskedCustomers = customers.map(customer => ({
        ...customer.toObject(),
        phoneNumber: customer.phoneNumber ? OTPService.maskMobile(customer.phoneNumber) : null
      }));

      res.json({
        success: true,
        data: {
          customers: maskedCustomers,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Get all customers error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to get customers'
      });
    }
  }
}

module.exports = AuthController;