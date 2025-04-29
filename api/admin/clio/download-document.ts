import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '../../_lib/encryption.js'; // Use shared decrypt

// --- Environment Variables ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin access
const clioApiBaseUrl = 'https://app.clio.com';

// --- Basic Validation ---
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Supabase environment variables are missing for Clio document download.");
    // In a real app, you might want to prevent the function from deploying or running
}

// Initialize Supabase Admin client (using Service Role Key for elevated access)
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log("Received request to download Clio document.");

    // --- TODO: Implement Robust Admin Authentication/Authorization ---
    // This is a placeholder. Replace with your actual admin check mechanism.
    // Option 1: Verify a session token passed in headers (more secure)
    // const token = req.headers.authorization?.split('Bearer ')[1];
    // if (!token) return res.status(401).json({ error: 'Unauthorized: Missing token' });
    // const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    // if (userError || !user) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    // if (user.app_metadata?.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admin access required' });
    // console.log(`Admin user ${user.id} authorized.`);
    // --- End Placeholder ---


    // --- Extract Query Parameter ---
    const { clioQuoteId } = req.query;
    if (!clioQuoteId || typeof clioQuoteId !== 'string') {
        return res.status(400).json({ error: "Missing or invalid 'clioQuoteId' query parameter." });
    }
    console.log(`Attempting download for Clio Quote ID: ${clioQuoteId}`);

    try {
        // --- Fetch Quote Details ---
        const { data: quoteData, error: quoteError } = await supabaseAdmin
            .from('clio_quotes')
            .select('user_id, clio_subject_id, clio_subject_type, subject_description') // Need user_id and clio_subject_id
            .eq('id', clioQuoteId)
            .single();

        if (quoteError) throw quoteError;
        if (!quoteData) throw new Error(`Clio Quote with ID ${clioQuoteId} not found.`);
        if (quoteData.clio_subject_type !== 'document' || !quoteData.clio_subject_id) {
            return res.status(400).json({ error: 'The associated Clio subject is not a downloadable document.' });
        }

        const userId = quoteData.user_id;
        const clioDocumentId = quoteData.clio_subject_id;
        const originalFilename = quoteData.subject_description || `clio-document-${clioDocumentId}`; // Fallback filename

        console.log(`Found quote details: UserID ${userId}, ClioDocID ${clioDocumentId}`);

        // --- Fetch User's Clio Credentials ---
        const { data: integrationData, error: integrationError } = await supabaseAdmin
            .from('user_integrations')
            .select('access_token, refresh_token, expires_at') // Select tokens
            .eq('user_id', userId)
            .eq('integration_name', 'clio')
            .single();

        if (integrationError) throw integrationError;
        if (!integrationData) throw new Error(`Clio integration not found for user ${userId}.`);

        // --- Decrypt Token (TODO: Add Refresh Logic) ---
        let accessToken: string;
        try {
            // WARNING: Missing token refresh logic here. Add in production.
            accessToken = decrypt(integrationData.access_token);
            // Check expiry if needed before attempting download
            // const expiresAt = integrationData.expires_at ? new Date(integrationData.expires_at) : null;
            // if (!expiresAt || expiresAt < new Date()) { // Basic check
            //     console.warn(`Token for user ${userId} might be expired. Refresh needed.`);
            //     // Trigger refresh logic here...
            //     // For now, we proceed assuming it might still work or fail at Clio's end.
            // }

        } catch (decryptionError) {
            console.error(`Failed to decrypt token for user ${userId}:`, decryptionError);
            return res.status(500).json({ error: "Failed to process integration credentials." });
        }

        // --- Fetch Document from Clio ---
        const downloadUrl = `${clioApiBaseUrl}/api/v4/documents/${clioDocumentId}/download`;
        console.log(`Fetching document from Clio URL: ${downloadUrl}`);

        const clioResponse = await fetch(downloadUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                // Clio might require a specific Accept header, or none for direct download
                // 'Accept': 'application/octet-stream' // Example if needed
            }
        });

        if (!clioResponse.ok) {
            // Try to get error details from Clio
            let clioErrorBody = `Clio API Error: ${clioResponse.status} ${clioResponse.statusText}`;
            try {
                const errorJson = await clioResponse.json();
                clioErrorBody = errorJson?.error?.message || clioErrorBody;
            } catch (_) { /* Ignore if response is not JSON */ }
            console.error(`Failed to download document from Clio: ${clioErrorBody}`);
            throw new Error(`Failed to download document from Clio: ${clioResponse.statusText}`);
        }

        // --- Stream Response Back to Client ---
        // Set headers for file download
        res.setHeader('Content-Type', clioResponse.headers.get('Content-Type') || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`); // Use original name if available
        // Vercel automatically handles streaming ReadableStream bodies
        // Note: Vercel has size limits for serverless function responses. Large files might fail.
        // Consider using Clio's temporary download URLs or Supabase Storage if large files are common.
        if (clioResponse.body) {
             // Pipe the readable stream from Clio's response directly to Vercel's response
             // Use Node.js stream piping for efficiency if needed, but Vercel often handles ReadableStream directly
             // For simplicity, let Vercel handle the ReadableStream body directly
             return res.status(200).send(clioResponse.body);

        } else {
             throw new Error("Clio response body was empty.");
        }

    } catch (error: any) {
        console.error("Error processing Clio document download request:", error);
        const message = error.message || "An unknown error occurred.";
        // Avoid sending detailed internal errors to the client
        res.status(500).json({ error: `Failed to download document: ${message}` });
    }
}
