const express = require('express');
const AuthController = require('../controllers/authController');
const User = require('../models/User');
const { 
  authenticateToken, 
  validateRefreshToken, 
  authRateLimit,
  otpRateLimit,
  employeeOnly,
  customerOnly,
  adminOnly,
  requireRole
} = require('../middlewares/auth');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authRateLimit());

// ========================
// ADMIN ROUTES
// ========================

/**
 * @route   POST /api/auth/admin/create
 * @desc    Create new admin account (Admin only - for creating other admins)
 * @access  Private (Admin only)
 */
router.post('/admin/create', authenticateToken, adminOnly, AuthController.adminRegister);

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login with username and password
 * @access  Public
 */
router.post('/admin/login', AuthController.adminLogin);

/**
 * @route   GET /api/auth/admin/profile
 * @desc    Get admin profile
 * @access  Private (Admin only)
 */
router.get('/admin/profile', authenticateToken, AuthController.getAdminProfile);

// ========================
// EMPLOYEE ROUTES
// ========================

/**
 * @route   POST /api/auth/employee/create
 * @desc    Admin creates a new employee account
 * @access  Private (Admin only)
 */
router.post('/employee/create', authenticateToken, adminOnly, AuthController.employeeRegister);

/**
 * @route   POST /api/auth/employee/register
 * @desc    Employee registration - Create new employee account
 * @access  Public
 */
router.post('/employee/register', AuthController.employeeRegister);

/**
 * @route   POST /api/auth/register/employee
 * @desc    Admin creates a new employee account (Alternative endpoint)
 * @access  Private (Admin only)
 */
router.post('/register/employee', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, nic, password } = req.body;

    // Validation
    if (!firstName || !lastName || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, phone number, and password are required'
      });
    }

    // Check if phone number already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Create employee
    const employee = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      nic,
      password, // Will be hashed by pre-save hook
      role: 'employee',
      isVerified: true, // Auto-verify employees
      isActive: true
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        _id: employee._id,
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        nic: employee.nic,
        role: employee.role,
        isActive: employee.isActive
      }
    });
  } catch (error) {
    console.error('Employee registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/employee/login
 * @desc    Employee login with employee ID and password
 * @access  Public
 */
router.post('/employee/login', AuthController.employeeLogin);

/**
 * @route   GET /api/auth/employee/profile
 * @desc    Get employee profile
 * @access  Private (Employee only)
 */
router.get('/employee/profile', authenticateToken, employeeOnly, AuthController.getEmployeeProfile);

/**
 * @route   GET /api/auth/employee/customers
 * @desc    Get all customers (Employee only)
 * @access  Private (Employee only)
 */
router.get('/employee/customers', authenticateToken, employeeOnly, AuthController.getAllCustomers);

// ========================
// CUSTOMER ROUTES
// ========================

/**
 * @route   POST /api/auth/customer/signup
 * @desc    Customer signup with mobile and name
 * @access  Public
 */
router.post('/customer/signup', AuthController.customerSignup);

/**
 * @route   POST /api/auth/customer/send-otp
 * @desc    Send OTP to customer mobile number
 * @access  Public
 */
router.post('/customer/send-otp', otpRateLimit(), AuthController.customerSendOTP);

/**
 * @route   POST /api/auth/customer/verify-otp
 * @desc    Verify OTP and login customer
 * @access  Public
 */
router.post('/customer/verify-otp', AuthController.customerVerifyOTP);

/**
 * @route   GET /api/auth/customer/profile
 * @desc    Get customer profile
 * @access  Private (Customer only)
 */
router.get('/customer/profile', authenticateToken, customerOnly, AuthController.getCustomerProfile);

/**
 * @route   PUT /api/auth/customer/profile
 * @desc    Update customer profile
 * @access  Private (Customer only)
 */
router.put('/customer/profile', authenticateToken, customerOnly, AuthController.updateCustomerProfile);

// ========================
// COMMON ROUTES
// ========================

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 */
router.post('/refresh-token', validateRefreshToken, AuthController.refreshToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile (works for both employee and customer)
 * @access  Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

// ========================
// LEGACY/COMPATIBILITY ROUTES (Optional)
// ========================

/**
 * @route   POST /api/auth/login
 * @desc    Generic login route (determines type based on input)
 * @access  Public
 * @note    This is for backward compatibility or generic login forms
 */
router.post('/login', (req, res) => {
  const { employeeId, mobile, password, otp } = req.body;

  if (employeeId && password) {
    // Employee login
    req.body = { employeeId, password };
    return AuthController.employeeLogin(req, res);
  } else if (mobile && !otp) {
    // Customer - send OTP
    req.body = { mobile };
    return AuthController.customerSendOTP(req, res);
  } else if (mobile && otp) {
    // Customer - verify OTP
    req.body = { mobile, otp };
    return AuthController.customerVerifyOTP(req, res);
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid login parameters. Provide either (employeeId + password) or (mobile) for OTP or (mobile + otp) for verification.'
    });
  }
});

module.exports = router;