# Supabase Setup Guide

## 1. Create Project
1. Go to [database.new](https://database.new) and create a new project.
2. Once created, go to **Project Settings > API**.
3. Copy the **Project URL** and **anon public** key.
4. Create a file named `.env.local` in your project root and add them:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 2. Run SQL Query
Go to the **SQL Editor** in Supabase and run the following script to set up your database:

```sql
-- Create a table for plants
create table plants (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Plant Data
  name text not null,
  species text,
  type text check (type in ('indoor', 'outdoor')),
  location text,
  water_frequency_days int,
  last_watered_date text,
  image_url text,
  notes text,
  date_added text,
  perenual_id int,
  room text,
  snooze_until text,
  status text,
  nickname text,
  gotcha_date text,
  pot_type text,
  
  -- Journal (stored as JSON for flexibility)
  journal jsonb default '[]'::jsonb
);

-- Create a table for user settings (rooms, etc.)
create table user_settings (
  user_id uuid references auth.users primary key,
  rooms text[] default array['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Bathroom', 'Balcony'],
  current_garden text default 'indoor'
);

-- Enable Row Level Security (RLS)
alter table plants enable row level security;
alter table user_settings enable row level security;

-- Create policies to allow users to only see their own data
create policy "Users can view their own plants" on plants
  for select using (auth.uid() = user_id);

create policy "Users can insert their own plants" on plants
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own plants" on plants
  for update using (auth.uid() = user_id);

create policy "Users can delete their own plants" on plants
  for delete using (auth.uid() = user_id);

create policy "Users can view their own settings" on user_settings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own settings" on user_settings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own settings" on user_settings
  for update using (auth.uid() = user_id);
```

## 3. Restart Server
Restart your development server to load the environment variables:
```bash
npm run dev
```

## 4. Update Schema for Streaks (Run this if you already set up the DB)

Run this SQL query to add columns for tracking login and watering streaks:

```sql
alter table user_settings 
add column if not exists last_login_date text,
add column if not exists login_streak int default 0,
add column if not exists last_watered_date text,
add column if not exists watering_streak int default 0;
```
