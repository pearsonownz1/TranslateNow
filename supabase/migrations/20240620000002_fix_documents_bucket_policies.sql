-- Fix documents bucket policies without recreating the bucket
BEGIN;

-- Only create policies if they don't exist
DO $$
BEGIN
    -- Check if the bucket exists but don't try to create it
    IF EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'documents'
    ) THEN
        -- Check if policies exist and create only if they don't
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage' 
            AND policyname = 'Public Read Access'
        ) THEN
            -- Allow public read access
            CREATE POLICY "Public Read Access" 
            ON storage.objects FOR SELECT 
            USING (bucket_id = 'documents');
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage' 
            AND policyname = 'Authenticated Users Can Upload'
        ) THEN
            -- Allow authenticated users to upload
            CREATE POLICY "Authenticated Users Can Upload" 
            ON storage.objects FOR INSERT 
            TO authenticated 
            WITH CHECK (bucket_id = 'documents');
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage' 
            AND policyname = 'Anonymous Users Can Upload'
        ) THEN
            -- Allow anonymous uploads (for guest checkout)
            CREATE POLICY "Anonymous Users Can Upload" 
            ON storage.objects FOR INSERT 
            TO anon 
            WITH CHECK (bucket_id = 'documents');
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage' 
            AND policyname = 'Users Can Update Their Objects'
        ) THEN
            -- Allow users to update their own objects
            CREATE POLICY "Users Can Update Their Objects" 
            ON storage.objects FOR UPDATE 
            USING (bucket_id = 'documents' AND owner = auth.uid());
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'objects' 
            AND schemaname = 'storage' 
            AND policyname = 'Users Can Delete Their Objects'
        ) THEN
            CREATE POLICY "Users Can Delete Their Objects" 
            ON storage.objects FOR DELETE 
            USING (bucket_id = 'documents' AND owner = auth.uid());
        END IF;
    END IF;
END
$$;

COMMIT;