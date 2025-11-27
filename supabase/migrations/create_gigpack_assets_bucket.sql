-- Create storage bucket for GigPack assets (logos, hero images)
-- This bucket will store band logos and hero/banner images

-- Insert the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gigpack-assets',
  'gigpack-assets',
  true, -- Public access for viewing images
  5242880, -- 5MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gigpack-assets bucket
-- Drop existing policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS "Public images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Policy: Anyone can view/read public images (needed for public GigPack pages)
CREATE POLICY "Public images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'gigpack-assets');

-- Policy: Authenticated users can upload their own images
-- Images are stored with path: {user_id}/{filename}
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gigpack-assets' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gigpack-assets' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gigpack-assets' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

