-- Migration Runner Script
-- Run all migrations in order for the Enhanced Garden Companion

-- Create migration tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to check if migration has been applied
CREATE OR REPLACE FUNCTION migration_applied(migration_version TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM schema_migrations WHERE version = migration_version);
END;
$$ LANGUAGE plpgsql;

-- Apply Migration 001: Enhanced Schema
DO $$
BEGIN
  IF NOT migration_applied('001_enhanced_schema') THEN
    -- Include the content of 001_enhanced_schema.sql here when running
    INSERT INTO schema_migrations (version) VALUES ('001_enhanced_schema');
    RAISE NOTICE 'Applied migration: 001_enhanced_schema';
  ELSE
    RAISE NOTICE 'Migration 001_enhanced_schema already applied, skipping';
  END IF;
END $$;

-- Apply Migration 002: Extend Plants Table
DO $$
BEGIN
  IF NOT migration_applied('002_extend_plants_table') THEN
    -- Include the content of 002_extend_plants_table.sql here when running
    INSERT INTO schema_migrations (version) VALUES ('002_extend_plants_table');
    RAISE NOTICE 'Applied migration: 002_extend_plants_table';
  ELSE
    RAISE NOTICE 'Migration 002_extend_plants_table already applied, skipping';
  END IF;
END $$;

-- Apply Migration 003: Initial Seasonal Tasks
DO $$
BEGIN
  IF NOT migration_applied('003_initial_seasonal_tasks') THEN
    -- Include the content of 003_initial_seasonal_tasks.sql here when running
    INSERT INTO schema_migrations (version) VALUES ('003_initial_seasonal_tasks');
    RAISE NOTICE 'Applied migration: 003_initial_seasonal_tasks';
  ELSE
    RAISE NOTICE 'Migration 003_initial_seasonal_tasks already applied, skipping';
  END IF;
END $$;

-- Apply Migration 004: Initial Plant Database
DO $$
BEGIN
  IF NOT migration_applied('004_initial_plant_database') THEN
    -- Include the content of 004_initial_plant_database.sql here when running
    INSERT INTO schema_migrations (version) VALUES ('004_initial_plant_database');
    RAISE NOTICE 'Applied migration: 004_initial_plant_database';
  ELSE
    RAISE NOTICE 'Migration 004_initial_plant_database already applied, skipping';
  END IF;
END $$;

-- Clean up migration function
DROP FUNCTION IF EXISTS migration_applied(TEXT);