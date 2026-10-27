
const express = require('express');
const vehicleController = require('../controllers/vehicleController');

const router = express.Router();

router.get('/', vehicleController.listVehicles);
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;
