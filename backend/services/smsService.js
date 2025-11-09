const axios = require('axios');

class SmsService {
  constructor() {
    this.apiUrl = process.env.SMS_API_URL || 'https://arms-studies-loads-invitation.trycloudflare.com/send';
    this.enabled = process.env.SMS_ENABLED === 'true';
  }

  /**
   * Normalize Sri Lankan phone number to +94XXXXXXXXX format
   * @param {string} phoneNumber - Phone number in various formats
   * @returns {string} - Normalized phone number
   */
  normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    
    // Remove all spaces, dashes, and parentheses
    let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('+94')) {
      return cleaned; // Already in correct format
    } else if (cleaned.startsWith('94')) {
      return '+' + cleaned; // Add + prefix
    } else if (cleaned.startsWith('0')) {
      return '+94' + cleaned.substring(1); // Replace leading 0 with +94
    }
    
    return '+94' + cleaned; // Assume it's just the number without country code
  }

  /**
   * Validate Sri Lankan phone number
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - True if valid
   */
  isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;
    
    const normalized = this.normalizePhoneNumber(phoneNumber);
    // Sri Lankan numbers: +94 followed by 9 digits (7XXXXXXXX or 1XXXXXXXX)
    const regex = /^\+94[1-9]\d{8}$/;
    return regex.test(normalized);
  }

  /**
   * Send SMS via CloudFlare API
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Message content
   * @returns {Promise<Object>} - API response
   */
  async sendSms(phoneNumber, message) {
    try {
      // Check if SMS is enabled
      if (!this.enabled) {
        console.log('📱 SMS disabled - Message not sent:', { phoneNumber, message });
        return { success: false, message: 'SMS service is disabled' };
      }

      // Normalize and validate phone number
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      if (!this.isValidPhoneNumber(normalizedPhone)) {
        console.error('❌ Invalid phone number:', phoneNumber);
        return { success: false, message: 'Invalid phone number format' };
      }

      // Truncate message to 160 characters for single SMS
      const truncatedMessage = message.length > 160 
        ? message.substring(0, 157) + '...' 
        : message;

      console.log('📱 Sending SMS to:', normalizedPhone);
      console.log('📝 Message:', truncatedMessage);

      // Send SMS via API
      const response = await axios.post(this.apiUrl, {
        phoneNumber: normalizedPhone,
        message: truncatedMessage
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('✅ SMS sent successfully:', response.data);
      return { success: true, data: response.data };

    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      
      if (error.response) {
        console.error('API Error Response:', error.response.data);
        return { 
          success: false, 
          message: 'SMS API error', 
          error: error.response.data 
        };
      } else if (error.request) {
        console.error('No response from SMS API');
        return { 
          success: false, 
          message: 'No response from SMS service' 
        };
      } else {
        console.error('SMS Error:', error.message);
        return { 
          success: false, 
          message: error.message 
        };
      }
    }
  }

  /**
   * Send appointment confirmation SMS
   */
  async sendAppointmentConfirmation({ phoneNumber, customerName, serviceName, date, time, referenceId }) {
    const message = `Hi ${customerName}! Your ${serviceName} appointment is confirmed for ${date} at ${time}. Ref: ${referenceId}. Thank you!`;
    return this.sendSms(phoneNumber, message);
  }

  /**
   * Send appointment status update SMS
   */
  async sendStatusUpdate({ phoneNumber, customerName, status, vehicleMake, vehicleModel }) {
    const statusMessages = {
      'confirmed': `Hi ${customerName}! Your appointment for ${vehicleMake} ${vehicleModel} has been confirmed. We'll see you soon!`,
      'in-progress': `Hi ${customerName}! Your ${vehicleMake} ${vehicleModel} service is now in progress. We'll notify you when it's ready.`,
      'completed': `Hi ${customerName}! Your ${vehicleMake} ${vehicleModel} service is complete! You can pick up your vehicle now.`,
      'cancelled': `Hi ${customerName}! Your appointment for ${vehicleMake} ${vehicleModel} has been cancelled. Contact us for rescheduling.`
    };

    const message = statusMessages[status] || `Your service status has been updated to: ${status}`;
    return this.sendSms(phoneNumber, message);
  }

  /**
   * Send service completion SMS with cost
   */
  async sendServiceCompletion({ phoneNumber, customerName, vehicleMake, vehicleModel, totalCost }) {
    const message = `Hi ${customerName}! Your ${vehicleMake} ${vehicleModel} service is complete. Total: $${totalCost.toFixed(2)}. Thank you for choosing us!`;
    return this.sendSms(phoneNumber, message);
  }

  /**
   * Send appointment reminder SMS (24 hours before)
   */
  async sendAppointmentReminder({ phoneNumber, customerName, serviceName, date, time }) {
    const message = `Reminder: Your ${serviceName} appointment is tomorrow at ${time}. Contact us if you need to reschedule. Thank you!`;
    return this.sendSms(phoneNumber, message);
  }

  /**
   * Send employee assignment notification
   */
  async sendEmployeeAssignment({ phoneNumber, employeeName, serviceName, customerName, date, time }) {
    const message = `Hi ${employeeName}! New assignment: ${serviceName} for ${customerName} on ${date} at ${time}. Check your dashboard.`;
    return this.sendSms(phoneNumber, message);
  }

  /**
   * Send OTP verification code
   */
  async sendOtpCode({ phoneNumber, otpCode, expiryMinutes = 5 }) {
    const message = `Your verification code is: ${otpCode}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
    return this.sendSms(phoneNumber, message);
  }

  /**
   * Check if current time is within quiet hours (9 PM - 8 AM)
   * @returns {boolean}
   */
  isQuietHours() {
    const hour = new Date().getHours();
    return hour >= 21 || hour < 8;
  }

  /**
   * Send SMS with quiet hours check (for non-urgent messages)
   */
  async sendSmsWithQuietHoursCheck(phoneNumber, message) {
    if (this.isQuietHours()) {
      console.log('🌙 Quiet hours - SMS scheduled for later:', { phoneNumber, message });
      // In production, you'd queue this for sending at 8 AM
      // For now, we'll skip sending
      return { success: false, message: 'Quiet hours - SMS not sent' };
    }
    
    return this.sendSms(phoneNumber, message);
  }
}

// Export singleton instance
module.exports = new SmsService();
