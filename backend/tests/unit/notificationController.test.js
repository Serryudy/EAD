const NotificationController = require('../../controllers/notificationController');
const Notification = require('../../models/Notification');
const User = require('../../models/User');

// Mock all dependencies
jest.mock('../../models/Notification');
jest.mock('../../models/User');

describe('NotificationController', () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      query: {},
      user: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock console methods to keep test output clean
    console.error = jest.fn();
    console.log = jest.fn();
  });

  // ========================
  // GET NOTIFICATIONS TESTS
  // ========================

  describe('getNotifications', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer',
      firstName: 'John',
      lastName: 'Doe'
    };

    const mockNotifications = [
      {
        _id: 'notif1',
        recipient: 'user123',
        type: 'appointment_confirmed',
        title: 'Appointment Confirmed',
        message: 'Your appointment has been confirmed for tomorrow at 10:00 AM',
        isRead: false,
        priority: 'high',
        createdAt: new Date('2025-11-14T10:00:00Z'),
        relatedEntity: {
          entityType: 'Appointment',
          entityId: { appointmentNumber: 'APT001', status: 'confirmed' }
        }
      },
      {
        _id: 'notif2',
        recipient: 'user123',
        type: 'service_completed',
        title: 'Service Completed',
        message: 'Your vehicle service has been completed',
        isRead: true,
        priority: 'medium',
        createdAt: new Date('2025-11-13T14:30:00Z'),
        relatedEntity: {
          entityType: 'ServiceRecord',
          entityId: { _id: 'service1' }
        }
      }
    ];

    beforeEach(() => {
      req.user = mockUser;
      req.query = { page: 1, limit: 20 };

      // Mock Notification.find chain
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockNotifications)
      };

      Notification.find = jest.fn().mockReturnValue(mockQuery);
      Notification.countDocuments = jest.fn().mockResolvedValue(2);
      Notification.getUnreadCount = jest.fn().mockResolvedValue(1);
    });

    it('should get notifications successfully', async () => {
      await NotificationController.getNotifications(req, res);

      expect(Notification.find).toHaveBeenCalledWith({ recipient: 'user123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          notifications: mockNotifications,
          pagination: {
            total: 2,
            page: 1,
            limit: 20,
            pages: 1
          },
          unreadCount: 1
        }
      });
    });

    it('should filter unread notifications when unreadOnly is true', async () => {
      req.query = { page: 1, limit: 20, unreadOnly: 'true' };

      await NotificationController.getNotifications(req, res);

      expect(Notification.find).toHaveBeenCalledWith({
        recipient: 'user123',
        isRead: false
      });
    });

    it('should handle pagination correctly', async () => {
      req.query = { page: 2, limit: 10 };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Notification.find = jest.fn().mockReturnValue(mockQuery);
      Notification.countDocuments = jest.fn().mockResolvedValue(25);
      Notification.getUnreadCount = jest.fn().mockResolvedValue(5);

      await NotificationController.getNotifications(req, res);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.skip).toHaveBeenCalledWith(10); // (page-1) * limit = 1 * 10

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          pagination: {
            total: 25,
            page: 2,
            limit: 10,
            pages: 3
          }
        })
      });
    });

    it('should handle empty notifications', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Notification.find = jest.fn().mockReturnValue(mockQuery);
      Notification.countDocuments = jest.fn().mockResolvedValue(0);
      Notification.getUnreadCount = jest.fn().mockResolvedValue(0);

      await NotificationController.getNotifications(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          notifications: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 20,
            pages: 0
          },
          unreadCount: 0
        }
      });
    });

    it('should handle database errors', async () => {
      Notification.find = jest.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await NotificationController.getNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch notifications',
        error: 'Database connection failed'
      });
    });
  });

  // ========================
  // GET UNREAD COUNT TESTS
  // ========================

  describe('getUnreadCount', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockUser;
    });

    it('should get unread count successfully', async () => {
      Notification.getUnreadCount = jest.fn().mockResolvedValue(5);

      await NotificationController.getUnreadCount(req, res);

      expect(Notification.getUnreadCount).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { count: 5 }
      });
    });

    it('should handle zero unread count', async () => {
      Notification.getUnreadCount = jest.fn().mockResolvedValue(0);

      await NotificationController.getUnreadCount(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { count: 0 }
      });
    });

    it('should handle database errors', async () => {
      Notification.getUnreadCount = jest.fn().mockRejectedValue(new Error('Database error'));

      await NotificationController.getUnreadCount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch unread count',
        error: 'Database error'
      });
    });
  });

  // ========================
  // MARK AS READ TESTS
  // ========================

  describe('markAsRead', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer'
    };

    const mockNotification = {
      _id: 'notif123',
      recipient: 'user123',
      type: 'appointment_confirmed',
      title: 'Test Notification',
      message: 'Test message',
      isRead: false,
      markAsRead: jest.fn().mockResolvedValue(true)
    };

    beforeEach(() => {
      req.user = mockUser;
      req.params = { id: 'notif123' };
    });

    it('should mark notification as read successfully', async () => {
      Notification.findOne = jest.fn().mockResolvedValue(mockNotification);

      await NotificationController.markAsRead(req, res);

      expect(Notification.findOne).toHaveBeenCalledWith({
        _id: 'notif123',
        recipient: 'user123'
      });
      expect(mockNotification.markAsRead).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification marked as read',
        data: mockNotification
      });
    });

    it('should return 404 if notification not found', async () => {
      Notification.findOne = jest.fn().mockResolvedValue(null);

      await NotificationController.markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Notification not found'
      });
    });

    it('should not allow marking another user\'s notification', async () => {
      req.params = { id: 'other_notif' };
      Notification.findOne = jest.fn().mockResolvedValue(null);

      await NotificationController.markAsRead(req, res);

      expect(Notification.findOne).toHaveBeenCalledWith({
        _id: 'other_notif',
        recipient: 'user123'
      });
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle database errors', async () => {
      Notification.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      await NotificationController.markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to mark notification as read',
        error: 'Database error'
      });
    });
  });

  // ========================
  // MARK ALL AS READ TESTS
  // ========================

  describe('markAllAsRead', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockUser;
    });

    it('should mark all notifications as read successfully', async () => {
      const mockResult = { modifiedCount: 3 };
      Notification.markAllAsRead = jest.fn().mockResolvedValue(mockResult);

      await NotificationController.markAllAsRead(req, res);

      expect(Notification.markAllAsRead).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'All notifications marked as read',
        data: { modifiedCount: 3 }
      });
    });

    it('should handle case when no unread notifications exist', async () => {
      const mockResult = { modifiedCount: 0 };
      Notification.markAllAsRead = jest.fn().mockResolvedValue(mockResult);

      await NotificationController.markAllAsRead(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'All notifications marked as read',
        data: { modifiedCount: 0 }
      });
    });

    it('should handle database errors', async () => {
      Notification.markAllAsRead = jest.fn().mockRejectedValue(new Error('Update failed'));

      await NotificationController.markAllAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: 'Update failed'
      });
    });
  });

  // ========================
  // DELETE NOTIFICATION TESTS
  // ========================

  describe('deleteNotification', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockUser;
      req.params = { id: 'notif123' };
    });

    it('should delete notification successfully', async () => {
      const mockNotification = {
        _id: 'notif123',
        recipient: 'user123',
        title: 'Test Notification'
      };

      Notification.findOneAndDelete = jest.fn().mockResolvedValue(mockNotification);

      await NotificationController.deleteNotification(req, res);

      expect(Notification.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'notif123',
        recipient: 'user123'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification deleted successfully'
      });
    });

    it('should return 404 if notification not found', async () => {
      Notification.findOneAndDelete = jest.fn().mockResolvedValue(null);

      await NotificationController.deleteNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Notification not found'
      });
    });

    it('should handle database errors', async () => {
      Notification.findOneAndDelete = jest.fn().mockRejectedValue(new Error('Delete failed'));

      await NotificationController.deleteNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete notification',
        error: 'Delete failed'
      });
    });
  });

  // ========================
  // DELETE ALL READ TESTS
  // ========================

  describe('deleteAllRead', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockUser;
    });

    it('should delete all read notifications successfully', async () => {
      const mockResult = { deletedCount: 5 };
      Notification.deleteMany = jest.fn().mockResolvedValue(mockResult);

      await NotificationController.deleteAllRead(req, res);

      expect(Notification.deleteMany).toHaveBeenCalledWith({
        recipient: 'user123',
        isRead: true
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'All read notifications deleted',
        data: { deletedCount: 5 }
      });
    });

    it('should handle case when no read notifications exist', async () => {
      const mockResult = { deletedCount: 0 };
      Notification.deleteMany = jest.fn().mockResolvedValue(mockResult);

      await NotificationController.deleteAllRead(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'All read notifications deleted',
        data: { deletedCount: 0 }
      });
    });

    it('should handle database errors', async () => {
      Notification.deleteMany = jest.fn().mockRejectedValue(new Error('Delete operation failed'));

      await NotificationController.deleteAllRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete notifications',
        error: 'Delete operation failed'
      });
    });
  });

  // ========================
  // GET PREFERENCES TESTS
  // ========================

  describe('getPreferences', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockUser;
    });

    it('should get user notification preferences successfully', async () => {
      const mockUserWithPreferences = {
        _id: 'user123',
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
          types: {
            appointment_confirmed: true,
            service_completed: true,
            payment_reminder: false
          }
        }
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUserWithPreferences)
      };

      User.findById = jest.fn().mockReturnValue(mockQuery);

      await NotificationController.getPreferences(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockQuery.select).toHaveBeenCalledWith('notificationPreferences');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUserWithPreferences.notificationPreferences
      });
    });

    it('should return default preferences when user has none', async () => {
      const mockUserWithoutPreferences = {
        _id: 'user123',
        notificationPreferences: null
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUserWithoutPreferences)
      };

      User.findById = jest.fn().mockReturnValue(mockQuery);

      await NotificationController.getPreferences(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          email: true,
          push: true,
          sms: false,
          types: {}
        }
      });
    });

    it('should handle database errors', async () => {
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('User not found');
      });

      await NotificationController.getPreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch preferences',
        error: 'User not found'
      });
    });
  });

  // ========================
  // UPDATE PREFERENCES TESTS
  // ========================

  describe('updatePreferences', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockUser;
    });

    it('should update notification preferences successfully', async () => {
      req.body = {
        email: false,
        push: true,
        sms: true,
        types: {
          appointment_confirmed: true,
          service_completed: false,
          payment_reminder: true
        }
      };

      const mockUpdatedUser = {
        _id: 'user123',
        notificationPreferences: {
          email: false,
          push: true,
          sms: true,
          types: {
            appointment_confirmed: true,
            service_completed: false,
            payment_reminder: true
          }
        }
      };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedUser);

      await NotificationController.updatePreferences(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        {
          $set: {
            'notificationPreferences.email': false,
            'notificationPreferences.push': true,
            'notificationPreferences.sms': true,
            'notificationPreferences.types.appointment_confirmed': true,
            'notificationPreferences.types.service_completed': false,
            'notificationPreferences.types.payment_reminder': true
          }
        },
        { new: true, select: 'notificationPreferences' }
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Preferences updated successfully',
        data: mockUpdatedUser.notificationPreferences
      });
    });

    it('should update partial preferences', async () => {
      req.body = {
        email: false,
        types: {
          appointment_confirmed: false
        }
      };

      const mockUpdatedUser = {
        notificationPreferences: {
          email: false,
          push: true,
          sms: false,
          types: {
            appointment_confirmed: false
          }
        }
      };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedUser);

      await NotificationController.updatePreferences(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        {
          $set: {
            'notificationPreferences.email': false,
            'notificationPreferences.types.appointment_confirmed': false
          }
        },
        { new: true, select: 'notificationPreferences' }
      );
    });

    it('should handle empty update body', async () => {
      req.body = {};

      const mockUser = {
        notificationPreferences: {
          email: true,
          push: true,
          sms: false
        }
      };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await NotificationController.updatePreferences(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: {} },
        { new: true, select: 'notificationPreferences' }
      );
    });

    it('should handle database errors', async () => {
      req.body = { email: false };
      User.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));

      await NotificationController.updatePreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update preferences',
        error: 'Update failed'
      });
    });
  });

  // ========================
  // INTEGRATION TESTS
  // ========================

  describe('Integration Scenarios', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockUser;
    });

    it('should handle notification workflow: create -> read -> delete', async () => {
      // Mock notification creation (would be done by notification service)
      const mockNotification = {
        _id: 'notif123',
        recipient: 'user123',
        type: 'appointment_confirmed',
        title: 'Appointment Confirmed',
        message: 'Your appointment has been confirmed',
        isRead: false,
        markAsRead: jest.fn().mockResolvedValue(true)
      };

      // 1. Mark as read
      req.params = { id: 'notif123' };
      Notification.findOne = jest.fn().mockResolvedValue(mockNotification);

      await NotificationController.markAsRead(req, res);
      expect(mockNotification.markAsRead).toHaveBeenCalled();

      // 2. Delete notification
      Notification.findOneAndDelete = jest.fn().mockResolvedValue(mockNotification);

      await NotificationController.deleteNotification(req, res);
      expect(Notification.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'notif123',
        recipient: 'user123'
      });
    });

    it('should handle bulk operations correctly', async () => {
      // Mark all as read
      Notification.markAllAsRead = jest.fn().mockResolvedValue({ modifiedCount: 5 });

      await NotificationController.markAllAsRead(req, res);
      expect(Notification.markAllAsRead).toHaveBeenCalledWith('user123');

      // Delete all read
      Notification.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 5 });

      await NotificationController.deleteAllRead(req, res);
      expect(Notification.deleteMany).toHaveBeenCalledWith({
        recipient: 'user123',
        isRead: true
      });
    });
  });

  // ========================
  // EDGE CASES AND ERROR HANDLING
  // ========================

  describe('Edge Cases', () => {
    const mockUser = {
      _id: 'user123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockUser;
    });

    it('should handle invalid notification ID format', async () => {
      req.params = { id: 'invalid-id' };
      
      const error = new Error('Invalid ObjectId');
      error.name = 'CastError';
      
      Notification.findOne = jest.fn().mockRejectedValue(error);

      await NotificationController.markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to mark notification as read',
        error: 'Invalid ObjectId'
      });
    });

    it('should handle concurrent access to notifications', async () => {
      // Simulate a notification being deleted by another process
      const mockNotification = {
        _id: 'notif123',
        markAsRead: jest.fn().mockRejectedValue(new Error('Document not found'))
      };

      req.params = { id: 'notif123' };
      Notification.findOne = jest.fn().mockResolvedValue(mockNotification);

      await NotificationController.markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});