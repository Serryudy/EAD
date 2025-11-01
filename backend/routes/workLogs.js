const express = require('express');
const router = express.Router();
const workLogController = require('../controllers/workLogController');
const { protect } = require('../middlewares/auth');

// Work log routes - typically protected
router.post('/', workLogController.createWorkLog);
router.get('/', workLogController.getAllWorkLogs);
router.get('/appointment/:appointmentId', workLogController.getWorkLogsByAppointment);
router.get('/technician/:technicianId/summary', workLogController.getTechnicianWorkSummary);
router.get('/:id', workLogController.getWorkLogById);
router.put('/:id', workLogController.updateWorkLog);
router.patch('/:id/complete', workLogController.completeWorkLog);
router.delete('/:id', workLogController.deleteWorkLog);

module.exports = router;
