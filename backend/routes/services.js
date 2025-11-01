const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect } = require('../middlewares/auth');

// Public routes - anyone can view services
router.get('/', serviceController.getAllServices);
router.get('/popular', serviceController.getPopularServices);
router.get('/category/:category', serviceController.getServicesByCategory);
router.get('/code/:code', serviceController.getServiceByCode);
router.get('/:id', serviceController.getServiceById);

// Protected routes - only admins/employees can modify
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.patch('/:id/increment-booking', serviceController.incrementBookingCount);
router.delete('/:id', serviceController.deleteService);

module.exports = router;
