-- =====================================================
-- User Management Setup: Storage Bucket
-- =====================================================
-- This migration creates the user_assets storage bucket
-- for user-uploaded files and assets

-- Create the user_assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user_assets',
  'user_assets',
  false, -- private bucket
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'application/json'
  ]
);

-- Create RLS policies for the user_assets bucket

-- Users can upload files to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'user_assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own files
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'user_assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own files
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'user_assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'user_assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all files (requires has_permission function)
CREATE POLICY "Admins can view all user assets" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'user_assets' AND
    has_permission('team_assets.manage')
  );
