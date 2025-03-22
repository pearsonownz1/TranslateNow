-- Add policy to allow authenticated users to insert their own profile
CREATE POLICY "Allow authenticated users to insert"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);
