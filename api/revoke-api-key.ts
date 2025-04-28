import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Get User ID from JWT
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth Error:', userError);
      return res.status(401).json({ error: 'Invalid token or authentication failed' });
    }
    const userId = user.id;

    // 2. Get Key ID from request body
    const { keyId } = req.body;
    if (!keyId || typeof keyId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid keyId in request body' });
    }

    // 3. Update the key in Supabase, ensuring the user owns it
    const { data, error: updateError } = await supabaseAdmin
      .from('api_keys') // Your table name
      .update({ revoked: true })
      .eq('id', keyId)
      .eq('user_id', userId) // Ensure the user owns this key
      .select('id') // Select something to confirm the update happened
      .single(); // Expect only one row to be updated

    if (updateError) {
        // Handle cases where the key doesn't exist or doesn't belong to the user
        if (updateError.code === 'PGRST116') { // PostgREST code for "Matching row not found"
             console.warn(`Revoke attempt failed: Key ID ${keyId} not found or not owned by user ${userId}`);
             return res.status(404).json({ error: 'API key not found or you do not have permission to revoke it.' });
        }
        console.error('Supabase Update Error:', updateError);
        return res.status(500).json({ error: 'Failed to revoke API key', details: updateError.message });
    }

    if (!data) {
        // Should be caught by PGRST116, but as a fallback
        console.warn(`Revoke attempt failed: Key ID ${keyId} not found or not owned by user ${userId} (no data returned)`);
        return res.status(404).json({ error: 'API key not found or you do not have permission to revoke it.' });
    }

    // 4. Return success
    console.log(`API Key ${keyId} revoked successfully for user ${userId}`);
    return res.status(200).json({ message: 'API key revoked successfully' });

  } catch (error) {
    console.error('Unexpected Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
}
