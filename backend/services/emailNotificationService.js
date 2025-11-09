const nodemailer = require('nodemailer');

class EmailNotificationService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async init() {
    try {
      // Create transporter based on environment
      if (process.env.EMAIL_SERVICE === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      } else if (process.env.SMTP_HOST) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else {
        // Development mode - create test account
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log('📧 Using Ethereal test email account:', testAccount.user);
      }

      this.initialized = true;
      console.log('✅ Email notification service initialized');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      this.initialized = false;
    }
  }

  async sendEmail(options) {
    if (!this.initialized) {
      await this.init();
    }

    if (!this.transporter) {
      console.warn('Email transporter not available. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Vehicle Service" <noreply@vehicleservice.com>',
        to: options.to,
        subject: options.subject,
        html: options.html || options.text,
        text: options.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Email sent:', info.messageId);
      
      // For development, log preview URL
      if (process.env.NODE_ENV === 'development' && info.messageId) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('Email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Notification email templates
  getAppointmentCreatedEmail(appointment, customer) {
    return {
      to: customer.email,
      subject: `Appointment Confirmation - #${appointment.appointmentNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Appointment Created</h2>
          <p>Dear ${customer.firstName || 'Customer'},</p>
          <p>Your appointment has been successfully created.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            <p><strong>Appointment Number:</strong> ${appointment.appointmentNumber}</p>
            <p><strong>Date:</strong> ${new Date(appointment.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.timeSlot}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>
          </div>
          
          <p>We'll send you a confirmation once your appointment is confirmed by our team.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `
    };
  }

  getAppointmentConfirmedEmail(appointment, customer) {
    return {
      to: customer.email,
      subject: `Appointment Confirmed - #${appointment.appointmentNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Appointment Confirmed! ✓</h2>
          <p>Dear ${customer.firstName || 'Customer'},</p>
          <p>Great news! Your appointment has been confirmed.</p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #065f46;">Confirmed Details</h3>
            <p><strong>Appointment Number:</strong> ${appointment.appointmentNumber}</p>
            <p><strong>Date:</strong> ${new Date(appointment.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.timeSlot}</p>
          </div>
          
          <p>Please arrive 10 minutes early. Don't forget to bring your vehicle documents.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `
    };
  }

  getAppointmentCancelledEmail(appointment, user) {
    return {
      to: user.email,
      subject: `Appointment Cancelled - #${appointment.appointmentNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Appointment Cancelled</h2>
          <p>Dear ${user.firstName || user.name || 'Customer'},</p>
          <p>Your appointment has been cancelled.</p>
          
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #991b1b;">Cancelled Appointment</h3>
            <p><strong>Appointment Number:</strong> ${appointment.appointmentNumber}</p>
            <p><strong>Original Date:</strong> ${new Date(appointment.scheduledDate).toLocaleDateString()}</p>
          </div>
          
          <p>You can book a new appointment at your convenience.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `
    };
  }

  getServiceCompletedEmail(serviceRecord, customer) {
    return {
      to: customer.email,
      subject: 'Your Vehicle Service is Complete!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Service Completed! 🎉</h2>
          <p>Dear ${customer.firstName || 'Customer'},</p>
          <p>Great news! Your vehicle service has been completed.</p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #065f46;">Service Details</h3>
            <p><strong>Service ID:</strong> ${serviceRecord._id}</p>
            <p><strong>Completed:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>You can now pick up your vehicle during our business hours.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `
    };
  }

  getVehicleReadyEmail(serviceRecord, customer) {
    return {
      to: customer.email,
      subject: '🚗 Your Vehicle is Ready for Pickup!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Vehicle Ready for Pickup! 🚗</h2>
          <p>Dear ${customer.firstName || 'Customer'},</p>
          <p>Your vehicle is ready and waiting for you!</p>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Pickup Information</h3>
            <p><strong>Service ID:</strong> ${serviceRecord._id}</p>
            <p><strong>Ready Since:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p><strong>Business Hours:</strong><br>
          Monday - Friday: 8:00 AM - 6:00 PM<br>
          Saturday: 9:00 AM - 4:00 PM</p>
          
          <p>Please bring your ID and service receipt.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `
    };
  }

  getAppointmentReminderEmail(appointment, customer) {
    return {
      to: customer.email,
      subject: `Appointment Reminder - Tomorrow at ${appointment.timeSlot}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Appointment Reminder ⏰</h2>
          <p>Dear ${customer.firstName || 'Customer'},</p>
          <p>This is a friendly reminder about your upcoming appointment.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Tomorrow's Appointment</h3>
            <p><strong>Appointment Number:</strong> ${appointment.appointmentNumber}</p>
            <p><strong>Date:</strong> ${new Date(appointment.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.timeSlot}</p>
          </div>
          
          <p><strong>Please remember to:</strong></p>
          <ul>
            <li>Arrive 10 minutes early</li>
            <li>Bring your vehicle documents</li>
            <li>Bring any previous service records</li>
          </ul>
          
          <p>See you tomorrow!</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `
    };
  }
}

module.exports = new EmailNotificationService();
