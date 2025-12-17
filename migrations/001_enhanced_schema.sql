-- Enhanced Garden Companion Database Schema
-- Migration 001: Add new tables for comprehensive garden companion features

-- Create seasonal tasks table
CREATE TABLE IF NOT EXISTS seasonal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT NOT NULL CHECK (category IN ('planting', 'maintenance', 'harvesting', 'preparation')),
  climate_zone TEXT DEFAULT 'ireland',
  plant_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create weather alerts table
CREATE TABLE IF NOT EXISTS weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('wind', 'rain', 'storm', 'temperature')),
  severity TEXT NOT NULL CHECK (severity IN ('yellow', 'orange', 'red')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  description TEXT,
  actions_taken TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create plant diagnostics table
CREATE TABLE IF NOT EXISTS plant_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL,
  diagnosis TEXT,
  treatment_plan JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create enhanced plant database table
CREATE TABLE IF NOT EXISTS plant_database_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perenual_id INTEGER UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('fruit', 'vegetable', 'herb', 'flower')),
  native_region TEXT,
  companion_plants TEXT[],
  pollinator_friendly BOOLEAN DEFAULT FALSE,
  harvest_info JSONB,
  seasonal_care JSONB,
  common_issues JSONB,
  soil_requirements JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create plant photos table
CREATE TABLE IF NOT EXISTS plant_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seasonal_tasks_month ON seasonal_tasks(month);
CREATE INDEX IF NOT EXISTS idx_seasonal_tasks_priority ON seasonal_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_user_id ON weather_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_start_time ON weather_alerts(start_time);
CREATE INDEX IF NOT EXISTS idx_plant_diagnostics_plant_id ON plant_diagnostics(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_diagnostics_resolved ON plant_diagnostics(resolved);
CREATE INDEX IF NOT EXISTS idx_plant_database_enhanced_category ON plant_database_enhanced(category);
CREATE INDEX IF NOT EXISTS idx_plant_database_enhanced_perenual_id ON plant_database_enhanced(perenual_id);
CREATE INDEX IF NOT EXISTS idx_plant_photos_plant_id ON plant_photos(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_photos_user_id ON plant_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_plant_photos_is_primary ON plant_photos(is_primary);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weather_alerts
CREATE POLICY "Users can view their own weather alerts" ON weather_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weather alerts" ON weather_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather alerts" ON weather_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weather alerts" ON weather_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for plant_diagnostics
CREATE POLICY "Users can view diagnostics for their plants" ON plant_diagnostics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id = plant_diagnostics.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert diagnostics for their plants" ON plant_diagnostics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id = plant_diagnostics.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update diagnostics for their plants" ON plant_diagnostics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id = plant_diagnostics.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete diagnostics for their plants" ON plant_diagnostics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id = plant_diagnostics.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

-- Create RLS policies for plant_photos
CREATE POLICY "Users can view photos for their plants" ON plant_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert photos for their plants" ON plant_photos
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id = plant_photos.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos for their plants" ON plant_photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete photos for their plants" ON plant_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Seasonal tasks and enhanced plant database are public read-only
-- (they contain reference data, not user-specific data)
CREATE POLICY "Anyone can read seasonal tasks" ON seasonal_tasks
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read enhanced plant database" ON plant_database_enhanced
  FOR SELECT USING (true);