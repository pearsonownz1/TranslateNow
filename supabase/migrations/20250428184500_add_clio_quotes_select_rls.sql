-- Ensure RLS is enabled (should already be from previous migration)
ALTER TABLE public.clio_quotes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to select their own clio_quotes
-- Drop policy first if it might exist from uncommenting the previous migration
DROP POLICY IF EXISTS "Allow users to select their own clio_quotes" ON public.clio_quotes;
-- Create the policy
CREATE POLICY "Allow users to select their own clio_quotes"
ON public.clio_quotes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Allow admin users to select all clio_quotes
-- Assumes admins have a custom role set in auth.users.app_metadata.role = 'admin'
-- Drop policy first if it might exist
DROP POLICY IF EXISTS "Allow admin users to select all clio_quotes" ON public.clio_quotes;
-- Create the policy
CREATE POLICY "Allow admin users to select all clio_quotes"
ON public.clio_quotes
FOR SELECT
TO authenticated -- Specify the role this policy applies to
-- Assuming you use a custom claim 'user_role' or check app_metadata directly
-- Adjust the USING clause based on how you identify admins
USING (
  -- (get_my_claim('user_role') = 'admin'::text) OR -- Option 1: Using custom claims (requires setup) - REMOVED
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') -- Option 2: Checking app_metadata directly
);

-- If you don't use app_metadata roles for admins,
-- you might need a different way to identify them, or grant broader access cautiously.
-- For example, allowing any authenticated user to SELECT might be simpler if admin distinction isn't critical here:
-- DROP POLICY IF EXISTS "Allow authenticated users to select clio_quotes" ON public.clio_quotes;
-- CREATE POLICY "Allow authenticated users to select clio_quotes"
-- ON public.clio_quotes
-- FOR SELECT
-- TO authenticated
-- USING (true); -- Allows any logged-in user to read all rows (Use with caution!)
