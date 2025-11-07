const Notification = require('../models/Notification');
const emailNotificationService = require('./emailNotificationService');
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
            
            // Send unread count
            const unreadCount = await Notification.getUnreadCount(userId);
            socket.emit('unread_count', { count: unreadCount });
          }
        } catch (error) {
          console.error('Socket authentication error:', error);
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
      // Get user and check preferences
      const user = await User.findById(userId);
      if (!user) {
        console.warn(`User ${userId} not found`);
        return null;
      }

      // Check if user wants this type of notification
      const prefs = user.notificationPreferences;
      if (prefs && prefs.types && prefs.types[notificationData.type] === false) {
        console.log(`User ${userId} has disabled ${notificationData.type} notifications`);
        return null;
      }

      // Create notification in database (in-app notification)
      let notification = null;
      if (!prefs || prefs.push !== false) {
        notification = await Notification.createNotification({
          recipient: userId,
          ...notificationData
        });

        // Send via Socket.io if user is connected
        if (this.io) {
          this.io.to(`user_${userId}`).emit('new_notification', {
            notification,
            unreadCount: await Notification.getUnreadCount(userId)
          });
        }
      }

      // Send email notification if enabled and user has email
      if (user.email && (!prefs || prefs.email !== false)) {
        await this.sendEmailNotification(notificationData.type, user, notificationData);
      }

      return notification;
    } catch (error) {
      console.error('Send notification error:', error);
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
    return await this.sendToUser(customerId, {
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
      appointment // Pass for email
    });
  }

  async notifyAppointmentConfirmed(appointment, customerId) {
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
      appointment // Pass for email
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
      serviceRecord // Pass for email
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
