const express = require('express');
const router = express.Router();
const serviceRecordController = require('../controllers/serviceRecordController');
const { authenticateToken, employeeOnly, adminOnly, customerOnly } = require('../middlewares/auth');

// ========================
// ADMIN ROUTES
// ========================

// Transfer appointment to service record (create service from appointment)
router.post('/from-appointment/:id', authenticateToken, adminOnly, serviceRecordController.transferAppointmentToService);

// Update service status (pending → in-progress → completed)
router.patch('/:id/status', authenticateToken, adminOnly, serviceRecordController.updateServiceStatus);

// Get all service records (with filters) - Admin version
router.get('/admin/all', authenticateToken, adminOnly, serviceRecordController.getAllServiceRecords);

// ========================
// EMPLOYEE ROUTES
// ========================

// Get my assigned services
router.get('/my-assignments', authenticateToken, employeeOnly, serviceRecordController.getMyAssignedServices);

// Start service timer (only when status = in-progress)
router.post('/:id/start-timer', authenticateToken, employeeOnly, serviceRecordController.startServiceTimer);

// Stop service timer (only when status = in-progress)
router.post('/:id/stop-timer', authenticateToken, employeeOnly, serviceRecordController.stopServiceTimer);

// Update service progress (0-100% + live update message)
router.patch('/:id/progress', authenticateToken, employeeOnly, serviceRecordController.updateServiceProgress);

// Complete service (mark as completed)
router.post('/:id/complete', authenticateToken, employeeOnly, serviceRecordController.completeService);

// ========================
// CUSTOMER ROUTES
// ========================

// Get my services
router.get('/my-services', authenticateToken, customerOnly, serviceRecordController.getMyServices);

// ========================
// SHARED ROUTES
// ========================

// Get single service record details (all roles can view if authorized)
router.get('/:id', authenticateToken, serviceRecordController.getServiceRecordById);

module.exports = router;
