const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, optionalAuth } = require('../middlewares/auth');

// Public routes - anyone can view services
router.get('/', serviceController.getAllServices);
router.get('/popular', serviceController.getPopularServices);
router.get('/category/:category', serviceController.getServicesByCategory);
router.get('/code/:code', serviceController.getServiceByCode);
router.get('/:id', serviceController.getServiceById);

// Protected routes - only authenticated users can modify
router.post('/', protect, serviceController.createService);
router.put('/:id', protect, serviceController.updateService);
router.patch('/:id/increment-booking', protect, serviceController.incrementBookingCount);
router.delete('/:id', protect, serviceController.deleteService);

module.exports = router;
