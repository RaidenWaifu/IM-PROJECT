
const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', vehicleController.listVehicles);
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;
