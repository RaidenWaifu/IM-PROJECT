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

module.exports = {
  listVehicles
};
