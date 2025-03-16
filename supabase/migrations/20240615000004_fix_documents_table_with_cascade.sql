-- Fix documents table with CASCADE to handle dependencies
BEGIN;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;

-- Drop the existing table with CASCADE to handle dependencies
DROP TABLE IF EXISTS documents CASCADE;

-- Create documents table with TEXT user_id
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own documents
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (user_id = auth.uid()::text OR user_id = 'anonymous');

-- Create policy to allow users to insert their own documents
CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (user_id = auth.uid()::text OR user_id = 'anonymous');

-- Recreate the foreign key constraint for orders table
ALTER TABLE orders
  ADD CONSTRAINT orders_document_id_fkey
  FOREIGN KEY (document_id)
  REFERENCES documents(id);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE documents;

COMMIT;