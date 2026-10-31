-- 001_seed_test_data.sql
-- FleetTrack sample data for fleettrack_db (development/test database ONLY).
-- All records are fictional and marked TEST. Every test row uses an ID of 9001 or higher
-- so it can be found and removed safely with 002_cleanup_test_data.sql.
-- Run AFTER 001_create_fleettrack_tables.sql. Run it once; running it twice fails on duplicate IDs.
-- Parent tables are inserted before the child tables that reference them.

BEGIN;

INSERT INTO role (role_id, role_name, description) VALUES
(9001, 'TEST Admin',         'Test role - full access'),
(9002, 'TEST Fleet Manager', 'Test role - manages vehicles and trips'),
(9003, 'TEST Inspector',     'Test role - records inspections');

INSERT INTO branch (branch_id, branch_name, address, city, contact_number, branch_status) VALUES
(9001, 'TEST Branch North', '1 Test Street',  'Test City A', '000-0001', 'Active'),
(9002, 'TEST Branch South', '2 Sample Avenue', 'Test City B', '000-0002', 'Active');

INSERT INTO employee (employee_id, branch_id, first_name, last_name, contact_number, email, employment_status) VALUES
(9001, 9001, 'Test', 'Admin',      '000-1001', 'test.admin@example.test',      'Active'),
(9002, 9001, 'Test', 'Manager',    '000-1002', 'test.manager@example.test',    'Active'),
(9003, 9001, 'Test', 'Inspector',  '000-1003', 'test.inspector@example.test',  'Active'),
(9004, 9001, 'Test', 'DriverOne',  '000-1004', 'test.driver1@example.test',    'Active'),
(9005, 9002, 'Test', 'DriverTwo',  '000-1005', 'test.driver2@example.test',    'Active'),
(9006, 9001, 'Test', 'Technician', '000-1006', 'test.technician@example.test', 'Active');

INSERT INTO user_account (user_id, employee_id, role_id, username, password_hash, account_status) VALUES
(9001, 9001, 9001, 'test_admin',     'TEST_NOT_A_REAL_HASH', 'Active'),
(9002, 9002, 9002, 'test_manager',   'TEST_NOT_A_REAL_HASH', 'Active'),
(9003, 9003, 9003, 'test_inspector', 'TEST_NOT_A_REAL_HASH', 'Active');

INSERT INTO driver (driver_id, employee_id, license_number, license_expiry) VALUES
(9001, 9004, 'TEST-LIC-0001', '2028-12-31'),
(9002, 9005, 'TEST-LIC-0002', '2027-06-30');

INSERT INTO technician (technician_id, employee_id, specialization) VALUES
(9001, 9006, 'Engine and brakes');

INSERT INTO vehicle_type (vehicle_type_id, type_name, description, fuel_type, standard_capacity) VALUES
(9001, 'TEST Van',   'Test vehicle type - van',   'Diesel',   1000.00),
(9002, 'TEST Sedan', 'Test vehicle type - sedan', 'Gasoline',  400.00);

INSERT INTO vehicle (vehicle_id, vehicle_type_id, branch_id, plate_number, make, model, year_acquired, current_mileage, vehicle_status) VALUES
(9001, 9001, 9001, 'TEST-001', 'TestMake', 'Van A',   2021, 45200.5, 'Available'),
(9002, 9002, 9001, 'TEST-002', 'TestMake', 'Sedan B', 2022, 28900.0, 'In Use'),
(9003, 9001, 9002, 'TEST-003', 'TestMake', 'Van C',   2020, 61000.0, 'Under Maintenance');

INSERT INTO vehicle_assignment (assignment_id, vehicle_id, driver_id, assigned_from, assigned_until, assignment_status, assignment_notes) VALUES
(9001, 9001, 9001, '2026-01-01', NULL, 'Active', 'Test assignment'),
(9002, 9002, 9002, '2026-03-01', NULL, 'Active', 'Test assignment');

INSERT INTO trip (trip_id, vehicle_id, driver_id, branch_id, trip_date, origin, destination, starting_mileage, ending_mileage, trip_status, purpose) VALUES
(9001, 9001, 9001, 9001, '2026-09-10', 'Test Depot A', 'Test Site B', 45000.0, 45200.5, 'Completed', 'Test delivery'),
(9002, 9002, 9002, 9001, '2026-09-15', 'Test Depot A', 'Test Site C', 28750.0, 28900.0, 'Completed', 'Test pickup'),
(9003, 9002, 9002, 9001, '2026-10-01', 'Test Depot A', 'Test Site D', 28900.0, NULL,    'Ongoing',   'Test route');

INSERT INTO fuel_record (fuel_record_id, vehicle_id, trip_id, fuel_date, liters, price_per_liter, total_cost, odometer_reading, fuel_station) VALUES
(9001, 9001, 9001, '2026-09-10', 40.00, 60.00, 2400.00, 45100.0, 'TEST Fuel Station'),
(9002, 9002, 9002, '2026-09-15', 30.00, 62.50, 1875.00, 28800.0, 'TEST Fuel Station'),
(9003, 9001, NULL, '2026-09-20', 35.00, 61.00, 2135.00, 45200.5, 'TEST Fuel Station');

