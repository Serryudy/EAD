const { Employee, Customer } = require('../models/User');
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
      const employee = await Employee.findByCredentials(employeeId.trim(), password);

      // Generate tokens
      const tokens = JWTService.generateTokenPair(employee);

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
          ...tokens
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
      const existingEmployee = await Employee.findOne({ 
        employeeId: employeeId.trim().toUpperCase() 
      });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }

      // Create new employee
      const employee = new Employee({
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
  // CUSTOMER AUTHENTICATION
  // ========================

  /**
   * Customer signup with mobile and name
   */
  static async customerSignup(req, res) {
    try {
      const { mobile, name } = req.body;

      // Validation
      if (!mobile || !name) {
        return res.status(400).json({
          success: false,
          message: 'Please provide mobile number and name'
        });
      }

      // Validate mobile number format
      if (!OTPService.isValidMobile(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit mobile number'
        });
      }

      const formattedMobile = OTPService.formatMobile(mobile);

      // Check if customer already exists
      const existingCustomer = await Customer.findOne({ mobile: formattedMobile });
      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: 'Customer already exists with this mobile number. Please login instead.'
        });
      }

      // Create new customer
      const customer = new Customer({
        mobile: formattedMobile,
        name: name.trim()
      });

      await customer.save();

      // Send welcome SMS
      try {
        await smsService.sendWelcomeSMS(formattedMobile, name.trim());
      } catch (smsError) {
        console.error('Failed to send welcome SMS:', smsError);
        // Continue with signup even if SMS fails
      }

      res.status(201).json({
        success: true,
        message: 'Customer account created successfully. You can now login with your mobile number.',
        data: {
          user: {
            id: customer._id,
            name: customer.name,
            mobile: OTPService.maskMobile(customer.mobile),
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
      const { mobile } = req.body;

      // Validation
      if (!mobile) {
        return res.status(400).json({
          success: false,
          message: 'Please provide mobile number'
        });
      }

      // Validate mobile number format
      if (!OTPService.isValidMobile(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit mobile number'
        });
      }

      const formattedMobile = OTPService.formatMobile(mobile);

      // Check rate limit
      const rateLimit = OTPService.checkRateLimit(formattedMobile);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          message: rateLimit.message
        });
      }

      // Find customer
      const customer = await Customer.findOrCreateByMobile(formattedMobile);

      // Generate OTP
      const otp = customer.generateOTP();
      await customer.save();

      // Send OTP via SMS
      try {
        await smsService.sendCustomerOTP(formattedMobile, otp, customer.name);
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
          mobile: OTPService.maskMobile(formattedMobile),
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
      const { mobile, otp } = req.body;

      // Validation
      if (!mobile || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Please provide mobile number and OTP'
        });
      }

      const formattedMobile = OTPService.formatMobile(mobile);

      // Find customer
      const customer = await Customer.findOne({ 
        mobile: formattedMobile,
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

      res.json({
        success: true,
        message: 'Customer login successful',
        data: {
          user: {
            id: customer._id,
            name: customer.name,
            mobile: OTPService.maskMobile(customer.mobile),
            role: customer.role,
            isVerified: customer.isVerified,
            lastLogin: customer.lastLogin
          },
          ...tokens
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
            name: customer.name,
            mobile: OTPService.maskMobile(customer.mobile),
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
      const { name } = req.body;
      const customerId = req.user._id;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      const customer = await Customer.findByIdAndUpdate(
        customerId,
        { name: name.trim() },
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
            name: customer.name,
            mobile: OTPService.maskMobile(customer.mobile),
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

      const userData = user.role === 'employee' 
        ? {
            id: user._id,
            employeeId: user.employeeId,
            name: user.name,
            role: user.role,
            department: user.department,
            position: user.position
          }
        : {
            id: user._id,
            name: user.name,
            mobile: OTPService.maskMobile(user.mobile),
            role: user.role,
            isVerified: user.isVerified
          };

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: userData,
          ...tokens
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
   * Logout user (client should handle token removal)
   */
  static async logout(req, res) {
    try {
      // In a stateless JWT implementation, logout is handled client-side
      // Here we can log the logout event
      const user = req.user;
      console.log(`${user.role} ${user.role === 'employee' ? user.employeeId : user.mobile} logged out`);
      
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
   * Get all customers (Employee only)
   */
  static async getAllCustomers(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      const query = search 
        ? { 
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { mobile: { $regex: search, $options: 'i' } }
            ]
          }
        : {};

      const customers = await Customer.find(query)
        .select('-otpCode -otpExpires -otpAttempts')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Customer.countDocuments(query);

      // Mask mobile numbers for display
      const maskedCustomers = customers.map(customer => ({
        ...customer.toObject(),
        mobile: OTPService.maskMobile(customer.mobile)
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