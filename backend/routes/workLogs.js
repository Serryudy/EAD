const express = require('express');
const router = express.Router();
const workLogController = require('../controllers/workLogController');
const { protect } = require('../middlewares/auth');

// All work log routes require authentication
router.post('/', protect, workLogController.createWorkLog);
router.get('/', protect, workLogController.getAllWorkLogs);
router.get('/appointment/:appointmentId', protect, workLogController.getWorkLogsByAppointment);
router.get('/technician/:technicianId/summary', protect, workLogController.getTechnicianWorkSummary);
router.get('/:id', protect, workLogController.getWorkLogById);
router.put('/:id', protect, workLogController.updateWorkLog);
router.patch('/:id/complete', protect, workLogController.completeWorkLog);
router.delete('/:id', protect, workLogController.deleteWorkLog);

module.exports = router;
