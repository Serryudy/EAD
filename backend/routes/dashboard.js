const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, employeeOnly, adminOnly, customerOnly } = require('../middlewares/auth');

// ========================
// EMPLOYEE ANALYTICS ROUTES
// ========================
router.get('/employee/weekly-workload', authenticateToken, employeeOnly, dashboardController.getEmployeeWeeklyWorkload);

// ========================
// ADMIN ANALYTICS ROUTES
// ========================
router.get('/admin/revenue', authenticateToken, adminOnly, dashboardController.getRevenueAnalytics);
router.get('/admin/services-completed', authenticateToken, adminOnly, dashboardController.getServicesCompletedAnalytics);
router.get('/admin/stats', authenticateToken, adminOnly, dashboardController.getAdminDashboardStats);
router.get('/admin/employee-performance', authenticateToken, adminOnly, dashboardController.getEmployeePerformanceStats);

// ========================
// CUSTOMER DASHBOARD ROUTES
// ========================
router.get('/customer/stats', authenticateToken, customerOnly, dashboardController.getCustomerDashboardStats);

// ========================
// LEGACY ROUTES (KEEP FOR COMPATIBILITY)
// ========================
router.get('/stats', authenticateToken, dashboardController.getDashboardStats);
router.get('/schedule/today', authenticateToken, dashboardController.getTodaysSchedule);
router.get('/activity/recent', authenticateToken, dashboardController.getRecentActivity);
router.get('/bookings/upcoming', authenticateToken, dashboardController.getUpcomingBookings);
router.get('/service-progress/:appointmentId', authenticateToken, dashboardController.getServiceProgress);
router.get('/calendar/events', authenticateToken, dashboardController.getCalendarEvents);

module.exports = router;
