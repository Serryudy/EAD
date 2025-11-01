const axios = require('axios');
const OTPService = require('./otpService');

class SMSService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.apiUrl = 'https://regional-sea-anonymous-excited.trycloudflare.com/send';
  }

  async init() {
    try {
      console.log('SMS Service initialized with CloudFlare tunnel');
      this.initialized = true;
      this.client = true;
      console.log('SMS service initialized successfully');
    } catch (error) {
      console.error('SMS service initialization failed:', error.message);
      throw new Error('SMS service initialization failed');
    }
  }

  async sendSMS(options) {
    if (!this.initialized) {
      await this.init();
    }

    const { to, message } = options;

    try {
      let formattedMobile = to.replace(/\D/g, '');
      
      if (formattedMobile.startsWith('94')) {
        formattedMobile = '0' + formattedMobile.substring(2);
      } else if (!formattedMobile.startsWith('0')) {
        formattedMobile = '0' + formattedMobile;
      }

      console.log('📱 Sending SMS via CloudFlare tunnel:');
      console.log(`To: ${formattedMobile}`);
      console.log(`Message: ${message}`);
      console.log('─────────────────────────────────────────────');

      const response = await axios.post(
        this.apiUrl,
        `number=${formattedMobile}&message=${encodeURIComponent(message)}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000
        }
      );

      console.log('✅ SMS sent successfully');

      return {
        success: true,
        messageId: response.data?.messageId || `cf_${Date.now()}`,
        to: formattedMobile,
        status: 'sent',
        response: response.data
      };

    } catch (error) {
      console.error('SMS sending failed:', error.message);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Treating as success despite error');
        return {
          success: true,
          messageId: 'dev_' + Date.now(),
          to: to,
          status: 'dev_mode',
          error: error.message
        };
      }

      throw error;
    }
  }

  async sendCustomerOTP(mobile, otp, name = '') {
    const appName = process.env.APP_NAME || 'EAD Service';
    
    const message = name 
      ? `Hi ${name}, your ${appName} verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`
      : `Your ${appName} verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;

    return await this.sendSMS({ to: mobile, message });
  }

  async sendWelcomeSMS(mobile, name) {
    const appName = process.env.APP_NAME || 'EAD Service';
    const message = `Welcome to ${appName}, ${name}! Your account has been created successfully.`;
    return await this.sendSMS({ to: mobile, message });
  }

  isConfigured() {
    return this.initialized;
  }

  getStatus() {
    return {
      initialized: this.initialized,
      configured: this.isConfigured(),
      mode: process.env.NODE_ENV || 'development',
      provider: 'CloudFlare Tunnel',
      apiUrl: this.apiUrl
    };
  }

  async sendBulkSMS(recipients) {
    if (!Array.isArray(recipients)) {
      throw new Error('Recipients must be an array');
    }

    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS({ to: recipient.mobile, message: recipient.message });
        results.push({ mobile: recipient.mobile, success: true, result });
      } catch (error) {
        results.push({ mobile: recipient.mobile, success: false, error: error.message });
      }
      
      if (recipients.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

const smsService = new SMSService();
module.exports = smsService;
