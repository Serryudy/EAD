const express = require('express');
const router = express.Router();
const serviceRecordController = require('../controllers/serviceRecordController');
const { protect } = require('../middlewares/auth');

// All routes should be protected (employee access only)

// Start service for an appointment
router.post('/start/:appointmentId', protect, serviceRecordController.startService);

// Get service record by appointment ID
router.get('/appointment/:appointmentId', protect, serviceRecordController.getServiceRecordByAppointment);

// Get all service records
router.get('/', protect, serviceRecordController.getAllServiceRecords);

// Get service record by ID
router.get('/:id', protect, serviceRecordController.getServiceRecordById);

// Update service progress
router.patch('/:id/progress', protect, serviceRecordController.updateServiceProgress);

// Add work log to service record
router.post('/:id/worklog', protect, serviceRecordController.addWorkLog);

// Complete service
router.patch('/:id/complete', protect, serviceRecordController.completeService);

module.exports = router;
