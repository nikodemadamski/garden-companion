-- Photo Storage Setup Migration
-- Migration 006: Set up Supabase storage bucket for plant photos

-- Create storage bucket for plant photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-photos',
  'plant-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for plant photos bucket
-- Policy: Users can view their own photos
CREATE POLICY "Users can view their own plant photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'plant-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can upload photos to their own folder
CREATE POLICY "Users can upload plant photos to their folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'plant-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    -- Ensure the plant belongs to the user
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id::text = (storage.foldername(name))[2]
      AND plants.user_id = auth.uid()
    )
  );

-- Policy: Users can update their own photos
CREATE POLICY "Users can update their own plant photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'plant-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete their own plant photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'plant-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Add storage quota tracking function
CREATE OR REPLACE FUNCTION check_user_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
  user_storage_bytes BIGINT;
  max_storage_bytes BIGINT := 104857600; -- 100MB
BEGIN
  -- Calculate current storage usage for user
  SELECT COALESCE(SUM(metadata->>'size')::BIGINT, 0)
  INTO user_storage_bytes
  FROM plant_photos
  WHERE user_id = NEW.user_id;

  -- Add size of new photo
  user_storage_bytes := user_storage_bytes + COALESCE((NEW.metadata->>'size')::BIGINT, 0);

  -- Check if quota exceeded
  IF user_storage_bytes > max_storage_bytes THEN
    RAISE EXCEPTION 'Storage quota exceeded. Maximum allowed: % bytes, current usage would be: % bytes', 
      max_storage_bytes, user_storage_bytes;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce storage quota
DROP TRIGGER IF EXISTS enforce_storage_quota ON plant_photos;
CREATE TRIGGER enforce_storage_quota
  BEFORE INSERT ON plant_photos
  FOR EACH ROW
  EXECUTE FUNCTION check_user_storage_quota();

-- Add function to clean up storage when photos are deleted
CREATE OR REPLACE FUNCTION cleanup_photo_storage()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: Actual file deletion from storage is handled by the application
  -- This function can be extended to log deletions or perform other cleanup
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for photo cleanup
DROP TRIGGER IF EXISTS photo_cleanup ON plant_photos;
CREATE TRIGGER photo_cleanup
  AFTER DELETE ON plant_photos
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_photo_storage();

-- Add constraint to ensure only one primary photo per plant per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_plant_photos_unique_primary 
ON plant_photos (plant_id, user_id) 
WHERE is_primary = true;

-- Add helpful views for photo management
CREATE OR REPLACE VIEW user_photo_stats AS
SELECT 
  user_id,
  COUNT(*) as total_photos,
  COALESCE(SUM((metadata->>'size')::BIGINT), 0) as total_size_bytes,
  ROUND(
    (COALESCE(SUM((metadata->>'size')::BIGINT), 0) * 100.0 / 104857600), 
    2
  ) as quota_usage_percent
FROM plant_photos
GROUP BY user_id;

-- Add view for plant photo summaries
CREATE OR REPLACE VIEW plant_photo_summary AS
SELECT 
  p.id as plant_id,
  p.user_id,
  p.name as plant_name,
  COUNT(pp.id) as photo_count,
  MAX(pp.created_at) as last_photo_date,
  (
    SELECT pp2.url 
    FROM plant_photos pp2 
    WHERE pp2.plant_id = p.id 
    AND pp2.is_primary = true 
    LIMIT 1
  ) as primary_photo_url,
  (
    SELECT pp2.thumbnail_url 
    FROM plant_photos pp2 
    WHERE pp2.plant_id = p.id 
    AND pp2.is_primary = true 
    LIMIT 1
  ) as primary_thumbnail_url
FROM plants p
LEFT JOIN plant_photos pp ON p.id = pp.plant_id
GROUP BY p.id, p.user_id, p.name;

-- Grant necessary permissions
GRANT SELECT ON user_photo_stats TO authenticated;
GRANT SELECT ON plant_photo_summary TO authenticated;

-- Add RLS policies for the views
CREATE POLICY "Users can view their own photo stats" ON user_photo_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own plant photo summaries" ON plant_photo_summary
  FOR SELECT USING (user_id = auth.uid());

-- Enable RLS on views
ALTER VIEW user_photo_stats ENABLE ROW LEVEL SECURITY;
ALTER VIEW plant_photo_summary ENABLE ROW LEVEL SECURITY;