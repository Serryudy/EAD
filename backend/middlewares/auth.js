const JWTService = require('../services/jwtService');
const { Employee, Customer } = require('../models/User');

/**
 * Middleware to authenticate user using JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = JWTService.verifyToken(token);

    // Check if token type is access token
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Access token required.'
      });
    }

    let user = null;

    // Get user based on role
    if (decoded.role === 'employee') {
      user = await Employee.findById(decoded.id);
    } else if (decoded.role === 'customer') {
      user = await Customer.findById(decoded.id);
    }
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found or inactive.'
      });
    }

    // Additional checks for customer
    if (decoded.role === 'customer' && !user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please complete OTP verification to access this resource.'
      });
    }

    // Additional checks for employee
    if (decoded.role === 'employee' && user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Employee account is temporarily locked. Please try again later.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.'
    });
  }
};

/**
 * Middleware to authorize user based on roles
 * @param {...string} roles - Allowed roles (employee, customer)
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to allow only employees
 */
const employeeOnly = (req, res, next) => {
  return authorizeRoles('employee')(req, res, next);
};

/**
 * Middleware to allow only customers
 */
const customerOnly = (req, res, next) => {
  return authorizeRoles('customer')(req, res, next);
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = JWTService.verifyToken(token);
      
      if (decoded.type === 'access') {
        let user = null;
        
        if (decoded.role === 'employee') {
          user = await Employee.findById(decoded.id);
        } else if (decoded.role === 'customer') {
          user = await Customer.findById(decoded.id);
        }
        
        if (user && user.isActive) {
          // Additional checks
          if (decoded.role === 'customer' && user.isVerified) {
            req.user = user;
          } else if (decoded.role === 'employee' && !user.isLocked) {
            req.user = user;
          }
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Middleware to validate refresh token
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = JWTService.verifyToken(refreshToken);

    // Check if token type is refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Refresh token required.'
      });
    }

    let user = null;

    // Get user based on role
    if (decoded.role === 'employee') {
      user = await Employee.findById(decoded.id);
    } else if (decoded.role === 'customer') {
      user = await Customer.findById(decoded.id);
    }
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. User not found or inactive.'
      });
    }

    // Additional validation for customer
    if (decoded.role === 'customer' && !user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Account verification required'
      });
    }

    // Additional validation for employee
    if (decoded.role === 'employee' && user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Employee account is locked'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Refresh token validation error:', error.message);
    
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries
    for (const [key, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(key);
      }
    }

    if (!attempts.has(ip)) {
      attempts.set(ip, {
        count: 1,
        firstAttempt: now
      });
      return next();
    }

    const userAttempts = attempts.get(ip);
    
    if (now - userAttempts.firstAttempt > windowMs) {
      // Reset window
      attempts.set(ip, {
        count: 1,
        firstAttempt: now
      });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - userAttempts.firstAttempt)) / 1000)
      });
    }

    userAttempts.count++;
    next();
  };
};

/**
 * Rate limiting specifically for OTP requests
 */
const otpRateLimit = (maxAttempts = 3, windowMs = 1 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const mobile = req.body.mobile;
    const now = Date.now();
    
    if (!mobile) {
      return next(); // Let the controller handle missing mobile
    }

    const key = mobile;
    
    // Clean up old entries
    for (const [entryKey, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(entryKey);
      }
    }

    if (!attempts.has(key)) {
      attempts.set(key, {
        count: 1,
        firstAttempt: now
      });
      return next();
    }

    const userAttempts = attempts.get(key);
    
    if (now - userAttempts.firstAttempt > windowMs) {
      // Reset window
      attempts.set(key, {
        count: 1,
        firstAttempt: now
      });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - userAttempts.firstAttempt)) / 1000)
      });
    }

    userAttempts.count++;
    next();
  };
};

/**
 * Middleware to check if user owns the resource
 */
const checkResourceOwnership = (resourceIdField = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceIdField];
    const userId = req.user._id.toString();

    // Employees can access any resource (admin privileges)
    if (req.user.role === 'employee') {
      return next();
    }

    // Customers can only access their own resources
    if (resourceId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  employeeOnly,
  customerOnly,
  optionalAuth,
  validateRefreshToken,
  authRateLimit,
  otpRateLimit,
  checkResourceOwnership
};