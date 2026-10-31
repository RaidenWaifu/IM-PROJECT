const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

// Drivers
router.get('/drivers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.driver_id,
        d.employee_id,
        e.first_name,
        e.last_name,
        e.contact_number,
        e.email,
        e.employment_status,
        e.branch_id,
        b.branch_name,
        d.license_number,
        d.license_expiry
      FROM public.driver d
      JOIN public.employee e ON e.employee_id = d.employee_id
      LEFT JOIN public.branch b ON b.branch_id = e.branch_id
      ORDER BY d.driver_id
    `);

    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('List drivers error:', error);
    res.status(500).json({ error: 'Failed to retrieve drivers.' });
  }
});

// Trips
router.get('/trips', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.trip_id,
        t.trip_date,
        t.origin,
        t.destination,
        t.starting_mileage,
        t.ending_mileage,
        t.trip_status,
        t.purpose,
        t.vehicle_id,
        v.plate_number,
        t.driver_id,
        e.first_name AS driver_first_name,
        e.last_name AS driver_last_name,
        t.branch_id,
        b.branch_name
      FROM public.trip t
      LEFT JOIN public.vehicle v ON v.vehicle_id = t.vehicle_id
      LEFT JOIN public.driver d ON d.driver_id = t.driver_id
      LEFT JOIN public.employee e ON e.employee_id = d.employee_id
      LEFT JOIN public.branch b ON b.branch_id = t.branch_id
      ORDER BY t.trip_date DESC, t.trip_id DESC
    `);

    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('List trips error:', error);
    res.status(500).json({ error: 'Failed to retrieve trips.' });
  }
});

// Maintenance
router.get('/maintenance', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.maintenance_id,
        m.vehicle_id,
        v.plate_number,
        m.technician_id,
        e.first_name AS technician_first_name,
        e.last_name AS technician_last_name,
        m.maintenance_date,
        m.maintenance_type,
        m.description,
        m.status,
        m.labor_cost,
        m.total_cost,
        m.completed_at
      FROM public.maintenance m
      LEFT JOIN public.vehicle v ON v.vehicle_id = m.vehicle_id
      LEFT JOIN public.technician tech ON tech.technician_id = m.technician_id
      LEFT JOIN public.employee e ON e.employee_id = tech.employee_id
      ORDER BY m.maintenance_date DESC, m.maintenance_id DESC
    `);

    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('List maintenance error:', error);
    res.status(500).json({ error: 'Failed to retrieve maintenance records.' });
  }
});

// Fuel records
router.get('/fuel-records', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        f.fuel_record_id,
        f.vehicle_id,
        v.plate_number,
        f.trip_id,
        f.fuel_date,
        f.liters,
        f.price_per_liter,
        f.total_cost,
        f.odometer_reading,
        f.fuel_station
      FROM public.fuel_record f
      LEFT JOIN public.vehicle v ON v.vehicle_id = f.vehicle_id
      ORDER BY f.fuel_date DESC, f.fuel_record_id DESC
    `);

    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('List fuel records error:', error);
    res.status(500).json({ error: 'Failed to retrieve fuel records.' });
  }
});

// Dashboard report totals
router.get('/reports', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM public.vehicle) AS total_vehicles,
        (SELECT COUNT(*) FROM public.driver) AS total_drivers,
        (SELECT COUNT(*) FROM public.trip) AS total_trips,
        (SELECT COUNT(*) FROM public.maintenance) AS total_maintenance_records,
        (SELECT COUNT(*) FROM public.fuel_record) AS total_fuel_records,
        (SELECT COALESCE(SUM(total_cost), 0) FROM public.maintenance) AS maintenance_cost,
        (SELECT COALESCE(SUM(total_cost), 0) FROM public.fuel_record) AS fuel_cost
    `);

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Failed to retrieve report totals.' });
  }
});

module.exports = router;
