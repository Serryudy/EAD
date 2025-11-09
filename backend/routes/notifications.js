const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all notifications for logged-in user
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Delete all read notifications
router.delete('/read/all', notificationController.deleteAllRead);

// Get notification preferences
router.get('/preferences', notificationController.getPreferences);

// Update notification preferences
router.patch('/preferences', notificationController.updatePreferences);

module.exports = router;
