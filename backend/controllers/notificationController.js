const Notification = require('../models/Notification');

class NotificationController {
  // Get all notifications for logged-in user
  async getNotifications(req, res) {
    try {
      console.log('📋 getNotifications called for user:', req.user._id, req.user.role);
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const userId = req.user._id;

      const query = { recipient: userId };
      if (unreadOnly === 'true') {
        query.isRead = false;
      }

      console.log('📋 Query:', JSON.stringify(query));
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('relatedEntity.entityId', 'appointmentNumber status')
        .lean();

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.getUnreadCount(userId);

      console.log(`📋 Found ${notifications.length} notifications (${unreadCount} unread) for user ${userId}`);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          },
          unreadCount
        }
      });
    } catch (error) {
      console.error('❌ Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const userId = req.user._id;
      const count = await Notification.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count',
        error: error.message
      });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const notification = await Notification.findOne({
        _id: id,
        recipient: userId
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.markAsRead();

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user._id;
      const result = await Notification.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
        data: { modifiedCount: result.modifiedCount }
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const notification = await Notification.findOneAndDelete({
        _id: id,
        recipient: userId
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  }

  // Delete all read notifications
  async deleteAllRead(req, res) {
    try {
      const userId = req.user._id;
      const result = await Notification.deleteMany({
        recipient: userId,
        isRead: true
      });

      res.json({
        success: true,
        message: 'All read notifications deleted',
        data: { deletedCount: result.deletedCount }
      });
    } catch (error) {
      console.error('Delete all read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notifications',
        error: error.message
      });
    }
  }

  // Get notification preferences
  async getPreferences(req, res) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user._id).select('notificationPreferences');

      res.json({
        success: true,
        data: user.notificationPreferences || {
          email: true,
          push: true,
          sms: false,
          types: {}
        }
      });
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch preferences',
        error: error.message
      });
    }
  }

  // Update notification preferences
  async updatePreferences(req, res) {
    try {
      const User = require('../models/User');
      const { email, push, sms, types } = req.body;

      const updateData = {};
      if (email !== undefined) updateData['notificationPreferences.email'] = email;
      if (push !== undefined) updateData['notificationPreferences.push'] = push;
      if (sms !== undefined) updateData['notificationPreferences.sms'] = sms;
      if (types) {
        Object.keys(types).forEach(key => {
          updateData[`notificationPreferences.types.${key}`] = types[key];
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, select: 'notificationPreferences' }
      );

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: user.notificationPreferences
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences',
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();
