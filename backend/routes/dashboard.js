const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

// Dashboard routes
router.get('/stats', dashboardController.getDashboardStats);
router.get('/schedule/today', dashboardController.getTodaysSchedule);
router.get('/activity/recent', dashboardController.getRecentActivity);
router.get('/bookings/upcoming', dashboardController.getUpcomingBookings);
router.get('/service-progress/:appointmentId', dashboardController.getServiceProgress);
router.get('/calendar/events', dashboardController.getCalendarEvents);

module.exports = router;
