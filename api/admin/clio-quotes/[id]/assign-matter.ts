import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// --- Environment Variables ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- Basic Validation ---
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Supabase environment variables are missing for assign-matter endpoint.");
    // In a real app, you might have a more robust way to handle this at startup
}

// Initialize Supabase Admin client
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // TODO: Add admin authentication/authorization check here
    // Example: Check if the user making the request has admin privileges
    // This is crucial for security. Skipping for brevity in this example.
    // const { user } = await supabaseAdmin.auth.api.getUserByCookie(req);
    // if (!user || !isAdmin(user.id)) { // isAdmin would be your custom logic
    //     return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    // }

    const { id: quoteId } = req.query; // Extract quote ID from the dynamic route parameter
    const { matter_id: matterId } = req.body; // Extract matter_id from the request body

    console.log(`Received request to assign Matter ID for Quote ID: ${quoteId}`);

    // --- Input Validation ---
    if (!quoteId || typeof quoteId !== 'string') {
        return res.status(400).json({ error: "Missing or invalid 'quoteId' in URL path." });
    }
    if (matterId === undefined || matterId === null) {
        return res.status(400).json({ error: "Missing 'matter_id' in request body." });
    }
    if (typeof matterId !== 'number' || !Number.isInteger(matterId) || matterId <= 0) {
        // Clio IDs are typically positive integers (BIGINT in Supabase)
        return res.status(400).json({ error: "Invalid 'matter_id': Must be a positive integer number." });
    }

    try {
        console.log(`Attempting to update clio_quotes ID ${quoteId} with clio_matter_id ${matterId}`);

        // --- Database Update ---
        const { data, error: updateError } = await supabaseAdmin
            .from('clio_quotes')
            .update({
                clio_matter_id: matterId,
                updated_at: new Date().toISOString() // Also update the timestamp
            })
            .eq('id', quoteId)
            .select('id, clio_matter_id') // Select to confirm the update
            .single(); // Expecting a single row update

        if (updateError) {
            console.error(`Database error updating quote ${quoteId}:`, updateError);
            // Check for specific errors, e.g., foreign key violation if matter_id doesn't exist in a related table (if applicable)
            if (updateError.code === '23503') { // Foreign key violation (example)
                 return res.status(400).json({ error: `Invalid Matter ID: ${matterId}. Ensure it exists in Clio.` });
            }
            // Check if the quote ID itself was not found
            if (updateError.code === 'PGRST116') { // No rows found for the update condition
                 return res.status(404).json({ error: `Quote with ID ${quoteId} not found.` });
            }
            return res.status(500).json({ error: `Database error: ${updateError.message}` });
        }

        if (!data) {
             // Should ideally be caught by PGRST116, but as a fallback
             console.error(`Update seemed successful but no data returned for quote ${quoteId}.`);
             return res.status(404).json({ error: `Quote with ID ${quoteId} not found or update failed silently.` });
        }

        console.log(`Successfully assigned Matter ID ${data.clio_matter_id} to Quote ID ${data.id}`);
        res.status(200).json({ success: true, message: 'Matter ID assigned successfully.', updatedQuote: data });

    } catch (error: any) {
        console.error(`Unhandled error assigning Matter ID for quote ${quoteId}:`, error);
        res.status(500).json({ error: `An unexpected server error occurred: ${error.message}` });
    }
}
