import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2'

// Allow requests from local dev and production domains
const allowedOrigins = ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'https://openeval.com', 'https://www.openeval.com'];

serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';

  // Basic CORS headers
  const baseCorsHeaders = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    // Allow POST for this function
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Dynamically set Allow-Origin header based on request
  let responseHeaders = { ...baseCorsHeaders, 'Content-Type': 'application/json' };
  let originAllowed = false;

  if (allowedOrigins.includes(origin)) {
    responseHeaders['Access-Control-Allow-Origin'] = origin;
    originAllowed = true;
  } else if (!origin) {
    // Allow requests with no origin (likely server-to-server)
    console.log("Allowing request with no Origin header (server-to-server).");
    // We don't set Access-Control-Allow-Origin for server-to-server, but we allow the request processing
    originAllowed = true;
  } else {
    // Origin is present but not in the allowed list
    console.warn(`Origin "${origin}" not allowed for get-user-details.`);
  }

  // Handle OPTIONS preflight request - respond based on whether origin *would be* allowed
  if (req.method === 'OPTIONS') {
    if (originAllowed) {
        // If origin is allowed (or empty), respond with appropriate headers including the origin if it exists
        return new Response('ok', { headers: responseHeaders });
    } else {
        // If origin is present but not allowed, respond without Allow-Origin
        return new Response('ok', { headers: baseCorsHeaders });
    }
  }

  // For non-OPTIONS requests, block if origin was present but not allowed
  if (!originAllowed && origin) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: responseHeaders });
  }

  // Handle POST request
  if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: responseHeaders });
  }

  try {
    // 1. Get userId from request body
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("Missing userId in request body.");
    }

    // 2. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Fetch user details using Admin API
    console.log(`Fetching details for user ID: ${userId}`);
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw new Error(`Failed to fetch user details: ${error.message}`);
    }

    if (!data || !data.user) {
        throw new Error(`User with ID ${userId} not found.`);
    }

    console.log(`Successfully fetched details for user ${userId}`);
    // 4. Return the user object (includes metadata)
    // Ensure correct headers are used (including Allow-Origin if it was set)
    return new Response(JSON.stringify(data.user), {
      headers: responseHeaders,
      status: 200,
    });

  } catch (err) {
    console.error("Caught exception in get-user-details handler:", err);
    // Ensure correct headers are used (including Allow-Origin if it was set)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: responseHeaders,
      status: err instanceof Error && err.message.includes("not found") ? 404 : 500, // Return 404 if user not found
    });
  }
})

/*
To deploy:
1. Ensure Supabase CLI is installed and you are logged in.
2. Run: supabase functions deploy get-user-details --no-verify-jwt
*/
