import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient type
import crypto from 'crypto'; // For potential signature verification

// --- Environment Variables ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use Service Role Key for database writes triggered by webhook
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Clio might provide a secret for verifying webhook signatures
const clioWebhookSecret = process.env.CLIO_WEBHOOK_SECRET;

// --- Basic Validation ---
if (!supabaseUrl || !supabaseServiceRoleKey /* || !clioWebhookSecret */) { // Removed Anon Key check, not needed here
    console.error("One or more required environment variables are missing for Clio deauthorize webhook.");
    // Avoid throwing here in production
}

// Initialize Supabase with Service Role Key for elevated privileges
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!);

/**
 * Placeholder: Verifies the webhook signature from Clio.
 * Replace with actual implementation based on Clio's documentation.
 * @param req VercelRequest
 * @returns boolean True if signature is valid, false otherwise.
 */
const verifyClioSignature = (req: VercelRequest): boolean => {
    console.warn("TODO: Implement Clio webhook signature verification using CLIO_WEBHOOK_SECRET.");
    // Example structure (needs actual header name and raw body handling):
    // const signature = req.headers['x-clio-webhook-signature'];
    // const rawBody = (req as any).rawBody || JSON.stringify(req.body); // Vercel might need config for raw body
    // if (!signature || !rawBody || !clioWebhookSecret) return false;
    // const hmac = crypto.createHmac('sha256', clioWebhookSecret);
    // const digest = Buffer.from('sha256=' + hmac.update(rawBody).digest('hex'), 'utf8');
    // const checksum = Buffer.from(signature, 'utf8');
    // try {
    //     return crypto.timingSafeEqual(digest, checksum);
    // } catch {
    //     return false;
    // }
    return true; // Placeholder - REMOVE IN PRODUCTION
};

/**
 * Placeholder: Finds the internal user ID based on an identifier from Clio.
 * This might involve looking up a value stored in `user_integrations.clio_user_identifier`.
 * @param identifier The identifier received from Clio's webhook payload.
 * @param dbClient Supabase admin client instance.
 * @returns User ID string or null if not found.
 */
async function findUserIdByIdentifier(identifier: string, dbClient: SupabaseClient): Promise<string | null> {
    console.warn(`TODO: Implement findUserIdByIdentifier. Searching for Clio identifier: ${identifier}`);
    // Example lookup (assuming identifier is stored in 'clio_user_identifier'):
    /*
    if (!identifier) return null;
    const { data, error } = await dbClient
        .from('user_integrations')
        .select('user_id')
        .eq('clio_user_identifier', identifier) // Adjust column name if different
        .eq('integration_name', 'clio')
        .maybeSingle(); // Use maybeSingle to handle 0 or 1 result gracefully

    if (error) {
        console.error(`Error finding user by Clio identifier ${identifier}:`, error);
        return null;
    }
    return data?.user_id || null;
    */
   return null; // Placeholder
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 1. Verify Webhook Signature
    if (!verifyClioSignature(req)) {
        console.warn("Invalid Clio webhook signature received.");
        // Return 403 Forbidden if signature is invalid
        return res.status(403).json({ error: 'Invalid signature.' });
    }

    // 2. Process Webhook Payload
    try {
        const payload = req.body; // Assumes Vercel parses JSON body automatically

        // 3. Identify User from Payload
        // Extract the user identifier based on Clio's webhook payload structure.
        // This needs to be confirmed from Clio documentation.
        const identifier = payload?.identifier || payload?.user_id || payload?.account_id; // Adjust based on actual payload key

        if (!identifier) {
             console.error("Clio deauthorize webhook missing user identifier in payload:", payload);
             // Return 2xx even if we can't identify, to acknowledge receipt to Clio
             return res.status(200).json({ message: 'Webhook received but missing identifier.' });
        }

        console.log(`Received Clio deauthorization webhook for identifier: ${identifier}`);

        // 4. Find internal user ID based on Clio identifier
        const userIdToDeauthorize = await findUserIdByIdentifier(identifier, supabaseAdmin);

        if (!userIdToDeauthorize) {
            // Log that we couldn't find the user, but acknowledge the webhook to Clio
            console.warn(`Could not find internal user matching Clio identifier: ${identifier}. Cannot delete tokens.`);
            return res.status(200).json({ message: 'Webhook received but user mapping not found.' });
        }

        // 5. Delete Stored Tokens from Database
        console.log(`Attempting to deauthorize Clio for internal user: ${userIdToDeauthorize}`);

        const { error: dbError } = await supabaseAdmin
            .from('user_integrations')
            .delete()
            .match({ user_id: userIdToDeauthorize, integration_name: 'clio' });

        if (dbError) {
            // Log the error but still return 2xx to Clio
            console.error(`Database error deleting Clio integration via webhook for user ${userIdToDeauthorize}:`, dbError);
        } else {
            console.log(`Successfully deauthorized Clio via webhook for user ${userIdToDeauthorize}`);
        }

        // 6. Acknowledge Webhook
        // Always return 2xx to Clio to prevent retries if the webhook was validly signed
        // and we attempted processing, even if DB operations failed on our end.
        return res.status(200).json({ message: 'Webhook processed.' });

    } catch (error) {
        console.error("Clio deauthorize webhook processing failed:", error);
        // Return 2xx to prevent Clio from retrying unnecessarily for server errors
        // Log the error for investigation.
        return res.status(200).json({ message: 'Webhook received but encountered an internal server error during processing.' });
    }
}
