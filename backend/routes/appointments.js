const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middlewares/auth');

// Public routes (or routes that can work without auth)
router.post('/', appointmentController.createAppointment);

// Protected routes
router.get('/', appointmentController.getAllAppointments);
router.get('/stats', appointmentController.getAppointmentStats);
router.get('/employee/:employeeId', appointmentController.getEmployeeAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);
router.patch('/:id/reschedule', appointmentController.rescheduleAppointment);
router.patch('/:id/assign', appointmentController.assignEmployee);
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;
