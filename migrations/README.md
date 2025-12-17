# Database Migrations for Enhanced Garden Companion

This directory contains SQL migration files to set up the enhanced database schema for the comprehensive garden companion features.

## Migration Files

### 001_enhanced_schema.sql
Creates the core new tables:
- `seasonal_tasks` - Monthly gardening tasks and recommendations
- `weather_alerts` - Weather warnings and user responses
- `plant_diagnostics` - Plant health diagnostic history
- `plant_database_enhanced` - Enhanced plant information database
- `plant_photos` - User-uploaded plant photos

Includes proper indexing, Row Level Security (RLS) policies, and foreign key constraints.

### 002_extend_plants_table.sql
Extends the existing `plants` table with new fields:
- `category` - Plant category (fruit, vegetable, herb, flower)
- `companion_plants` - Array of companion plant names
- `seasonal_care` - JSON object with seasonal care instructions
- `pollinator_friendly` - Boolean flag for pollinator attraction
- `harvest_info` - JSON object with harvest information
- `common_issues` - JSON array of common plant problems
- `soil_requirements` - JSON object with soil preferences

### 003_initial_seasonal_tasks.sql
Populates the `seasonal_tasks` table with month-by-month gardening activities specifically tailored for Irish climate conditions. Includes tasks for:
- Planting schedules
- Maintenance activities
- Harvesting times
- Seasonal preparations

### 004_initial_plant_database.sql
Populates the `plant_database_enhanced` table with detailed information for common plants suitable for Irish gardening:
- **Fruits**: Strawberries, raspberries
- **Vegetables**: Tomatoes, potatoes, carrots
- **Herbs**: Basil, rosemary, parsley
- **Flowers**: Chrysanthemums, pansies

Each entry includes comprehensive care instructions, companion planting information, and seasonal guidance.

## Running Migrations

### Prerequisites
- Supabase project set up
- Access to Supabase SQL Editor
- Basic database already created (see main SUPABASE_SETUP.md)

### Method 1: Individual Files
Run each migration file in order through the Supabase SQL Editor:
1. Copy content from `001_enhanced_schema.sql` and execute
2. Copy content from `002_extend_plants_table.sql` and execute
3. Copy content from `003_initial_seasonal_tasks.sql` and execute
4. Copy content from `004_initial_plant_database.sql` and execute

### Method 2: All at Once
Copy and paste the contents of all four files in order into a single SQL query.

### Migration Tracking
The migrations include a tracking system (`schema_migrations` table) to prevent duplicate runs. Each migration will only be applied once, even if run multiple times.

## Verification

After running migrations, verify the setup:

```sql
-- Check that all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'seasonal_tasks', 
  'weather_alerts', 
  'plant_diagnostics', 
  'plant_database_enhanced', 
  'plant_photos'
);

-- Check that plants table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'plants' 
AND column_name IN (
  'category', 
  'companion_plants', 
  'seasonal_care', 
  'pollinator_friendly'
);

-- Check sample data
SELECT COUNT(*) FROM seasonal_tasks;
SELECT COUNT(*) FROM plant_database_enhanced;
```

## Rollback

If you need to rollback migrations, you can drop the new tables:

```sql
-- Drop new tables (this will lose all data!)
DROP TABLE IF EXISTS plant_photos CASCADE;
DROP TABLE IF EXISTS plant_diagnostics CASCADE;
DROP TABLE IF EXISTS weather_alerts CASCADE;
DROP TABLE IF EXISTS plant_database_enhanced CASCADE;
DROP TABLE IF EXISTS seasonal_tasks CASCADE;
DROP TABLE IF EXISTS schema_migrations CASCADE;

-- Remove new columns from plants table
ALTER TABLE plants 
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS companion_plants,
DROP COLUMN IF EXISTS seasonal_care,
DROP COLUMN IF EXISTS pollinator_friendly,
DROP COLUMN IF EXISTS harvest_info,
DROP COLUMN IF EXISTS common_issues,
DROP COLUMN IF EXISTS soil_requirements;
```

## TypeScript Integration

The database schema is reflected in TypeScript types:
- `src/types/database.ts` - Supabase-generated types
- `src/types/plant.ts` - Application-level interfaces

These types provide compile-time safety when working with the database through the Supabase client.