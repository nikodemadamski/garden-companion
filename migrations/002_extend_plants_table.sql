-- Migration 002: Extend existing plants table with enhanced fields
-- Add new columns to support comprehensive garden companion features

-- Add enhanced fields to existing plants table
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('fruit', 'vegetable', 'herb', 'flower')),
ADD COLUMN IF NOT EXISTS companion_plants TEXT[],
ADD COLUMN IF NOT EXISTS seasonal_care JSONB,
ADD COLUMN IF NOT EXISTS pollinator_friendly BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS harvest_info JSONB,
ADD COLUMN IF NOT EXISTS common_issues JSONB,
ADD COLUMN IF NOT EXISTS soil_requirements JSONB;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_pollinator_friendly ON plants(pollinator_friendly);

-- Update pot_type column to include new fabric option if it doesn't already exist
-- First check if we need to update the constraint
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'plants_pot_type_check' 
        AND table_name = 'plants'
    ) THEN
        ALTER TABLE plants DROP CONSTRAINT plants_pot_type_check;
    END IF;
    
    -- Add updated constraint with fabric option
    ALTER TABLE plants ADD CONSTRAINT plants_pot_type_check 
    CHECK (pot_type IN ('terracotta', 'ceramic', 'plastic', 'hanging', 'fabric'));
END $$;