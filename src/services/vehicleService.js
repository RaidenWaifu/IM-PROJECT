const pool = require('../db');

async function getAllVehicles() {
  const query = `
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
    ORDER BY v.vehicle_id;
  `;

  const result = await pool.query(query);
  return result.rows;
}

module.exports = {
  getAllVehicles
};
