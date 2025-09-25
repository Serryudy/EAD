const express = require('express');
const AuthController = require('../controllers/authController');
const { 
  authenticateToken, 
  validateRefreshToken, 
  authRateLimit,
  otpRateLimit,
  employeeOnly,
  customerOnly
} = require('../middlewares/auth');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authRateLimit());

// ========================
// EMPLOYEE ROUTES
// ========================

/**
 * @route   POST /api/auth/employee/register
 * @desc    Employee registration - Create new employee account
 * @access  Public
 */
router.post('/employee/register', AuthController.employeeRegister);

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