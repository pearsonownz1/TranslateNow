import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2'

// Allow requests from local dev and production domains
const allowedOrigins = ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'https://openeval.com', 'https://www.openeval.com']; // Added 5176

serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';

  // Basic CORS headers
  const baseCorsHeaders = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Dynamically set Allow-Origin header based on request
  let responseHeaders = { ...baseCorsHeaders, 'Content-Type': 'application/json' };
  if (allowedOrigins.includes(origin)) {
    responseHeaders['Access-Control-Allow-Origin'] = origin;
  } else {
    // Origin not allowed
    console.warn(`Origin "${origin}" not allowed.`);
    if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: baseCorsHeaders }); // Respond to OPTIONS preflight without Allow-Origin
    }
     // For actual GET requests from disallowed origins, return error
     return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: responseHeaders });
  }

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: responseHeaders })
  }

  // Handle GET request
  try {
    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Fetch All Users with Pagination ---
    let allUsers: User[] = [];
    let page = 1;
    const perPage = 100; // Adjust page size if needed
    let fetchMore = true;

    console.log("Starting user fetch loop...");
    while (fetchMore) {
      console.log(`Fetching page ${page}...`);
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: page,
        perPage: perPage,
      });

      if (error) {
          console.error(`Error listing users (page ${page}):`, error);
          // Throw error to be caught by the main catch block
          throw new Error(`Failed to list users: ${error.message}`);
      }

      if (data && data.users && data.users.length > 0) {
        console.log(`Fetched ${data.users.length} users on page ${page}.`);
        allUsers = allUsers.concat(data.users);
        // Check if the number of users fetched is less than perPage, indicating the last page
        if (data.users.length < perPage) {
          fetchMore = false;
          console.log("Last page reached.");
        } else {
          page++; // Increment page number to fetch the next batch
        }
      } else {
        // No more users found or empty data object
        fetchMore = false;
        console.log("No more users found or empty data object received.");
      }

      // Optional delay to avoid potential rate limits
      if (fetchMore) {
         await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    console.log(`Total users fetched: ${allUsers.length}`);

    // --- Return the complete user list ---
    // app_metadata and user_metadata should be included by default with admin listUsers
    return new Response(JSON.stringify(allUsers), {
      headers: responseHeaders,
      status: 200,
    });

  } catch (err) {
    console.error("Caught exception in function handler:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: responseHeaders,
      status: 500,
    });
  }
})

/*
To deploy:
1. Ensure Supabase CLI is installed and you are logged in.
2. Run: supabase functions deploy list-admin-users --no-verify-jwt
*/
