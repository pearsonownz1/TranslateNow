import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define CORS headers inline
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specify allowed origins: 'http://localhost:5174, https://your-prod-domain.com'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST for sending userId
}

// Function to verify if the requesting user is an admin
async function verifyAdmin(supabaseClient: SupabaseClient): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
      console.error("Error getting user for admin check:", error);
      return false;
    }
    // Check for the admin role in app_metadata
    return user?.app_metadata?.role === 'admin';
  } catch (err) {
    console.error("Exception during admin verification:", err);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase client with ANON KEY to verify the requesting user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 2. Verify if the requesting user is an admin
    const isAdmin = await verifyAdmin(supabaseClient);
    if (!isAdmin) {
      console.warn("Admin check failed for user.");
      return new Response(JSON.stringify({ error: 'Forbidden: User is not an admin.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }

    // 3. If admin, proceed to get target user ID from request body
    const { userId } = await req.json();
    if (!userId || typeof userId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid userId in request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // 4. Initialize Supabase Admin Client with SERVICE ROLE KEY to fetch target user details
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 5. Fetch the target user's details using the admin client
    console.log(`Admin user verified. Fetching details for user ID: ${userId}`);
    const { data, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (fetchError) {
      console.error(`Error fetching user details for ID ${userId}:`, fetchError);
      // Determine appropriate status code based on error type if possible
      const status = fetchError.message.includes("User not found") ? 404 : 500;
      return new Response(JSON.stringify({ error: `Failed to fetch user details: ${fetchError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: status
      });
    }

    if (!data?.user) {
       console.warn(`User not found for ID ${userId}.`);
       return new Response(JSON.stringify({ error: 'User not found' }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 404
       });
    }

    // 6. Return the fetched user data
    console.log(`Successfully fetched details for user ID: ${userId}`);
    return new Response(JSON.stringify(data.user), { // Return only the user object
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("Caught exception in function handler:", err);
    // Check if the error is due to invalid JSON body
    if (err instanceof SyntaxError) {
       return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 400
       });
    }
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})

/*
To deploy:
1. Ensure Supabase CLI is installed and you are logged in.
2. Run: supabase functions deploy get-user-details --no-verify-jwt
   (Note: --no-verify-jwt is NOT needed here as we manually verify the JWT and role)
   Correct command: supabase functions deploy get-user-details
*/
