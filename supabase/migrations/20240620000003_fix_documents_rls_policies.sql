-- Fix RLS policies for documents bucket to allow uploads

-- First, check if the bucket exists
DO $$
BEGIN
  -- Enable RLS on the storage.objects table if it's not already enabled
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist to avoid conflicts
  DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow individual access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
  
  -- Create policy to allow public read access to all objects
  CREATE POLICY "Allow public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');
  
  -- Create policy to allow authenticated users to upload files
  CREATE POLICY "Allow authenticated uploads"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
  
  -- Create policy to allow individual users to manage their own files
  CREATE POLICY "Allow individual access"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  
  -- Create policy to allow anonymous uploads (for users who aren't logged in)
  CREATE POLICY "Allow anonymous uploads"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents');

END $$;