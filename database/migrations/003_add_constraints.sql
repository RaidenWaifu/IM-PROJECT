   -- 003_add_constraints.sql
   -- Implements team-approved rules:
   --   UNIQUE on user_account.username and vehicle.plate_number
   --   ON DELETE CASCADE on maintenance_part -> maintenance
   -- Run after 001_create_fleettrack_tables.sql and 002_create_indexes.sql.

BEGIN;

ALTER TABLE user_account
  ADD CONSTRAINT user_account_username_key UNIQUE (username);

ALTER TABLE vehicle
  ADD CONSTRAINT vehicle_plate_number_key UNIQUE (plate_number);

ALTER TABLE maintenance_part
  DROP CONSTRAINT maintenance_part_maintenance_id_fkey;

ALTER TABLE maintenance_part
  ADD CONSTRAINT maintenance_part_maintenance_id_fkey
  FOREIGN KEY (maintenance_id) REFERENCES maintenance(maintenance_id)
  ON DELETE CASCADE;

COMMIT;