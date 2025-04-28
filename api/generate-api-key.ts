import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Initialize Supabase Admin Client (for database operations)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Supabase Client with ANON KEY (for user authentication)
const supabaseAnonClient = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

const generateApiKey = () => {
  // Generate a secure random string for the API key (e.g., 32 bytes hex)
  // Prefix with something identifiable, e.g., 'sk_' for secret key
  return `sk_${crypto.randomBytes(32).toString('hex')}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Revert to validating the token passed in the header, using the ANON client
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

    // 2. Generate API Key
    const apiKey = generateApiKey();
    const keyPrefix = apiKey.substring(0, 8); // Store first 8 chars for identification

    // 3. Hash the API Key
    const saltRounds = 10; // Standard practice
    const hashedKey = await bcrypt.hash(apiKey, saltRounds);

    // 4. Store Hashed Key in Supabase
    const { error: insertError } = await supabaseAdmin
      .from('api_keys') // Your table name
      .insert({
        user_id: userId,
        hashed_key: hashedKey,
        key_prefix: keyPrefix,
        // 'revoked' defaults to false, 'created_at' defaults to now()
      });

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      return res.status(500).json({ error: 'Failed to store API key', details: insertError.message });
    }

    // 5. Return the *RAW* API Key (only this one time)
    // IMPORTANT: Never store or log the raw API key on the server after this point.
    return res.status(200).json({ apiKey });

  } catch (error) {
    console.error('Unexpected Error:', error);
    // Check if error is an instance of Error to access message property safely
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
}
