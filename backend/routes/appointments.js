const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middlewares/auth');

// All routes require authentication now (no more guest appointments)
router.post('/', protect, appointmentController.createAppointment);
router.get('/', protect, appointmentController.getAllAppointments);
router.get('/stats', protect, appointmentController.getAppointmentStats);
router.get('/check-availability', protect, appointmentController.checkEmployeeAvailability);
router.get('/employee/:employeeId', protect, appointmentController.getEmployeeAppointments);
router.get('/:id', protect, appointmentController.getAppointmentById);
router.put('/:id', protect, appointmentController.updateAppointment);
router.patch('/:id/status', protect, appointmentController.updateAppointmentStatus);
router.patch('/:id/reschedule', protect, appointmentController.rescheduleAppointment);
router.patch('/:id/assign', protect, appointmentController.assignEmployee);
router.patch('/:id/cancel', protect, appointmentController.cancelAppointment);

module.exports = router;
