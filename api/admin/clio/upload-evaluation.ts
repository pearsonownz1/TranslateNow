import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '../../_lib/encryption.js';
import { IncomingForm, File, Fields, Files } from 'formidable'; // Use formidable for multipart/form-data
import fs from 'fs'; // Needed to read the temporary file
import path from 'path'; // Needed for file path operations

// --- Environment Variables ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clioApiBaseUrl = 'https://app.clio.com';

// --- Basic Validation ---
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Supabase environment variables are missing for Clio evaluation upload.");
}

// Initialize Supabase Admin client
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!);

// Disable Vercel's default body parsing for this route to handle multipart/form-data
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to parse form data
const parseForm = (req: VercelRequest): Promise<{ fields: Fields; files: Files }> => {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log("Received request to upload Clio evaluation.");

    let tempFilePath: string | undefined;

    try {
        // --- Parse Form Data ---
        const { fields, files } = await parseForm(req);
        const clioQuoteIdValue = fields.clioQuoteId;
        const clioQuoteId = Array.isArray(clioQuoteIdValue) ? clioQuoteIdValue[0] : clioQuoteIdValue;
        const evaluationFileValue = files.evaluationFile;
        const evaluationFile = Array.isArray(evaluationFileValue) ? evaluationFileValue[0] : evaluationFileValue;

        if (!clioQuoteId || typeof clioQuoteId !== 'string') return res.status(400).json({ error: "Missing or invalid 'clioQuoteId' field." });
        if (!evaluationFile) return res.status(400).json({ error: "Missing 'evaluationFile' field." });

        tempFilePath = evaluationFile.filepath;
        const originalFilename = evaluationFile.originalFilename || 'evaluation.pdf';
        const mimeType = evaluationFile.mimetype || 'application/pdf';

        console.log(`Attempting evaluation upload for Clio Quote ID: ${clioQuoteId}, File: ${originalFilename}`);

        // --- Fetch Quote Details (including the stored clio_matter_id) ---
        const { data: quoteData, error: quoteError } = await supabaseAdmin
            .from('clio_quotes')
            .select('user_id, clio_matter_id') // Fetch user_id and the stored clio_matter_id
            .eq('id', clioQuoteId)
            .single();

        if (quoteError) throw quoteError;
        if (!quoteData) throw new Error(`Clio Quote with ID ${clioQuoteId} not found.`);

        const userId = quoteData.user_id;
        const matterIdForUpload = quoteData.clio_matter_id; // Use the stored Matter ID

        console.log(`Found quote details: UserID ${userId}, Stored Clio Matter ID: ${matterIdForUpload}`);

        // --- Ensure we have a Matter ID ---
        // This check now uses the ID stored during the custom action request
        if (!matterIdForUpload) {
             const errorMessage = `Cannot upload evaluation: No Clio Matter ID is associated with this quote request (ID: ${clioQuoteId}). The quote might have originated from a Clio Document not linked to a Matter.`;
             console.error(errorMessage);
             // Return 400 Bad Request as this is a data issue preventing the action
             return res.status(400).json({ error: errorMessage });
        }

        // --- Fetch User's Clio Credentials ---
        const { data: integrationData, error: integrationError } = await supabaseAdmin
            .from('user_integrations')
            .select('access_token')
            .eq('user_id', userId)
            .eq('integration_name', 'clio')
            .single();

        if (integrationError) throw integrationError;
        if (!integrationData) throw new Error(`Clio integration not found for user ${userId}.`);

        // --- Decrypt Token ---
        let accessToken: string;
        try {
            accessToken = decrypt(integrationData.access_token);
        } catch (decryptionError) {
            console.error(`Failed to decrypt token for user ${userId}:`, decryptionError);
            return res.status(500).json({ error: "Failed to process integration credentials." });
        }

        // --- Upload Document to Clio ---
        // Remove ?fields=id,uuid as it's not supported by POST
        const uploadUrl = `${clioApiBaseUrl}/api/v4/documents`; 
        console.log(`Uploading evaluation to Clio URL: ${uploadUrl} for Matter ID: ${matterIdForUpload}`);

        const clioFormData = new FormData();
        const fileBuffer = fs.readFileSync(tempFilePath);
        const fileBlob = new Blob([fileBuffer], { type: mimeType });
        // Append file first
        clioFormData.append('file', fileBlob, originalFilename);

        // Append metadata as individual fields using bracket notation
        clioFormData.append('data[name]', `Evaluation - ${originalFilename}`);
        clioFormData.append('data[parent][id]', matterIdForUpload.toString());
        clioFormData.append('data[parent][type]', 'Matter');
        // Note: 'category' and 'type' don't seem to be standard Clio document fields via FormData,
        // but we'll leave them out for now based on the feedback suggesting the above structure.
        // If needed later, they might be data[category] or similar.

        console.log("FormData fields being sent (excluding file):", {
            'data[name]': `Evaluation - ${originalFilename}`,
            'data[parent][id]': matterIdForUpload.toString(),
            'data[parent][type]': 'Matter'
        });

        const clioResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
                // Do NOT set Content-Type manually for FormData
            },
            body: clioFormData
        });

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
            console.error(`Failed to upload evaluation to Clio. Details: ${errorDetails}`);
            throw new Error(`Failed to upload evaluation to Clio: ${errorDetails}`);
        }

        const clioUploadResult = await clioResponse.json();
        const documentId = clioUploadResult?.data?.id;

        if (!documentId) {
             console.error("Clio POST upload response missing document ID:", clioUploadResult);
             throw new Error("Clio POST upload response did not contain the expected document ID.");
        }
        console.log(`Successfully initiated upload to Clio. Document ID: ${documentId}`);

        // --- Step 2: GET Document Details to retrieve UUID ---
        // Remove ?fields=uuid - fetch full details to get UUID
        const getDetailsUrl = `${clioApiBaseUrl}/api/v4/documents/${documentId}`; 
        console.log(`Fetching document details to get UUID: GET ${getDetailsUrl}`);
        
        const getResponse = await fetch(getDetailsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!getResponse.ok) {
            let getErrorDetails = `Clio GET Error: ${getResponse.status} ${getResponse.statusText}`;
            try {
                const errorJson = await getResponse.json();
                console.error("Clio GET Error Response Body:", JSON.stringify(errorJson, null, 2));
                const specificMessage = errorJson?.error?.message || errorJson?.message || JSON.stringify(errorJson);
                getErrorDetails = `Clio GET Error (${getResponse.status}): ${specificMessage}`;
            } catch (e) {
                 try { const errorText = await getResponse.text(); console.error("Clio GET Error Response Text:", errorText); getErrorDetails += `\nResponse Text: ${errorText}`; }
                 catch (_) { console.error("Could not read Clio GET error response body."); }
            }
            console.error(`Failed to fetch document details from Clio. Details: ${getErrorDetails}`);
            throw new Error(`Failed to fetch Clio document details: ${getErrorDetails}`);
        }

        const documentDetails = await getResponse.json();
        const documentUuid = documentDetails?.data?.uuid;

        if (!documentUuid) {
            console.error("Clio GET response missing document UUID:", documentDetails);
            throw new Error("Clio GET response did not contain the expected document UUID.");
        }
        console.log(`Successfully retrieved document UUID: ${documentUuid}`);

        // --- Step 3: Mark Document as Fully Uploaded (PATCH) ---
        // Remove invalid ?fields=... parameter from PATCH URL
        const patchUrl = `${clioApiBaseUrl}/api/v4/documents/${documentId}`; 
        console.log(`Marking document as fully uploaded: PATCH ${patchUrl}`);

        const patchBody = JSON.stringify({
            data: {
                uuid: documentUuid,
                fully_uploaded: true 
            }
        });

        const patchResponse = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: patchBody
        });

        if (!patchResponse.ok) {
            let patchErrorDetails = `Clio PATCH Error: ${patchResponse.status} ${patchResponse.statusText}`;
            try {
                const errorJson = await patchResponse.json();
                console.error("Clio PATCH Error Response Body:", JSON.stringify(errorJson, null, 2));
                const specificMessage = errorJson?.error?.message || errorJson?.message || JSON.stringify(errorJson);
                patchErrorDetails = `Clio PATCH Error (${patchResponse.status}): ${specificMessage}`;
            } catch (e) {
                 try { const errorText = await patchResponse.text(); console.error("Clio PATCH Error Response Text:", errorText); patchErrorDetails += `\nResponse Text: ${errorText}`; }
                 catch (_) { console.error("Could not read Clio PATCH error response body."); }
            }
            console.error(`Failed to mark document as fully uploaded. Details: ${patchErrorDetails}`);
            // Decide if we should still update Supabase or throw. Let's throw for now.
            throw new Error(`Failed to finalize Clio upload: ${patchErrorDetails}`);
        }

        const patchResult = await patchResponse.json();
        console.log("Successfully marked document as fully uploaded in Clio:", patchResult);

        // --- Update Quote Status in Supabase ---
        console.log(`Proceeding to update Supabase status for clio_quotes ID ${clioQuoteId}`);
        const { error: updateError } = await supabaseAdmin
            .from('clio_quotes')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('id', clioQuoteId);

        if (updateError) console.error(`Failed to update clio_quotes status for ID ${clioQuoteId}:`, updateError);
        else console.log(`Successfully updated status for clio_quotes ID ${clioQuoteId} to completed.`);

        // --- Respond to Client ---
        res.status(200).json({ success: true, message: 'Evaluation uploaded and sent to Clio successfully.' });

    } catch (error: any) {
        console.error("Error processing Clio evaluation upload request:", error);
        const message = error.message || "An unknown error occurred.";
        // Send specific error message back if it was the Matter ID issue
        if (message.startsWith("Cannot upload evaluation:")) {
             res.status(400).json({ success: false, error: message });
        } else {
             res.status(500).json({ success: false, error: `Failed to upload evaluation: ${message}` });
        }
    } finally {
         if (tempFilePath) {
             fs.unlink(tempFilePath, (err) => { if (err) console.error("Error deleting temporary upload file:", err); });
         }
    }
}
