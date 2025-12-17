-- Migration 005: Add task progress tracking table
-- Create table for tracking user task completion and progress

-- Create task progress table
CREATE TABLE IF NOT EXISTS task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL, -- References seasonal_tasks.id but not enforced to allow flexibility
  completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_progress_user_id ON task_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_task_id ON task_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_completed ON task_progress(completed);
CREATE INDEX IF NOT EXISTS idx_task_progress_completed_date ON task_progress(completed_date);

-- Enable Row Level Security (RLS)
ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task_progress
CREATE POLICY "Users can view their own task progress" ON task_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task progress" ON task_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task progress" ON task_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task progress" ON task_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicate progress records for same user/task
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_progress_user_task_unique 
ON task_progress(user_id, task_id);