INSERT INTO inspection (inspection_id, vehicle_id, user_id, inspection_date, odometer_reading, inspection_type, result, remarks) VALUES
(9001, 9001, 9003, '2026-09-01', 45000.0, 'Routine',  'Pass', 'Test inspection - no issues'),
(9002, 9003, 9003, '2026-09-05', 60900.0, 'Pre-trip', 'Fail', 'Test inspection - worn brakes');

INSERT INTO part (part_id, part_name, part_number, category, unit_cost, stock_quantity, reorder_level, part_status) VALUES
(9001, 'TEST Brake Pad Set', 'TEST-P-001', 'Brakes', 900.00, 20,  5, 'Active'),
(9002, 'TEST Brake Fluid',   'TEST-P-002', 'Fluids',  300.00, 50, 10, 'Active'),
(9003, 'TEST Oil Filter',    'TEST-P-003', 'Engine',  250.00, 30, 10, 'Active');

INSERT INTO maintenance (maintenance_id, vehicle_id, technician_id, maintenance_date, maintenance_type, description, status, labor_cost, total_cost, completed_at) VALUES
(9001, 9003, 9001, '2026-09-06', 'Repair',     'Test brake service', 'Completed', 1500.00, 3000.00, '2026-09-07 16:00:00'),
(9002, 9001, 9001, '2026-10-05', 'Preventive', 'Test oil change',    'Scheduled',  500.00,  750.00, NULL);

INSERT INTO maintenance_part (maintenance_id, part_id, quantity_used, unit_cost, total_cost) VALUES
(9001, 9001, 1, 900.00,  900.00),
(9001, 9002, 2, 300.00,  600.00),
(9002, 9003, 1, 250.00,  250.00);

INSERT INTO vehicle_status_history (status_history_id, vehicle_id, user_id, previous_status, new_status, changed_at, reason) VALUES
(9001, 9003, 9002, 'Available', 'Under Maintenance', '2026-09-06 08:00:00', 'Test: brake repair'),
(9002, 9002, 9002, 'Available', 'In Use',            '2026-10-01 07:30:00', 'Test: trip started');

INSERT INTO audit_log (audit_id, user_id, table_name, record_id, action_type, old_values, new_values, action_timestamp) VALUES
(9001, 9002, 'vehicle', 9003, 'UPDATE', 'status=Available', 'status=Under Maintenance', '2026-09-06 08:00:00'),
(9002, NULL, 'trip',    9003, 'INSERT', NULL,               'Test trip row',            '2026-10-01 07:30:00');

COMMIT;

-- Quick check: every count should match the expected number.
SELECT 'role' AS table_name, COUNT(*) AS test_rows, 3 AS expected FROM role WHERE role_id >= 9000
UNION ALL SELECT 'branch', COUNT(*), 2 FROM branch WHERE branch_id >= 9000
UNION ALL SELECT 'employee', COUNT(*), 6 FROM employee WHERE employee_id >= 9000
UNION ALL SELECT 'user_account', COUNT(*), 3 FROM user_account WHERE user_id >= 9000
UNION ALL SELECT 'driver', COUNT(*), 2 FROM driver WHERE driver_id >= 9000
UNION ALL SELECT 'technician', COUNT(*), 1 FROM technician WHERE technician_id >= 9000
UNION ALL SELECT 'vehicle_type', COUNT(*), 2 FROM vehicle_type WHERE vehicle_type_id >= 9000
UNION ALL SELECT 'vehicle', COUNT(*), 3 FROM vehicle WHERE vehicle_id >= 9000
UNION ALL SELECT 'vehicle_assignment', COUNT(*), 2 FROM vehicle_assignment WHERE assignment_id >= 9000
UNION ALL SELECT 'trip', COUNT(*), 3 FROM trip WHERE trip_id >= 9000
UNION ALL SELECT 'fuel_record', COUNT(*), 3 FROM fuel_record WHERE fuel_record_id >= 9000
UNION ALL SELECT 'inspection', COUNT(*), 2 FROM inspection WHERE inspection_id >= 9000
UNION ALL SELECT 'part', COUNT(*), 3 FROM part WHERE part_id >= 9000
UNION ALL SELECT 'maintenance', COUNT(*), 2 FROM maintenance WHERE maintenance_id >= 9000
UNION ALL SELECT 'maintenance_part', COUNT(*), 3 FROM maintenance_part WHERE maintenance_id >= 9000
UNION ALL SELECT 'vehicle_status_history', COUNT(*), 2 FROM vehicle_status_history WHERE status_history_id >= 9000
UNION ALL SELECT 'audit_log', COUNT(*), 2 FROM audit_log WHERE audit_id >= 9000;
