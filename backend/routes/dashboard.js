const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

// All dashboard routes require authentication
router.get('/stats', protect, dashboardController.getDashboardStats);
router.get('/schedule/today', protect, dashboardController.getTodaysSchedule);
router.get('/activity/recent', protect, dashboardController.getRecentActivity);
router.get('/bookings/upcoming', protect, dashboardController.getUpcomingBookings);
router.get('/service-progress/:appointmentId', protect, dashboardController.getServiceProgress);
router.get('/calendar/events', protect, dashboardController.getCalendarEvents);

module.exports = router;
