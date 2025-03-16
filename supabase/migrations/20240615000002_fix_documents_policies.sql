-- Fix the documents table policies to handle 'anonymous' user_id
BEGIN;

-- Modify the documents table to change user_id type to TEXT
ALTER TABLE IF EXISTS documents
  ALTER COLUMN user_id TYPE TEXT;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;

-- Create new policies with proper text comparison
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (user_id = auth.uid()::text OR user_id = 'anonymous');

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (user_id = auth.uid()::text OR user_id = 'anonymous');

COMMIT;