const axios = require('axios');
const OTPService = require('./otpService');

class SMSService {
  constructor() {
    this.client = null;
    this.initialized = false;
    // Text.lk correct API endpoint
    this.apiUrl = 'https://api.text.lk/api/v3/sms/send';
  }

  /**
   * Initialize Text.lk SMS client
   */
  async init() {
    try {
      if (process.env.NODE_ENV === 'production' || process.env.TEXTLK_API_KEY) {
        // Production - use Text.lk
        if (!process.env.TEXTLK_API_KEY || !process.env.TEXTLK_SENDER_ID) {
          throw new Error('Text.lk credentials not configured');
        }

        console.log('✅ Text.lk SMS service configured');
        this.client = true; // Flag to indicate production mode
        
      } else {
        // Development - use console logging
        console.log('📱 SMS Service initialized in development mode (console logging)');
        this.client = null;
      }

      this.initialized = true;
      console.log('✅ SMS service initialized successfully');
      
    } catch (error) {
      console.error('❌ SMS service initialization failed:', error.message);
      throw new Error('SMS service initialization failed');
    }
  }

  /**
   * Send SMS message via Text.lk
   * @param {Object} options - SMS options
   * @returns {Object} Send result
   */
  async sendSMS(options) {
    if (!this.initialized) {
      await this.init();
    }

    const {
      to,
      message
    } = options;

    try {
      // Format mobile number for Sri Lankan format
      const formattedMobile = this.formatMobileForTextLk(to);

      if (process.env.NODE_ENV !== 'production' && !this.client) {
        // Development mode - log to console
        console.log('📱 SMS (Development Mode):');
        console.log(`To: ${formattedMobile}`);
        console.log(`Message: ${message}`);
        console.log(`Sender: ${process.env.TEXTLK_SENDER_ID || 'YourApp'}`);
        console.log('─'.repeat(50));
        
        return {
          success: true,
          messageId: 'dev_' + Date.now(),
          to: formattedMobile,
          status: 'delivered'
        };
      }

      // Production mode - send actual SMS via Text.lk API
      // Try multiple endpoints as Text.lk might use different API versions
      const endpoints = [
        'https://api.text.lk/api/v3/sms/send',
        'https://app.text.lk/api/v3/sms/send',
        'https://www.text.lk/api/v3/sms/send'
      ];

      const payload = {
        recipient: formattedMobile,
        sender_id: process.env.TEXTLK_SENDER_ID,
        message: message
      };

      console.log('Sending to Text.lk API:', {
        payload: payload,
        apiKey: process.env.TEXTLK_API_KEY ? `${process.env.TEXTLK_API_KEY.substring(0, 10)}...` : 'Missing'
      });

      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          const response = await axios.post(endpoint, payload, {
            headers: {
              'Authorization': `Bearer ${process.env.TEXTLK_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000
          });

          console.log(`Success with endpoint: ${endpoint}`);
          console.log('Text.lk API Response Status:', response.status);
          console.log('Text.lk API Response Data:', response.data);

          // Check if response is HTML (indicates wrong endpoint)
          const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
          if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html>')) {
            console.log(`Endpoint ${endpoint} returned HTML, trying next...`);
            continue;
          }

          // Text.lk API successful response
          if (response.status === 200 || response.status === 201) {
            console.log(`📱 SMS sent successfully to ${OTPService.maskMobile(to)}`);
            
            return {
              success: true,
              messageId: response.data?.id || response.data?.message_id || Date.now().toString(),
              to: formattedMobile,
              status: 'sent',
              provider: 'text.lk',
              endpoint: endpoint,
              response: response.data
            };
          }
          
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed:`, error.message);
          lastError = error;
          continue;
        }
      }
      
      // If all endpoints failed
      throw lastError || new Error('All Text.lk API endpoints failed');

    } catch (error) {
      console.error('SMS sending failed:', error.message);
      
      if (error.response) {
        console.error('Text.lk API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(`Text.lk API Error: ${errorMessage}`);
      } else if (error.request) {
        console.error('Text.lk API Request Error:', error.request);
        throw new Error('Failed to connect to Text.lk API');
      }
      
      throw new Error('Failed to send SMS: ' + error.message);
    }
  }

  /**
   * Send OTP via SMS to customer
   * @param {string} mobile - Customer mobile number
   * @param {string} otp - OTP code
   * @param {string} name - Customer name (optional)
   */
  async sendCustomerOTP(mobile, otp, name = '') {
    const appName = process.env.APP_NAME || 'MERN App';
    
    const message = name 
      ? `Hi ${name}, your ${appName} login OTP is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`
      : `Your ${appName} login OTP is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

    return await this.sendSMS({
      to: mobile,
      message
    });
  }

  /**
   * Send welcome SMS to new customer
   * @param {string} mobile - Customer mobile number
   * @param {string} name - Customer name
   */
  async sendWelcomeSMS(mobile, name) {
    const appName = process.env.APP_NAME || 'MERN App';
    
    const message = `Welcome to ${appName}, ${name}! Your account has been created successfully. You can now login using your mobile number.`;

    return await this.sendSMS({
      to: mobile,
      message
    });
  }

  /**
   * Format mobile number for Text.lk (Sri Lankan format)
   * @param {string} mobile - Mobile number
   * @returns {string} Formatted mobile for Text.lk
   */
  formatMobileForTextLk(mobile) {
    const cleaned = OTPService.formatMobile(mobile);
    
    // Text.lk expects Sri Lankan numbers in format: 0771234567
    // Convert international format back to local format
    if (cleaned.startsWith('+947')) {
      return '0' + cleaned.substring(4);
    }
    
    if (cleaned.startsWith('947')) {
      return '0' + cleaned.substring(3);
    }
    
    // If already in 07XXXXXXXX format
    if (cleaned.length === 10 && cleaned.startsWith('07')) {
      return cleaned;
    }
    
    return mobile; // Return as is if format is unclear
  }

  /**
   * Validate SMS configuration
   * @returns {boolean} True if SMS service is properly configured
   */
  isConfigured() {
    if (process.env.NODE_ENV !== 'production') {
      return true; // Always configured in development
    }
    
    return !!(
      process.env.TEXTLK_API_KEY &&
      process.env.TEXTLK_SENDER_ID
    );
  }

  /**
   * Get SMS service status
   * @returns {Object} Service status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      configured: this.isConfigured(),
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      provider: this.client ? 'text.lk' : 'console',
      apiUrl: this.apiUrl
    };
  }

  /**
   * Send bulk SMS (for admin notifications, etc.)
   * @param {Array} recipients - Array of {mobile, message} objects
   * @returns {Array} Results array
   */
  async sendBulkSMS(recipients) {
    if (!Array.isArray(recipients)) {
      throw new Error('Recipients must be an array');
    }

    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS({
          to: recipient.mobile,
          message: recipient.message
        });
        
        results.push({
          mobile: recipient.mobile,
          success: true,
          result
        });
        
      } catch (error) {
        results.push({
          mobile: recipient.mobile,
          success: false,
          error: error.message
        });
      }
      
      // Add small delay between SMS to avoid rate limiting
      if (recipients.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

// Create singleton instance
const smsService = new SMSService();

module.exports = smsService;