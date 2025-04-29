import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// --- Environment Variables ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY; // Needed for initial auth check
// Use Service Role Key for database writes/deletes
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- Basic Validation ---
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    console.error("One or more required Supabase environment variables are missing for Clio disconnect.");
    // Avoid throwing here in production
}

// Initialize Supabase clients
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!); // For DB delete
const supabase = createClient(supabaseUrl!, supabaseAnonKey!); // For user auth check

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 1. Verify User Authentication
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
        console.error('Auth error during disconnect:', userError?.message);
        return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    // 2. Delete Stored Tokens from Database
    try {
        console.log(`Attempting to disconnect Clio for user: ${user.id}`);

        // Delete the specific integration record using the admin client
        const { error: dbError } = await supabaseAdmin
            .from('user_integrations')
            .delete()
            .match({ user_id: user.id, integration_name: 'clio' }); // Match user and integration

        if (dbError) {
            // Log the error but potentially still return success to the user,
            // as the connection might be unusable anyway. Or return 500.
            console.error(`Database error deleting Clio integration for user ${user.id}:`, dbError);
            throw new Error("Failed to remove integration details from database.");
        }

        console.log(`Successfully deleted Clio integration record for user ${user.id}.`);

        // Optional: Call Clio's token revocation endpoint if available/necessary.
        // This would require retrieving the token *before* deleting the record.

        // 3. Return Success Response
        return res.status(200).json({ message: 'Clio integration disconnected successfully.' });

    } catch (error) {
        console.error(`Failed to disconnect Clio for user ${user.id}:`, error);
        const message = error instanceof Error ? error.message : "An unknown error occurred during disconnection.";
        return res.status(500).json({ error: message });
    }
}
