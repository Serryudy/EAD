const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middlewares/auth');

// All vehicle routes can be protected or public based on requirements
router.post('/', vehicleController.createVehicle);
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.get('/number/:vehicleNumber', vehicleController.getVehicleByNumber);
router.get('/:id/service-history', vehicleController.getVehicleServiceHistory);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
