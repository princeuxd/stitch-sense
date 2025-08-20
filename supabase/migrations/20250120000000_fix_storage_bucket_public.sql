-- Make clothing-images bucket public so images can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'clothing-images';

-- Update storage policies to allow public access to images
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own clothing images" ON storage.objects;

-- Create new policy that allows users to view their own images publicly
CREATE POLICY "Users can view their own clothing images publicly" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to clothing images for authenticated users
CREATE POLICY "Public can view clothing images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'clothing-images');