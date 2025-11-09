const Notification = require('../models/Notification');
const emailNotificationService = require('./emailNotificationService');
const smsService = require('./smsService');
const User = require('../models/User');

class NotificationService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map userId to socket IDs
  }

  // Initialize Socket.io
  initialize(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Authenticate socket connection
      socket.on('authenticate', async (data) => {
        try {
          const { userId, role } = data;
          console.log('🔐 Socket authenticate request:', { userId, role, socketId: socket.id });
          
          if (userId) {
            socket.userId = userId;
            socket.userRole = role;
            
            // Store socket mapping
            if (!this.userSockets.has(userId)) {
              this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId).add(socket.id);
            
            // Join user-specific room
            socket.join(`user_${userId}`);
            socket.join(`role_${role}`);
            
            console.log(`✅ User ${userId} (${role}) authenticated on socket ${socket.id}`);
            console.log(`✅ Joined rooms: user_${userId}, role_${role}`);
            
            // Send unread count
            const unreadCount = await Notification.getUnreadCount(userId);
            console.log(`📊 Sending unread count to ${userId}: ${unreadCount}`);
            socket.emit('unread_count', { count: unreadCount });
          } else {
            console.warn('⚠️ Socket authentication failed - no userId provided');
          }
        } catch (error) {
          console.error('❌ Socket authentication error:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          const userSocketSet = this.userSockets.get(socket.userId);
          if (userSocketSet) {
            userSocketSet.delete(socket.id);
            if (userSocketSet.size === 0) {
              this.userSockets.delete(socket.userId);
            }
          }
          console.log(`🔌 User ${socket.userId} disconnected from socket ${socket.id}`);
        }
      });

      // Mark notification as read
      socket.on('mark_read', async (notificationId) => {
        try {
          const notification = await Notification.findOne({
            _id: notificationId,
            recipient: socket.userId
          });
          
          if (notification) {
            await notification.markAsRead();
            const unreadCount = await Notification.getUnreadCount(socket.userId);
            socket.emit('unread_count', { count: unreadCount });
          }
        } catch (error) {
          console.error('Mark read error:', error);
        }
      });
    });
  }

  // Send notification to specific user
  async sendToUser(userId, notificationData) {
    try {
      console.log('📤 sendToUser called for:', userId);
      console.log('📤 Notification data:', notificationData.type, notificationData.title);
      
      // Get user and check preferences
      const user = await User.findById(userId);
      if (!user) {
        console.warn(`❌ User ${userId} not found`);
        return null;
      }
      console.log('✅ User found:', user.email, user.role);

      // Check if user wants this type of notification
      const prefs = user.notificationPreferences;
      console.log('🔔 User preferences:', JSON.stringify(prefs, null, 2));
      
      if (prefs && prefs.types && prefs.types[notificationData.type] === false) {
        console.log(`❌ User ${userId} has disabled ${notificationData.type} notifications`);
        return null;
      }

      // Create notification in database (in-app notification)
      let notification = null;
      if (!prefs || prefs.push !== false) {
        console.log('💾 Creating notification in database...');
        notification = await Notification.createNotification({
          recipient: userId,
          ...notificationData
        });
        console.log('✅ Notification created in DB:', notification._id);

        // Send via Socket.io if user is connected
        if (this.io) {
          const room = `user_${userId}`;
          console.log('📡 Emitting to socket room:', room);
          const unreadCount = await Notification.getUnreadCount(userId);
          this.io.to(room).emit('new_notification', {
            notification,
            unreadCount
          });
          console.log('✅ Socket event emitted with unread count:', unreadCount);
        } else {
          console.warn('❌ Socket.io not initialized!');
        }
      } else {
        console.log('❌ User has disabled push notifications');
      }

      // Send email notification if enabled and user has email
      if (user.email && (!prefs || prefs.email !== false)) {
        await this.sendEmailNotification(notificationData.type, user, notificationData);
      }

      // Send SMS notification if enabled and user has phone number
      if (user.phoneNumber && (!prefs || prefs.sms !== false)) {
        await this.sendSmsNotification(notificationData.type, user, notificationData);
      }

      return notification;
    } catch (error) {
      console.error('❌ Send notification error:', error);
      throw error;
    }
  }

  // Helper to send email based on notification type
  async sendEmailNotification(type, user, data) {
    try {
      let emailData = null;

      switch (type) {
        case 'appointment_created':
          if (data.appointment) {
            emailData = emailNotificationService.getAppointmentCreatedEmail(data.appointment, user);
          }
          break;
        case 'appointment_confirmed':
          if (data.appointment) {
            emailData = emailNotificationService.getAppointmentConfirmedEmail(data.appointment, user);
          }
          break;
        case 'appointment_cancelled':
          if (data.appointment) {
            emailData = emailNotificationService.getAppointmentCancelledEmail(data.appointment, user);
          }
          break;
        case 'appointment_reminder':
          if (data.appointment) {
            emailData = emailNotificationService.getAppointmentReminderEmail(data.appointment, user);
          }
          break;
        case 'service_completed':
          if (data.serviceRecord) {
            emailData = emailNotificationService.getServiceCompletedEmail(data.serviceRecord, user);
          }
          break;
        case 'vehicle_ready':
          if (data.serviceRecord) {
            emailData = emailNotificationService.getVehicleReadyEmail(data.serviceRecord, user);
          }
          break;
      }

      if (emailData) {
        await emailNotificationService.sendEmail(emailData);
      }
    } catch (error) {
      console.error('Email notification error:', error);
      // Don't throw - email failure shouldn't break in-app notification
    }
  }

  // Helper to send SMS based on notification type
  async sendSmsNotification(type, user, data) {
    try {
      const customerName = user.firstName || user.name || 'Customer';
      
      switch (type) {
        case 'appointment_created':
        case 'appointment_confirmed':
          if (data.appointment) {
            await smsService.sendAppointmentConfirmation({
              phoneNumber: user.phoneNumber,
              customerName,
              serviceName: data.appointment.serviceType || 'Service',
              date: new Date(data.appointment.preferredDate).toLocaleDateString(),
              time: data.appointment.scheduledTime || data.appointment.timeWindow,
              referenceId: data.appointment._id.toString().substring(0, 8)
            });
          }
          break;
          
        case 'status_update':
          if (data.appointment && data.status) {
            const vehicle = data.vehicle || {};
            await smsService.sendStatusUpdate({
              phoneNumber: user.phoneNumber,
              customerName,
              status: data.status,
              vehicleMake: vehicle.make || 'Your',
              vehicleModel: vehicle.model || 'vehicle'
            });
          }
          break;
          
        case 'service_completed':
          if (data.serviceRecord) {
            const vehicle = data.vehicle || {};
            await smsService.sendServiceCompletion({
              phoneNumber: user.phoneNumber,
              customerName,
              vehicleMake: vehicle.make || 'Your',
              vehicleModel: vehicle.model || 'vehicle',
              totalCost: data.serviceRecord.totalCost || 0
            });
          }
          break;
          
        case 'appointment_reminder':
          if (data.appointment) {
            await smsService.sendAppointmentReminder({
              phoneNumber: user.phoneNumber,
              customerName,
              serviceName: data.appointment.serviceType || 'Service',
              date: new Date(data.appointment.preferredDate).toLocaleDateString(),
              time: data.appointment.scheduledTime || data.appointment.timeWindow
            });
          }
          break;
      }
    } catch (error) {
      console.error('SMS notification error:', error);
      // Don't throw - SMS failure shouldn't break in-app notification
    }
  }

  // Send notification to multiple users
  async sendToMultipleUsers(userIds, notificationData) {
    try {
      const notifications = await Promise.all(
        userIds.map(userId => this.sendToUser(userId, notificationData))
      );
      return notifications;
    } catch (error) {
      console.error('Send multiple notifications error:', error);
      throw error;
    }
  }

  // Send notification to all users with specific role
  async sendToRole(role, notificationData) {
    try {
      // Broadcast to all users with this role via Socket.io
      if (this.io) {
        this.io.to(`role_${role}`).emit('new_notification', {
          notification: notificationData
        });
      }
    } catch (error) {
      console.error('Send to role error:', error);
      throw error;
    }
  }

  // Broadcast to all connected users
  async broadcast(notificationData) {
    try {
      if (this.io) {
        this.io.emit('new_notification', {
          notification: notificationData
        });
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      throw error;
    }
  }

  // Appointment-related notifications
  async notifyAppointmentCreated(appointment, customerId) {
    console.log('📝 Creating notification for customer:', customerId);
    console.log('📝 Appointment details:', {
      id: appointment._id,
      number: appointment.appointmentNumber,
      date: appointment.scheduledDate
    });
    
    // Fetch vehicle data if not populated
    let vehicle = appointment.vehicleId;
    if (vehicle && typeof vehicle === 'string') {
      const Vehicle = require('../models/Vehicle');
      vehicle = await Vehicle.findById(vehicle);
    }
    
    const result = await this.sendToUser(customerId, {
      recipientRole: 'customer',
      type: 'appointment_created',
      title: 'Appointment Created',
      message: `Your appointment #${appointment.appointmentNumber} has been created for ${new Date(appointment.scheduledDate).toLocaleDateString()}.`,
      relatedEntity: {
        entityType: 'Appointment',
        entityId: appointment._id
      },
      priority: 'medium',
      actionUrl: `/appointments/${appointment._id}`,
      appointment, // Pass for email
      vehicle // Pass for SMS
    });
    
    console.log('✅ Notification result:', result ? result._id : 'null');
    return result;
  }

  async notifyAppointmentConfirmed(appointment, customerId) {
    // Fetch vehicle data if not populated
    let vehicle = appointment.vehicleId;
    if (vehicle && typeof vehicle === 'string') {
      const Vehicle = require('../models/Vehicle');
      vehicle = await Vehicle.findById(vehicle);
    }
    
    return await this.sendToUser(customerId, {
      recipientRole: 'customer',
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: `Your appointment #${appointment.appointmentNumber} has been confirmed!`,
      relatedEntity: {
        entityType: 'Appointment',
        entityId: appointment._id
      },
      priority: 'high',
      actionUrl: `/appointments/${appointment._id}`,
      appointment, // Pass for email
      vehicle // Pass for SMS
    });
  }

  async notifyAppointmentCancelled(appointment, userId, role) {
    return await this.sendToUser(userId, {
      recipientRole: role,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Appointment #${appointment.appointmentNumber} has been cancelled.`,
      relatedEntity: {
        entityType: 'Appointment',
        entityId: appointment._id
      },
      priority: 'high',
      actionUrl: `/appointments/${appointment._id}`,
      appointment // Pass for email
    });
  }

  async notifyAppointmentReminder(appointment, customerId) {
    return await this.sendToUser(customerId, {
      recipientRole: 'customer',
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment tomorrow at ${appointment.timeSlot}.`,
      relatedEntity: {
        entityType: 'Appointment',
        entityId: appointment._id
      },
      priority: 'high',
      actionUrl: `/appointments/${appointment._id}`,
      appointment // Pass for email
    });
  }

  // Service-related notifications
  async notifyServiceStarted(serviceRecord, customerId) {
    return await this.sendToUser(customerId, {
      recipientRole: 'customer',
      type: 'service_started',
      title: 'Service Started',
      message: `Work has started on your vehicle.`,
      relatedEntity: {
        entityType: 'ServiceRecord',
        entityId: serviceRecord._id
      },
      priority: 'medium',
      actionUrl: `/service-progress/${serviceRecord._id}`,
      serviceRecord // Pass for email
    });
  }

  async notifyServiceCompleted(serviceRecord, customerId) {
    // Fetch vehicle data if not populated
    let vehicle = serviceRecord.vehicleId;
    if (vehicle && typeof vehicle === 'string') {
      const Vehicle = require('../models/Vehicle');
      vehicle = await Vehicle.findById(vehicle);
    }
    
    return await this.sendToUser(customerId, {
      recipientRole: 'customer',
      type: 'service_completed',
      title: 'Service Completed',
      message: `Your vehicle service has been completed!`,
      relatedEntity: {
        entityType: 'ServiceRecord',
        entityId: serviceRecord._id
      },
      priority: 'high',
      actionUrl: `/service-progress/${serviceRecord._id}`,
      serviceRecord, // Pass for email
      vehicle // Pass for SMS
    });
  }

  async notifyVehicleReady(serviceRecord, customerId) {
    return await this.sendToUser(customerId, {
      recipientRole: 'customer',
      type: 'vehicle_ready',
      title: 'Vehicle Ready for Pickup',
      message: `Your vehicle is ready for pickup!`,
      relatedEntity: {
        entityType: 'ServiceRecord',
        entityId: serviceRecord._id
      },
      priority: 'urgent',
      actionUrl: `/service-progress/${serviceRecord._id}`,
      serviceRecord // Pass for email
    });
  }

  // Admin/Employee notifications - New Appointment Created
  async notifyAdminNewAppointment(appointment) {
    const User = require('../models/User');
    try {
      // Get all admins
      const admins = await User.find({ role: 'admin' });
      
      for (const admin of admins) {
        await this.sendToUser(admin._id, {
          recipientRole: 'admin',
          type: 'appointment_created',
          title: 'New Appointment Request',
          message: `New appointment #${appointment.appointmentNumber} from ${appointment.customerName || 'Customer'}. Requires confirmation.`,
          relatedEntity: {
            entityType: 'Appointment',
            entityId: appointment._id
          },
          priority: 'high',
          actionUrl: `/admin/appointments/${appointment._id}`,
          appointment
        });
      }
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }

  // Notify assigned employee about new appointment
  async notifyEmployeeAssigned(appointment, employeeId) {
    return await this.sendToUser(employeeId, {
      recipientRole: 'employee',
      type: 'appointment_confirmed',
      title: 'New Appointment Assigned',
      message: `You've been assigned to appointment #${appointment.appointmentNumber} on ${new Date(appointment.scheduledDate).toLocaleDateString()}.`,
      relatedEntity: {
        entityType: 'Appointment',
        entityId: appointment._id
      },
      priority: 'high',
      actionUrl: `/employee/appointments/${appointment._id}`,
      appointment
    });
  }

  // Notify employee when service is ready to start
  async notifyEmployeeServiceReady(serviceRecord, employeeId) {
    return await this.sendToUser(employeeId, {
      recipientRole: 'employee',
      type: 'service_started',
      title: 'Service Ready to Start',
      message: `Service for vehicle ${serviceRecord.vehicleId?.vehicleNumber || 'N/A'} is ready to begin.`,
      relatedEntity: {
        entityType: 'ServiceRecord',
        entityId: serviceRecord._id
      },
      priority: 'medium',
      actionUrl: `/employee/service-records/${serviceRecord._id}`,
      serviceRecord
    });
  }

  // Notify admin when payment is completed
  async notifyAdminPaymentReceived(appointment, amount) {
    const User = require('../models/User');
    try {
      const admins = await User.find({ role: 'admin' });
      
      for (const admin of admins) {
        await this.sendToUser(admin._id, {
          recipientRole: 'admin',
          type: 'system_notification',
          title: 'Payment Received',
          message: `Payment of Rs. ${amount} received for appointment #${appointment.appointmentNumber}.`,
          relatedEntity: {
            entityType: 'Appointment',
            entityId: appointment._id
          },
          priority: 'medium',
          actionUrl: `/admin/appointments/${appointment._id}`,
          appointment
        });
      }
    } catch (error) {
      console.error('Failed to notify admins about payment:', error);
    }
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }
}

module.exports = new NotificationService();
