-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Plants Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.plants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    species TEXT,
    type TEXT CHECK (type IN ('indoor', 'outdoor')),
    location TEXT,
    water_frequency_days INTEGER,
    last_watered_date TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    notes TEXT,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    perenual_id INTEGER,
    room TEXT,
    snooze_until TIMESTAMP WITH TIME ZONE,
    status TEXT,
    nickname TEXT,
    gotcha_date TIMESTAMP WITH TIME ZONE,
    pot_type TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    journal JSONB DEFAULT '[]'::jsonb
);

-- Add enhanced fields if they don't exist
DO $$ 
BEGIN 
    -- Category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plants' AND column_name = 'category') THEN
        ALTER TABLE public.plants ADD COLUMN category TEXT CHECK (category IN ('fruit', 'vegetable', 'herb', 'flower'));
    END IF;

    -- Companion Plants
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plants' AND column_name = 'companion_plants') THEN
        ALTER TABLE public.plants ADD COLUMN companion_plants TEXT[];
    END IF;

    -- Seasonal Care
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plants' AND column_name = 'seasonal_care') THEN
        ALTER TABLE public.plants ADD COLUMN seasonal_care JSONB;
    END IF;

    -- Pollinator Friendly
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plants' AND column_name = 'pollinator_friendly') THEN
        ALTER TABLE public.plants ADD COLUMN pollinator_friendly BOOLEAN;
    END IF;

    -- Harvest Info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plants' AND column_name = 'harvest_info') THEN
        ALTER TABLE public.plants ADD COLUMN harvest_info JSONB;
    END IF;

    -- Common Issues
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plants' AND column_name = 'common_issues') THEN
        ALTER TABLE public.plants ADD COLUMN common_issues JSONB;
    END IF;

    -- Soil Requirements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plants' AND column_name = 'soil_requirements') THEN
        ALTER TABLE public.plants ADD COLUMN soil_requirements JSONB;
    END IF;
END $$;

-- 2. Seasonal Tasks Table
CREATE TABLE IF NOT EXISTS public.seasonal_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) NOT NULL,
    category TEXT CHECK (category IN ('planting', 'maintenance', 'harvesting', 'preparation')) NOT NULL,
    climate_zone TEXT DEFAULT 'ireland',
    plant_types TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Weather Alerts Table
CREATE TABLE IF NOT EXISTS public.weather_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT auth.uid(),
    alert_type TEXT CHECK (alert_type IN ('wind', 'rain', 'storm', 'temperature')) NOT NULL,
    severity TEXT CHECK (severity IN ('yellow', 'orange', 'red')) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    description TEXT,
    actions_taken TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Plant Diagnostics Table
CREATE TABLE IF NOT EXISTS public.plant_diagnostics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE NOT NULL,
    symptoms TEXT[] NOT NULL,
    diagnosis TEXT,
    treatment_plan JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Plant Photos Table
CREATE TABLE IF NOT EXISTS public.plant_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL DEFAULT auth.uid(),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Task Progress Table
CREATE TABLE IF NOT EXISTS public.task_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT auth.uid(),
    task_id UUID REFERENCES public.seasonal_tasks(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rooms TEXT[],
    current_garden TEXT,
    last_login_date TIMESTAMP WITH TIME ZONE,
    login_streak INTEGER DEFAULT 0,
    last_watered_date TIMESTAMP WITH TIME ZONE,
    watering_streak INTEGER DEFAULT 0
);

-- 9. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to drop policies if they exist
DO $$ 
BEGIN 
    -- Plants Policies
    DROP POLICY IF EXISTS "Users can view their own plants" ON public.plants;
    DROP POLICY IF EXISTS "Users can insert their own plants" ON public.plants;
    DROP POLICY IF EXISTS "Users can update their own plants" ON public.plants;
    DROP POLICY IF EXISTS "Users can delete their own plants" ON public.plants;

    -- Seasonal Tasks Policies
    DROP POLICY IF EXISTS "Anyone can view seasonal tasks" ON public.seasonal_tasks;

    -- Weather Alerts Policies
    DROP POLICY IF EXISTS "Users can view their own alerts" ON public.weather_alerts;
    DROP POLICY IF EXISTS "Users can insert their own alerts" ON public.weather_alerts;
    DROP POLICY IF EXISTS "Users can update their own alerts" ON public.weather_alerts;

    -- Plant Diagnostics Policies
    DROP POLICY IF EXISTS "Users can view diagnostics for their plants" ON public.plant_diagnostics;
    DROP POLICY IF EXISTS "Users can insert diagnostics for their plants" ON public.plant_diagnostics;
    DROP POLICY IF EXISTS "Users can update diagnostics for their plants" ON public.plant_diagnostics;

    -- Plant Photos Policies
    DROP POLICY IF EXISTS "Users can view photos for their plants" ON public.plant_photos;
    DROP POLICY IF EXISTS "Users can insert photos for their plants" ON public.plant_photos;
    DROP POLICY IF EXISTS "Users can update photos for their plants" ON public.plant_photos;
    DROP POLICY IF EXISTS "Users can delete photos for their plants" ON public.plant_photos;

    -- Task Progress Policies
    DROP POLICY IF EXISTS "Users can view their own task progress" ON public.task_progress;
    DROP POLICY IF EXISTS "Users can insert their own task progress" ON public.task_progress;
    DROP POLICY IF EXISTS "Users can update their own task progress" ON public.task_progress;

    -- User Settings Policies
    DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
    DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
    DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
END $$;

-- Re-create Policies

-- Plants Policies
CREATE POLICY "Users can view their own plants" ON public.plants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants" ON public.plants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants" ON public.plants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants" ON public.plants
    FOR DELETE USING (auth.uid() = user_id);

-- Seasonal Tasks Policies
CREATE POLICY "Anyone can view seasonal tasks" ON public.seasonal_tasks
    FOR SELECT USING (true);

-- Weather Alerts Policies
CREATE POLICY "Users can view their own alerts" ON public.weather_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts" ON public.weather_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.weather_alerts
    FOR UPDATE USING (auth.uid() = user_id);

-- Plant Diagnostics Policies
CREATE POLICY "Users can view diagnostics for their plants" ON public.plant_diagnostics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.plants
            WHERE plants.id = plant_diagnostics.plant_id
            AND plants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert diagnostics for their plants" ON public.plant_diagnostics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.plants
            WHERE plants.id = plant_diagnostics.plant_id
            AND plants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update diagnostics for their plants" ON public.plant_diagnostics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.plants
            WHERE plants.id = plant_diagnostics.plant_id
            AND plants.user_id = auth.uid()
        )
    );

-- Plant Photos Policies
CREATE POLICY "Users can view photos for their plants" ON public.plant_photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert photos for their plants" ON public.plant_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update photos for their plants" ON public.plant_photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete photos for their plants" ON public.plant_photos
    FOR DELETE USING (auth.uid() = user_id);

-- Task Progress Policies
CREATE POLICY "Users can view their own task progress" ON public.task_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task progress" ON public.task_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task progress" ON public.task_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);
