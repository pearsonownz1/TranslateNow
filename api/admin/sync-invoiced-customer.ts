import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';

// --- Configuration ---
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const invoicedApiKey = process.env.INVOICED_API_KEY!;
const invoicedBaseUrl = 'https://api.invoiced.com';

// --- Supabase Clients ---
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnonClient = createClient(supabaseUrl, supabaseAnonKey);

// --- Types ---
interface ClientUser {
    id: string;
    email?: string;
    user_metadata?: {
        first_name?: string;
        last_name?: string;
        company_name?: string;
        billing_email?: string;
    };
}

// --- Invoiced.com API Helper Functions ---

async function invoicedApiRequest(endpoint: string, method: 'GET' | 'POST', body?: any): Promise<any> {
    if (!invoicedApiKey) {
        throw new Error("INVOICED_API_KEY environment variable is not set.");
    }
    const headers = {
        'Authorization': `Basic ${Buffer.from(`${invoicedApiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json'
    };
    const url = `${invoicedBaseUrl}${endpoint}`;
    console.log(`Making Invoiced API request: ${method} ${url}`);
    try {
        const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
        console.log(`Invoiced API response status: ${response.status}`);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Invoiced API Error (${response.status}) for ${method} ${url}: ${errorBody}`);
            try {
                 const errorJson = JSON.parse(errorBody);
                 throw new Error(`Invoiced API Error: ${errorJson.message || errorBody} (Status: ${response.status})`);
            } catch(e) {
                 throw new Error(`Invoiced API request failed with status ${response.status}: ${errorBody}`);
            }
        }

        // Handle successful responses, checking for empty body first for 201/204
        if (response.status === 204) {
             console.log(`Received ${response.status} (No Content).`);
             return {}; // Return empty object for No Content
        }

        // For 200 or 201, try to read body, then parse
        const textBody = await response.text();
        if (!textBody) {
             console.log(`Received ${response.status} with empty body.`);
             return {}; // Return empty object if body is empty
        }

        if (response.headers.get('content-type')?.includes('application/json')) {
            try {
                return JSON.parse(textBody);
            } catch (e) {
                 console.error("Failed to parse JSON response body:", textBody, e);
                 throw new Error("Received invalid JSON response from Invoiced API.");
            }
        } else {
            console.warn(`Received non-JSON response from Invoiced API: ${response.headers.get('content-type')}`);
            return textBody; // Return text for other content types
        }
    } catch (error) {
        console.error(`Network or parsing error during Invoiced API call to ${url}:`, error);
        if (error instanceof Error) throw error;
        else throw new Error('An unknown error occurred during the Invoiced API request.');
    }
}

async function findOrCreateInvoicedCustomer(client: ClientUser): Promise<{ id: number, existed: boolean }> {
    const billingEmail = client.user_metadata?.billing_email || client.email;
    const companyName = client.user_metadata?.company_name || `${client.user_metadata?.first_name || ''} ${client.user_metadata?.last_name || ''}`.trim() || client.email;

    if (!billingEmail) throw new Error(`Cannot determine billing email for client ID ${client.id}`);
    if (!companyName) throw new Error(`Cannot determine company name for client ID ${client.id}`);

    console.log(`Searching Invoiced for customer with email: ${billingEmail}`);
    // Corrected again: Use filter[email]=... for searching Invoiced API (exact match)
    const searchResults = await invoicedApiRequest(`/customers?filter[email]=${encodeURIComponent(billingEmail)}`, 'GET');

    if (Array.isArray(searchResults) && searchResults.length > 0 && searchResults[0].id) {
        console.log(`Found existing Invoiced customer ID: ${searchResults[0].id}`);
        return { id: searchResults[0].id, existed: true }; // Return existing customer ID and flag
    } else {
        console.log(`Customer not found, creating new Invoiced customer: ${companyName} (${billingEmail})`);
        const newCustomer = await invoicedApiRequest('/customers', 'POST', {
            name: companyName,
            email: billingEmail,
            metadata: { supabase_user_id: client.id }
        });
        if (!newCustomer || !newCustomer.id) {
             throw new Error("Failed to create customer or retrieve ID from Invoiced API response.");
        }
        console.log(`Created new Invoiced customer ID: ${newCustomer.id}`);
        return { id: newCustomer.id, existed: false }; // Return new customer ID and flag
    }
}

// --- Vercel Serverless Function Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log check for environment variable (avoid logging the actual key)
  console.log('INVOICED_API_KEY check:', process.env.INVOICED_API_KEY ? 'Set' : 'Not Set or Empty');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!invoicedApiKey) {
      console.error("FATAL: INVOICED_API_KEY environment variable is not set.");
      return res.status(500).json({ error: 'Internal Server Configuration Error: Missing Invoiced API Key.' });
  }

  try {
    // 1. Authenticate the ADMIN making the request
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required (Admin)' });
    const { data: { user: adminUser }, error: adminAuthError } = await supabaseAnonClient.auth.getUser(token);
    if (adminAuthError || !adminUser || adminUser.app_metadata?.role !== 'admin') {
      console.error('Admin Auth Error:', adminAuthError);
      return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
    }

    // 2. Get the target client ID from the request body
    const { clientId } = req.body;
    if (!clientId) return res.status(400).json({ error: 'Missing clientId in request body' });

    // 3. Fetch Client Details using the Edge Function
    console.log(`Invoking get-user-details function for user ID: ${clientId}`);
    // Use the initialized anon client to invoke the function, passing the admin's token
    const { data: clientData, error: functionError } = await supabaseAnonClient.functions.invoke('get-user-details', {
        body: { userId: clientId },
        headers: { Authorization: `Bearer ${token}` } // Pass admin's token
    });

    if (functionError) {
        console.error("Error invoking get-user-details function:", functionError);
        let errorMessage = functionError.message;
         try { // Try to parse more specific error from function response
             const parsedError = JSON.parse(functionError.context?.responseText || '{}');
             if (parsedError.error) errorMessage = parsedError.error;
         } catch (parseErr) { /* Ignore if parsing fails */ }
        return res.status(500).json({ error: 'Failed to fetch client details via function', details: errorMessage });
    }

     if (!clientData || typeof clientData !== 'object' || !clientData.id) { // Check if data is a valid user object
         console.error('Invalid data received from get-user-details function:', clientData);
         return res.status(404).json({ error: 'Client user not found or invalid data received' });
     }
     const client = clientData as ClientUser; // Type assertion
     console.log("Successfully fetched client details via function.");

    // 4. Find or Create Customer on Invoiced.com
    const { id: invoicedCustomerId, existed } = await findOrCreateInvoicedCustomer(client);

    // 5. Return Success
    return res.status(200).json({
        message: existed ? `Customer found on Invoiced.com (ID: ${invoicedCustomerId}).` : `Customer created successfully on Invoiced.com (ID: ${invoicedCustomerId}).`,
        invoicedCustomerId: invoicedCustomerId,
        customerExisted: existed,
     });

  } catch (error) {
    console.error('Error in sync-invoiced-customer handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return res.status(500).json({ error: 'Internal Server Error during customer sync.', details: errorMessage });
  }
}
