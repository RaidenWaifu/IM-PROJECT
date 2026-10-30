# FleetTrack Database Backup and Restore Report

## 1. Purpose

A backup and restore test was performed to check whether the FleetTrack development database could be backed up and recovered successfully.

## 2. Backup Details

- Database: `fleettrack_dev`
- Database system: PostgreSQL 18
- Backup format: Custom format
- Backup utility: PostgreSQL 18 `pg_dump.exe`
- Backup file: `fleettrack_dev_backup.dump`
- Backup location: `C:\Users\Mike Baratas\Documents\FleetTrack_Backups`
- Backup file size: 60,278 bytes

## 3. Restore Test

The backup was restored into a separate database named `fleettrack_restore_test` using PostgreSQL 18 `pg_restore.exe`.

The restore process successfully recreated the database objects, including tables, sequences, functions, indexes, constraints, triggers, and foreign keys.

## 4. Verification Results

The restored database was checked after restoration.

- Total restored tables: 17
- `vehicle`: 3 records
- `user_account`: 3 records
- `trip`: 3 records
- `maintenance`: 2 records

These checks confirmed that the restored database contained the expected tables and representative records.

## 5. Notes and Limitations

The restore test was successful. However, a complete row-by-row comparison of every table between the original and restored databases was not performed.

The pgAdmin backup and restore utilities encountered missing DLL errors. The issue was worked around by using the PostgreSQL 18 command-line utilities directly.

## 6. Conclusion

The FleetTrack development database was successfully backed up and restored into a separate test database. The test provides evidence that the backup can be used to recover the database structure and representative data.