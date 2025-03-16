-- Create documents bucket if it doesn't exist
BEGIN;

-- Create documents table if it doesn't exist
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
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (user_id::text = auth.uid()::text OR user_id = 'anonymous');

-- Create policy to allow users to insert their own documents
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text OR user_id = 'anonymous');

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE documents;

COMMIT;