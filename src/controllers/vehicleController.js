
const vehicleService = require('../services/vehicleService');

async function listVehicles(req, res) {
  try {
    const vehicles = await vehicleService.getAllVehicles();

    return res.status(200).json({
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Failed to retrieve vehicles:', error.message);

    return res.status(500).json({
      error: 'Unable to retrieve vehicles'
    });
  }
}

async function getVehicleById(req, res) {
  const vehicleId = req.params.id;

  // Accept only positive integer IDs.
  if (!/^[1-9]\d*$/.test(vehicleId)) {
    return res.status(400).json({
      error: 'Vehicle ID must be a positive integer'
    });
  }

  try {
    const vehicle = await vehicleService.getVehicleById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found'
      });
    }

    return res.status(200).json({
      data: vehicle
    });
  } catch (error) {
    console.error('Failed to retrieve vehicle:', error.message);

    return res.status(500).json({
      error: 'Unable to retrieve vehicle'
    });
  }
}

module.exports = {
  listVehicles,
  getVehicleById
};
