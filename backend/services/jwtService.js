const jwt = require('jsonwebtoken');

class JWTService {
  /**
   * Generate JWT token
   * @param {Object} payload - The payload to encode
   * @param {string} expiresIn - Token expiration time
   * @returns {string} JWT token
   */
  static generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '70d') {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn,
        issuer: process.env.JWT_ISSUER || 'mern-app',
        audience: process.env.JWT_AUDIENCE || 'mern-app-users'
      });
    } catch (error) {
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate access token
   * @param {Object} user - User object
   * @returns {string} Access token
   */
  static generateAccessToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      type: 'access'
    };
    
    return this.generateToken(payload, process.env.JWT_ACCESS_EXPIRES_IN || '30d');
  }

  /**
   * Generate refresh token
   * @param {Object} user - User object
   * @returns {string} Refresh token
   */
  static generateRefreshToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      type: 'refresh'
    };
    
    return this.generateToken(payload, process.env.JWT_REFRESH_EXPIRES_IN || '70d');
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: process.env.JWT_ISSUER || 'mern-app',
        audience: process.env.JWT_AUDIENCE || 'mern-app-users'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Token not active');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - JWT token to decode
   * @returns {Object} Decoded token
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      throw new Error('Token decoding failed');
    }
  }

  /**
   * Get token expiration date
   * @param {string} token - JWT token
   * @returns {Date} Expiration date
   */
  static getTokenExpiration(token) {
    try {
      const decoded = this.verifyToken(token);
      return new Date(decoded.exp * 1000);
    } catch (error) {
      throw new Error('Cannot get token expiration');
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if token is expired
   */
  static isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Generate token pair (access + refresh)
   * @param {Object} user - User object
   * @returns {Object} Object containing access and refresh tokens
   */
  static generateTokenPair(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    };
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token or null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }

  /**
   * Extract token from HTTP-only cookie
   * @param {Object} cookies - Request cookies object
   * @returns {string|null} Extracted token or null
   */
  static extractTokenFromCookie(cookies) {
    if (!cookies || !cookies.accessToken) return null;
    return cookies.accessToken;
  }

  /**
   * Extract token from either cookie or Authorization header
   * Prioritizes cookie over header for better security
   * @param {Object} req - Express request object
   * @returns {string|null} Extracted token or null
   */
  static extractToken(req) {
    // First try to get from cookie (more secure)
    const cookieToken = this.extractTokenFromCookie(req.cookies);
    if (cookieToken) return cookieToken;
    
    // Fallback to Authorization header (for API clients)
    const authHeader = req.headers.authorization;
    return this.extractTokenFromHeader(authHeader);
  }

  /**
   * Generate email verification token
   * @param {Object} user - User object
   * @returns {string} Email verification token
   */
  static generateEmailVerificationToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      type: 'email_verification'
    };
    
    return this.generateToken(payload, process.env.EMAIL_TOKEN_EXPIRES_IN || '24h');
  }

  /**
   * Generate password reset token
   * @param {Object} user - User object
   * @returns {string} Password reset token
   */
  static generatePasswordResetToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      type: 'password_reset'
    };
    
    return this.generateToken(payload, process.env.RESET_TOKEN_EXPIRES_IN || '10m');
  }
}

module.exports = JWTService;