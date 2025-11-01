class OTPService {
  /**
   * Generate a 6-character letter-based OTP (uppercase letters only)
   * @returns {string} 6-letter OTP
   */
  static generateOTP() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let otp = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      otp += letters[randomIndex];
    }
    return otp;
  }

  /**
   * Generate OTP with expiration
   * @param {number} expiryMinutes - OTP expiry time in minutes (default: 5)
   * @returns {Object} OTP data with code and expiry
   */
  static generateOTPWithExpiry(expiryMinutes = 5) {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    return {
      code: otp,
      expiresAt,
      generatedAt: new Date()
    };
  }

  /**
   * Verify if OTP is valid and not expired
   * @param {string} providedOTP - OTP provided by user
   * @param {string} storedOTP - OTP stored in database
   * @param {Date} expiryDate - OTP expiry date
   * @returns {boolean} True if OTP is valid
   */
  static verifyOTP(providedOTP, storedOTP, expiryDate) {
    if (!providedOTP || !storedOTP || !expiryDate) {
      return false;
    }

    // Check if OTP has expired
    if (new Date() > expiryDate) {
      return false;
    }

    // Check if OTP matches
    return providedOTP.toString() === storedOTP.toString();
  }

  /**
   * Check if OTP has expired
   * @param {Date} expiryDate - OTP expiry date
   * @returns {boolean} True if expired
   */
  static isOTPExpired(expiryDate) {
    return new Date() > expiryDate;
  }

  /**
   * Get remaining time for OTP in seconds
   * @param {Date} expiryDate - OTP expiry date
   * @returns {number} Remaining seconds (0 if expired)
   */
  static getRemainingTime(expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    
    return Math.max(0, Math.floor(diff / 1000));
  }

  /**
   * Format mobile number to standard format
   * @param {string} mobile - Mobile number
   * @returns {string} Formatted mobile number
   */
  static formatMobile(mobile) {
    // Remove any non-digit characters
    const cleaned = mobile.replace(/\D/g, '');
    
    // If it starts with 94, remove it (Sri Lankan country code)
    if (cleaned.startsWith('94') && cleaned.length === 11) {
      return '0' + cleaned.substring(2);
    }
    
    // If it starts with +94, remove it
    if (mobile.startsWith('+94')) {
      return '0' + cleaned.substring(2);
    }
    
    return cleaned;
  }

  /**
   * Validate Sri Lankan mobile number format
   * @param {string} mobile - Mobile number to validate
   * @returns {boolean} True if valid
   */
  static isValidMobile(mobile) {
    const formatted = this.formatMobile(mobile);
    // Sri Lankan mobile numbers: 10 digits starting with 07
    return /^07[0-9]\d{7}$/.test(formatted);
  }

  /**
   * Generate a simple OTP template message
   * @param {string} otp - OTP code
   * @param {number} expiryMinutes - Expiry time in minutes
   * @param {string} appName - Application name
   * @returns {string} SMS message
   */
  static generateOTPMessage(otp, expiryMinutes = 5, appName = 'EAD Service') {
    return `Your ${appName} verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;
  }

  /**
   * Rate limiting for OTP requests
   * @param {string} mobile - Mobile number
   * @param {number} limitMinutes - Time window in minutes (default: 1)
   * @param {number} maxAttempts - Max attempts in time window (default: 3)
   * @returns {Object} Rate limit status
   */
  static checkRateLimit(mobile, limitMinutes = 1, maxAttempts = 3) {
    // This is a simple in-memory rate limiter
    // In production, use Redis or database for persistence
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }

    const now = Date.now();
    const key = mobile;
    const record = this.rateLimitStore.get(key) || { attempts: 0, resetTime: now };

    // Reset if time window has passed
    if (now > record.resetTime) {
      record.attempts = 0;
      record.resetTime = now + (limitMinutes * 60 * 1000);
    }

    // Check if limit exceeded
    if (record.attempts >= maxAttempts) {
      const timeLeft = Math.ceil((record.resetTime - now) / 1000);
      return {
        allowed: false,
        timeLeft,
        message: `Too many OTP requests. Try again in ${timeLeft} seconds.`
      };
    }

    // Increment attempts and save
    record.attempts += 1;
    this.rateLimitStore.set(key, record);

    return {
      allowed: true,
      attemptsLeft: maxAttempts - record.attempts
    };
  }

  /**
   * Clear rate limit for a mobile number (useful for testing)
   * @param {string} mobile - Mobile number
   */
  static clearRateLimit(mobile) {
    if (this.rateLimitStore) {
      this.rateLimitStore.delete(mobile);
    }
  }

  /**
   * Mask mobile number for display (show only last 4 digits)
   * @param {string} mobile - Mobile number
   * @returns {string} Masked mobile number
   */
  static maskMobile(mobile) {
    if (!mobile || mobile.length < 4) {
      return mobile;
    }
    
    const formatted = this.formatMobile(mobile);
    const lastFour = formatted.slice(-4);
    const masked = 'X'.repeat(Math.max(0, formatted.length - 4));
    
    return masked + lastFour;
  }
}

module.exports = OTPService;