import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase Admin Client (for database operations)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Supabase Client with ANON KEY (for user authentication)
// Note: Vercel automatically makes VITE_ prefixed vars available in functions
const supabaseAnonClient = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Get User using the request context (cookies/headers) via ANON client
    // Pass the request object to the Supabase client for server-side auth context
    // NOTE: The exact way to pass context might vary slightly depending on library versions or frameworks.
    // For Vercel + @supabase/supabase-js, often relying on cookies set by the frontend client is sufficient.
    // We might need helper libraries like @supabase/auth-helpers-node if cookie handling isn't automatic.
    // Revert to validating the token passed in the header, but use the ANON client
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }
    // Validate the token using the ANON client
    const { data: { user }, error: userError } = await supabaseAnonClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth Error validating token:', userError);
      return res.status(401).json({ error: 'Authentication failed or session invalid' }); // Keep generic error
    }

    const userId = user.id;

    // 2. Fetch API Keys for the user from Supabase
    // Only select non-sensitive information
    const { data: keys, error: fetchError } = await supabaseAdmin
      .from('api_keys') // Your table name
      .select('id, key_prefix, created_at, revoked, last_used_at') // Select relevant columns
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Show newest keys first

    if (fetchError) {
      console.error('Supabase Fetch Error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch API keys', details: fetchError.message });
    }

    // 3. Return the fetched keys
     return res.status(200).json({ keys });

  } catch (error) {
    console.error('Detailed Error in /api/get-api-keys:', error); // More specific logging
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    // Log the specific error message before sending generic response
    console.error('Error details being sent:', errorMessage);
    // Return a generic error to the client, but log details server-side
    return res.status(500).json({ error: 'Internal Server Error fetching API keys.' });
  }
}
