import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '../_lib/encryption.js'; // Adjust path relative to api/temp/

// --- Environment Variables ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clioApiBaseUrl = 'https://app.clio.com';

// --- Basic Validation ---
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Supabase environment variables are missing for Clio check.");
    // Don't exit here, let the handler return the error
}

// Initialize Supabase Admin client
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("Accessed /api/temp/check-clio-docs (Full Logic)"); // Log update

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        console.log("Method not allowed:", req.method);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // --- Get User ID and Matter ID from query parameters ---
    const userId = req.query.userId as string;
    const matterId = req.query.matterId as string;

    if (!userId) {
        console.log("Missing userId query parameter");
        return res.status(400).json({ error: "Missing 'userId' query parameter." });
    }
    if (!matterId) {
         console.log("Missing matterId query parameter");
        return res.status(400).json({ error: "Missing 'matterId' query parameter." });
    }
     if (!supabaseUrl || !supabaseServiceRoleKey) {
         console.log("Missing Supabase credentials");
         return res.status(500).json({ error: "Internal Server Configuration Error: Missing Supabase credentials." });
     }

    console.log(`Checking Clio documents for User ID: ${userId}, Matter ID: ${matterId}`);

    try {
        // --- Fetch User's Clio Credentials ---
        console.log(`Fetching integration token for user ${userId}...`);
        const { data: integrationData, error: integrationError } = await supabaseAdmin
            .from('user_integrations')
            .select('access_token')
            .eq('user_id', userId)
            .eq('integration_name', 'clio')
            .single();

        if (integrationError) {
             console.error(`Error fetching integration for user ${userId}:`, integrationError);
             // Provide more specific error if possible
             if (integrationError.code === 'PGRST116') { // PostgREST code for "Resource Not Found"
                 return res.status(404).json({ error: `Clio integration not found for user ${userId}.` });
             }
             throw integrationError; // Rethrow other DB errors
        }
        if (!integrationData) {
             console.log(`Clio integration not found for user ${userId}.`);
            return res.status(404).json({ error: `Clio integration not found for user ${userId}.` });
        }
        console.log(`Successfully fetched integration token placeholder for user ${userId}.`);

        // --- Decrypt Token ---
        let accessToken: string;
        try {
            console.log(`Attempting to decrypt token for user ${userId}...`);
            accessToken = decrypt(integrationData.access_token);
             console.log(`Successfully decrypted token for user ${userId}.`);
        } catch (decryptionError) {
            console.error(`Failed to decrypt token for user ${userId}:`, decryptionError);
            return res.status(500).json({ error: "Failed to process integration credentials." });
        }

        // --- List Documents in Clio Matter ---
        const listUrl = `${clioApiBaseUrl}/api/v4/matters/${matterId}/documents?fields=id,name,created_at,updated_at`; // Request specific fields
        console.log(`Fetching documents from Clio URL: ${listUrl}`);

        const clioResponse = await fetch(listUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        console.log(`Clio API response status: ${clioResponse.status}`);

        if (!clioResponse.ok) {
            let errorDetails = `Clio API Error: ${clioResponse.status} ${clioResponse.statusText}`;
            try {
                const errorJson = await clioResponse.json();
                console.error("Clio API Error Response Body:", JSON.stringify(errorJson, null, 2));
                const specificMessage = errorJson?.error?.message || errorJson?.message || JSON.stringify(errorJson);
                errorDetails = `Clio API Error (${clioResponse.status}): ${specificMessage}`;
            } catch (e) {
                 try { const errorText = await clioResponse.text(); console.error("Clio API Error Response Text:", errorText); errorDetails += `\nResponse Text: ${errorText}`; }
                 catch (_) { console.error("Could not read Clio API error response body."); }
            }
            console.error(`Failed to list documents from Clio. Details: ${errorDetails}`);
            // Return specific status code from Clio if possible
            return res.status(clioResponse.status).json({ success: false, error: `Failed to list documents from Clio: ${errorDetails}` });
        }

        const clioListResult = await clioResponse.json();
        console.log(`Successfully fetched documents for Matter ${matterId}. Count: ${clioListResult?.data?.length ?? 0}`);

        // --- Respond to Client ---
        res.status(200).json({
            success: true,
            message: `Found ${clioListResult?.data?.length ?? 0} documents for Matter ${matterId}.`,
            documents: clioListResult?.data ?? []
        });

    } catch (error: any) {
        console.error("Error processing Clio document list request:", error);
        const message = error.message || "An unknown error occurred.";
        res.status(500).json({ success: false, error: `Failed to list documents: ${message}` });
    }
}
