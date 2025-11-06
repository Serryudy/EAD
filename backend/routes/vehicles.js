const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middlewares/auth');

// All vehicle routes require authentication
router.post('/', protect, vehicleController.createVehicle);
router.get('/', protect, vehicleController.getAllVehicles);
router.get('/:id', protect, vehicleController.getVehicleById);
router.get('/number/:vehicleNumber', protect, vehicleController.getVehicleByNumber);
router.get('/:id/service-history', protect, vehicleController.getVehicleServiceHistory);
router.put('/:id', protect, vehicleController.updateVehicle);
router.delete('/:id', protect, vehicleController.deleteVehicle);

module.exports = router;
