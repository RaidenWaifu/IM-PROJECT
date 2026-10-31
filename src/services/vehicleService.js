const pool = require('../db');

const vehicleSelect = `
  SELECT
    v.vehicle_id,
    v.plate_number,
    v.make,
    v.model,
    v.year_acquired,
    v.current_mileage,
    v.vehicle_status,
    v.created_at,
    v.updated_at,
    b.branch_id,
    b.branch_name,
    vt.vehicle_type_id,
    vt.type_name AS vehicle_type_name,
    vt.fuel_type
  FROM public.vehicle AS v
  JOIN public.branch AS b
    ON b.branch_id = v.branch_id
  JOIN public.vehicle_type AS vt
    ON vt.vehicle_type_id = v.vehicle_type_id
`;

async function getAllVehicles() {
  const query = `
    ${vehicleSelect}
    ORDER BY v.vehicle_id;
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function getVehicleById(vehicleId) {
  const query = `
    ${vehicleSelect}
    WHERE v.vehicle_id = $1;
  `;

  const result = await pool.query(query, [vehicleId]);
  return result.rows[0] || null;
}

async function createVehicle(vehicleData) {
  const {
    vehicle_type_id,
    branch_id,
    plate_number,
    make,
    model,
    year_acquired,
    current_mileage
  } = vehicleData;

  const query = `
    INSERT INTO public.vehicle (
      vehicle_type_id,
      branch_id,
      plate_number,
      make,
      model,
      year_acquired,
      current_mileage
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING vehicle_id;
  `;

  const values = [
    vehicle_type_id,
    branch_id,
    plate_number,
    make,
    model,
    year_acquired,
    current_mileage
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function updateVehicle(vehicleId, vehicleData) {
  const {
    vehicle_type_id,
    branch_id,
    plate_number,
    make,
    model,
    year_acquired,
    current_mileage
  } = vehicleData;

  const query = `
    UPDATE public.vehicle
    SET
      vehicle_type_id = $1,
      branch_id = $2,
      plate_number = $3,
      make = $4,
      model = $5,
      year_acquired = $6,
      current_mileage = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE vehicle_id = $8
    RETURNING vehicle_id;
  `;

  const values = [
    vehicle_type_id,
    branch_id,
    plate_number,
    make,
    model,
    year_acquired,
    current_mileage,
    vehicleId
  ];

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

async function deleteVehicle(vehicleId) {
  const query = `
    DELETE FROM public.vehicle
    WHERE vehicle_id = $1
    RETURNING vehicle_id;
  `;

  const result = await pool.query(query, [vehicleId]);
  return result.rows[0] || null;
}

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
