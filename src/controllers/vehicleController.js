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

async function createVehicle(req, res) {
  const {
    vehicle_type_id,
    branch_id,
    plate_number,
    make,
    model,
    year_acquired,
    current_mileage
  } = req.body || {};

  if (
    !Number.isInteger(vehicle_type_id) ||
    vehicle_type_id <= 0 ||
    !Number.isInteger(branch_id) ||
    branch_id <= 0 ||
    typeof plate_number !== 'string' ||
    plate_number.trim() === ''
  ) {
    return res.status(400).json({
      error: 'Vehicle type, branch, and plate number are required'
    });
  }

  try {
    const vehicle = await vehicleService.createVehicle({
      vehicle_type_id,
      branch_id,
      plate_number: plate_number.trim(),
      make: make || null,
      model: model || null,
      year_acquired: year_acquired || null,
      current_mileage: current_mileage ?? null
    });

    return res.status(201).json({
      message: 'Vehicle registered successfully',
      vehicle_id: vehicle.vehicle_id
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Plate number already exists'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Invalid vehicle type or branch'
      });
    }

    console.error('Failed to register vehicle:', error.message);

    return res.status(500).json({
      error: 'Unable to register vehicle'
    });
  }
}

async function updateVehicle(req, res) {
  const vehicleId = req.params.id;

  if (!/^[1-9]\d*$/.test(vehicleId)) {
    return res.status(400).json({
      error: 'Vehicle ID must be a positive integer'
    });
  }

  const {
    vehicle_type_id,
    branch_id,
    plate_number,
    make,
    model,
    year_acquired,
    current_mileage
  } = req.body || {};

  if (
    !Number.isInteger(vehicle_type_id) ||
    vehicle_type_id <= 0 ||
    !Number.isInteger(branch_id) ||
    branch_id <= 0 ||
    typeof plate_number !== 'string' ||
    plate_number.trim() === ''
  ) {
    return res.status(400).json({
      error: 'Vehicle type, branch, and plate number are required'
    });
  }

  try {
    const vehicle = await vehicleService.updateVehicle(vehicleId, {
      vehicle_type_id,
      branch_id,
      plate_number: plate_number.trim(),
      make: make || null,
      model: model || null,
      year_acquired: year_acquired || null,
      current_mileage: current_mileage ?? null
    });

    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found'
      });
    }

    return res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle_id: vehicle.vehicle_id
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Plate number already exists'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Invalid vehicle type or branch'
      });
    }

    console.error('Failed to update vehicle:', error.message);

    return res.status(500).json({
      error: 'Unable to update vehicle'
    });
  }
}

async function deleteVehicle(req, res) {
  const vehicleId = req.params.id;

  if (!/^[1-9]\d*$/.test(vehicleId)) {
    return res.status(400).json({
      error: 'Vehicle ID must be a positive integer'
    });
  }

  try {
    const vehicle = await vehicleService.deleteVehicle(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found'
      });
    }

    return res.status(200).json({
      message: 'Vehicle deleted successfully',
      vehicle_id: vehicle.vehicle_id
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        error: 'Cannot delete this vehicle because it has related records'
      });
    }

    console.error('Failed to delete vehicle:', error.message);

    return res.status(500).json({
      error: 'Unable to delete vehicle'
    });
  }
}

module.exports = {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};