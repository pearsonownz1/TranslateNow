-- Create documents bucket if it doesn't exist
BEGIN;

-- Create the documents bucket if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'documents'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('documents', 'documents', true);
        
        -- Set RLS policies for the bucket
        -- Allow public read access
        CREATE POLICY "Public Read Access" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'documents');
        
        -- Allow authenticated users to upload
        CREATE POLICY "Authenticated Users Can Upload" 
        ON storage.objects FOR INSERT 
        TO authenticated 
        WITH CHECK (bucket_id = 'documents');
        
        -- Allow anonymous uploads (for guest checkout)
        CREATE POLICY "Anonymous Users Can Upload" 
        ON storage.objects FOR INSERT 
        TO anon 
        WITH CHECK (bucket_id = 'documents');
        
        -- Allow users to update and delete their own objects
        CREATE POLICY "Users Can Update Their Objects" 
        ON storage.objects FOR UPDATE 
        USING (bucket_id = 'documents' AND owner = auth.uid());
        
        CREATE POLICY "Users Can Delete Their Objects" 
        ON storage.objects FOR DELETE 
        USING (bucket_id = 'documents' AND owner = auth.uid());
    END IF;
END
$$;

COMMIT;