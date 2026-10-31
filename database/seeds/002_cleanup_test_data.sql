-- 002_cleanup_test_data.sql
-- Removes ONLY the test rows created by 001_seed_test_data.sql (IDs 9000 and above).
-- No DROP or TRUNCATE. Child tables are deleted before their parents.
-- If a real (non-test) row references a test row, PostgreSQL stops with a foreign key
-- error and nothing is deleted, because everything runs in one transaction.

BEGIN;

DELETE FROM maintenance_part       WHERE maintenance_id >= 9000 OR part_id >= 9000;
DELETE FROM fuel_record            WHERE fuel_record_id >= 9000;
DELETE FROM trip                   WHERE trip_id >= 9000;
DELETE FROM maintenance            WHERE maintenance_id >= 9000;
DELETE FROM inspection             WHERE inspection_id >= 9000;
DELETE FROM vehicle_status_history WHERE status_history_id >= 9000;
DELETE FROM audit_log              WHERE audit_id >= 9000;
DELETE FROM vehicle_assignment     WHERE assignment_id >= 9000;
DELETE FROM vehicle                WHERE vehicle_id >= 9000;
DELETE FROM vehicle_type           WHERE vehicle_type_id >= 9000;
DELETE FROM technician             WHERE technician_id >= 9000;
DELETE FROM driver                 WHERE driver_id >= 9000;
DELETE FROM user_account           WHERE user_id >= 9000;
DELETE FROM employee               WHERE employee_id >= 9000;
DELETE FROM role                   WHERE role_id >= 9000;
DELETE FROM part                   WHERE part_id >= 9000;
DELETE FROM branch                 WHERE branch_id >= 9000;

COMMIT;

-- Quick check: this should return 0 rows left in every table.
SELECT 'branch' AS table_name, COUNT(*) AS test_rows_left FROM branch WHERE branch_id >= 9000
UNION ALL SELECT 'employee', COUNT(*) FROM employee WHERE employee_id >= 9000
UNION ALL SELECT 'vehicle', COUNT(*) FROM vehicle WHERE vehicle_id >= 9000
UNION ALL SELECT 'trip', COUNT(*) FROM trip WHERE trip_id >= 9000
UNION ALL SELECT 'maintenance', COUNT(*) FROM maintenance WHERE maintenance_id >= 9000
UNION ALL SELECT 'part', COUNT(*) FROM part WHERE part_id >= 9000;
