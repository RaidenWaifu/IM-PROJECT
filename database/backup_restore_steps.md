FleetTrack Backup and Restore (Member 1)

Source database: fleettrack_db (PostgreSQL 18, local)
Backup method: pgAdmin Backup, Custom format
Backup file: C:\Users\user\Desktop\fleettrack_backup.backup
Backup date: not recorded.

Restore target: fleettrack_restore_test (separate database, never the working DB)
Restore date: not recorded.
Result: Row counts and indexes matched (vehicle 3, trip 3, maintenance_part 3, audit_log 2, 4 indexes)

Limitations:
- Tested on a local machine only; no cloud backup exists.
- Test data only, not production data.
- Restore was tested into a separate database, so the working DB was not overwritten.

Restore steps:
1. In pgAdmin, right-click fleettrack_restore_test > Restore.
2. Select the backup file above, choose Custom format, and click Restore.
3. Check row counts and indexes match the source.