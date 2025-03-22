-- Enable Row Level Security on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow users to select their own profile" ON users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON users;

-- Create policies for users table
CREATE POLICY "Allow users to insert their own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to select their own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add a policy for service role to access all users
DROP POLICY IF EXISTS "Allow service role to access all users" ON users;
CREATE POLICY "Allow service role to access all users"
ON users
USING (auth.jwt() ->> 'role' = 'service_role');
