-- 002_create_indexes.sql
-- FleetTrack indexes for fleettrack_db. Run AFTER 001_create_fleettrack_tables.sql.
-- Only the common queries named in the Step 3 guide get an index. Primary keys and the
-- UNIQUE(employee_id) rules already have automatic indexes, so nothing is duplicated.
-- IF NOT EXISTS makes the script safe to run more than once.

-- Vehicles by branch and status (fleet lists, availability checks)
CREATE INDEX IF NOT EXISTS idx_vehicle_branch_status
    ON vehicle (branch_id, vehicle_status);

-- Trips by vehicle and date (trip history, mileage reports)
CREATE INDEX IF NOT EXISTS idx_trip_vehicle_date
    ON trip (vehicle_id, trip_date);

-- Maintenance by vehicle and date (service history)
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_date
    ON maintenance (vehicle_id, maintenance_date);

-- Fuel records by vehicle and date (fuel usage and cost reports)
CREATE INDEX IF NOT EXISTS idx_fuel_record_vehicle_date
    ON fuel_record (vehicle_id, fuel_date);

-- Check: this should now list the 4 new idx_ indexes.
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY tablename;
