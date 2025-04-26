import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer'; // For Basic Auth encoding

// --- Configuration ---
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const invoicedApiKey = process.env.INVOICED_API_KEY!; // CRITICAL: Ensure this is set in Vercel Env Vars
const quoteFee = 50; // Example flat fee per quote request - move to env var ideally
const invoicedBaseUrl = 'https://api.invoiced.com';
const QUOTES_TABLE_NAME = 'api_quote_requests'; // CORRECTED: Target the API quotes table

// --- Supabase Clients ---
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnonClient = createClient(supabaseUrl, supabaseAnonKey);

// --- Types (adjust based on actual data) ---
interface QuoteRequest {
  id: string | number;
  applicant_name?: string;
  country_of_education?: string;
  degree_received?: string;
  // Add other fields needed for line item description
}

interface ClientUser {
    id: string;
    email?: string;
    user_metadata?: {
        first_name?: string;
        last_name?: string;
        company_name?: string; // Used for Invoiced customer name
        billing_email?: string; // Used for Invoiced customer email
    };
}

// --- Invoiced.com API Helper Functions ---

// Generic function to make requests to the Invoiced API
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
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : undefined,
        });

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

        // Handle potential empty body for 201/204
        if (response.status === 201 || response.status === 204) {
             const textBody = await response.text();
             try {
                 return textBody ? JSON.parse(textBody) : {}; // Parse if not empty, else return {}
             } catch (e) {
                 console.log(`Received ${response.status} with non-JSON or empty body.`);
                 return {};
             }
        }

        // Parse JSON for other successful responses
        if (response.headers.get('content-type')?.includes('application/json')) {
            return await response.json();
        } else {
            console.warn(`Received non-JSON response from Invoiced API: ${response.headers.get('content-type')}`);
            return await response.text();
        }
    } catch (error) {
        console.error(`Network or parsing error during Invoiced API call to ${url}:`, error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('An unknown error occurred during the Invoiced API request.');
        }
    }
}

// Finds an Invoiced customer by email or creates one if not found. Returns the Invoiced customer ID.
async function findOrCreateInvoicedCustomer(client: ClientUser): Promise<number> {
    const billingEmail = client.user_metadata?.billing_email || client.email;
    const companyName = client.user_metadata?.company_name || `${client.user_metadata?.first_name || ''} ${client.user_metadata?.last_name || ''}`.trim() || client.email;

    if (!billingEmail) throw new Error(`Cannot determine billing email for client ID ${client.id}`);
    if (!companyName) throw new Error(`Cannot determine company name for client ID ${client.id}`);

    console.log(`Searching Invoiced for customer with email: ${billingEmail}`);
    const searchResults = await invoicedApiRequest(`/customers?email=${encodeURIComponent(billingEmail)}`, 'GET');

    if (Array.isArray(searchResults) && searchResults.length > 0 && searchResults[0].id) {
        console.log(`Found existing Invoiced customer ID: ${searchResults[0].id}`);
        return searchResults[0].id;
    } else {
        console.log(`Customer not found, creating new Invoiced customer: ${companyName} (${billingEmail})`);
        const newCustomer = await invoicedApiRequest('/customers', 'POST', {
            name: companyName,
            email: billingEmail,
            metadata: { supabase_user_id: client.id } // Link back to Supabase user
        });
        if (!newCustomer || !newCustomer.id) {
             throw new Error("Failed to create customer or retrieve ID from Invoiced API response.");
        }
        console.log(`Created new Invoiced customer ID: ${newCustomer.id}`);
        return newCustomer.id;
    }
}

// Creates and sends an invoice on Invoiced.com. Returns the created invoice object.
async function createAndSendInvoice(customerId: number, lineItems: any[]): Promise<{ id: number | string, url?: string }> {
    if (lineItems.length === 0) {
        throw new Error("Cannot create an invoice with no line items.");
    }
    console.log(`Creating and sending invoice for customer ID: ${customerId} with ${lineItems.length} items.`);
    const invoiceData = await invoicedApiRequest('/invoices', 'POST', {
        customer: customerId,
        draft: false, // Finalize and send immediately
        payment_terms: "NET 15", // Example payment terms
        items: lineItems,
        // Add other desired invoice fields here
    });
     if (!invoiceData || !invoiceData.id) {
         throw new Error("Failed to create invoice or retrieve ID from Invoiced API response.");
     }
    console.log(`Invoice created and sent. Invoiced ID: ${invoiceData.id}, URL: ${invoiceData.url}`);
    return invoiceData; // Return the full invoice object (includes id, url, etc.)
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

  let invoicedInvoiceId: number | string | null = null; // To store the ID for potential rollback/logging

  try {
    // 1. Authenticate the ADMIN making the request
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required (Admin)' });
    const { data: { user: adminUser }, error: adminAuthError } = await supabaseAnonClient.auth.getUser(token);
    if (adminAuthError || !adminUser || adminUser.app_metadata?.role !== 'admin') {
      console.error('Admin Auth Error:', adminAuthError);
      return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
    }

    // 3. Get the target client ID from the request body
    const { clientId } = req.body;
    if (!clientId) return res.status(400).json({ error: 'Missing clientId in request body' });

    // 4. Fetch Client Details
     const { data: clientData, error: clientFetchError } = await supabaseAdmin.auth.admin.getUserById(clientId);
     if (clientFetchError || !clientData?.user) {
         console.error('Error fetching client details:', clientFetchError);
         return res.status(404).json({ error: 'Client user not found', details: clientFetchError?.message });
     }
     const client = clientData.user as ClientUser;

    // 5. Fetch unbilled quote requests for the client
    console.log(`Fetching unbilled quotes for client ID: ${clientId}`);
    const { data: unbilledQuotes, error: fetchError } = await supabaseAdmin
      .from(QUOTES_TABLE_NAME) // Use the corrected table name
      .select('id, applicant_name, country_of_education, degree_received') // Select fields needed
      .eq('user_id', clientId)
      .eq('status', 'completed'); // CORRECTED: Filter by 'completed' status
      // TODO (Optional Refinement): Add '.is('invoice_id', null)' if applicable

    if (fetchError) throw new Error(`Failed to fetch completed API quote requests: ${fetchError.message}`); // Updated error message
    if (!unbilledQuotes || unbilledQuotes.length === 0) {
      return res.status(400).json({ message: 'No completed API quote requests found for this client to invoice.' }); // Updated message
    }
    console.log(`Found ${unbilledQuotes.length} completed API quote requests to invoice.`); // Updated log message

    // 6. Find or Create Customer on Invoiced.com
    const invoicedCustomerId = await findOrCreateInvoicedCustomer(client);

    // 7. Prepare Line Items
    const lineItems = unbilledQuotes.map((quote: QuoteRequest) => ({
      name: `API Quote Request: ${quote.applicant_name || 'N/A'} - ${quote.country_of_education || 'N/A'}`, // Example description
      quantity: 1,
      unit_cost: quoteFee, // Using the configured flat fee
    }));

    // 8. Create and Send Invoice via Invoiced.com
    const invoice = await createAndSendInvoice(invoicedCustomerId, lineItems);
    invoicedInvoiceId = invoice.id; // Store the ID

    // 9. Update quote_requests in Supabase DB
    const quoteIdsToUpdate = unbilledQuotes.map(q => q.id);
    console.log(`Marking quote IDs as billed: ${quoteIdsToUpdate.join(', ')} with Invoice ID: ${invoicedInvoiceId}`);
    // Decide on the final status after invoicing, e.g., 'invoiced'
    // Also ensure you have an 'invoice_id' column (text or number) in 'api_quote_requests'
    const { error: updateError } = await supabaseAdmin
      .from(QUOTES_TABLE_NAME) // Use the corrected table name
      .update({ status: 'invoiced', invoice_id: invoicedInvoiceId.toString() }) // CORRECTED: Update 'status' and link invoice_id
      .in('id', quoteIdsToUpdate);

    if (updateError) {
      console.error('Error updating API quote requests:', updateError); // Updated log message
      // Return success but warn about DB update failure
      return res.status(207).json({
          message: `Invoice ${invoicedInvoiceId} generated and sent, but failed to update all API quote statuses in DB. Please check manually.`, // Updated message
          invoiceId: invoicedInvoiceId,
          invoiceUrl: invoice.url, // Include URL if available
          billedQuotes: quoteIdsToUpdate,
          updateError: updateError.message
       });
    }

    // 10. Return Success
    return res.status(200).json({
        message: `Invoice ${invoicedInvoiceId} generated and sent successfully for ${unbilledQuotes.length} quote requests.`,
        invoiceId: invoicedInvoiceId,
        invoiceUrl: invoice.url, // Include URL if available
        billedQuotes: quoteIdsToUpdate,
     });

  } catch (error) {
    console.error('Error in generate-invoice handler:', error); // Keep detailed server-side logging

    let responseStatus = 500;
    let responseError = 'Internal Server Error during invoice generation.';
    let responseDetails = error instanceof Error ? error.message : 'An unexpected error occurred.';

    // Check for specific error types to provide better client feedback
    if (error instanceof Error) {
        if (error.message.startsWith('Invoiced API Error:')) {
            // Try to extract status from the Invoiced error message
            const match = error.message.match(/\(Status: (\d+)\)/);
            const invoicedStatus = match ? parseInt(match[1], 10) : null;

            if (invoicedStatus && invoicedStatus >= 400 && invoicedStatus < 500) {
                // Map Invoiced 4xx errors to a 400 Bad Request from our API
                responseStatus = 400;
                responseError = 'Invoice generation failed due to invalid data or configuration issue with the invoicing service.';
                // Keep the specific upstream message in details for internal use
                responseDetails = `Upstream error: ${error.message}`;
            } else {
                // For Invoiced 5xx errors or unknown status
                responseStatus = 502; // Bad Gateway might be more appropriate
                responseError = 'Invoice generation failed due to an issue with the invoicing service.';
                responseDetails = `Upstream error: ${error.message}`;
            }
        } else if (error.message.includes('Failed to fetch completed API quote requests')) {
            responseStatus = 500; // Internal error fetching data
            responseError = 'Could not retrieve quote requests needed to generate the invoice.';
        } else if (error.message.includes('Client user not found')) {
            responseStatus = 404; // Client specified doesn't exist
            responseError = 'Client user specified for invoice generation not found.';
        } else if (error.message.includes('Cannot determine billing email') || error.message.includes('Cannot determine company name')) {
            responseStatus = 400; // Data required for invoicing is missing from the client profile
            responseError = 'Client information is incomplete for invoicing. Please update billing details.';
        } else if (error.message.includes('No completed API quote requests found')) {
             responseStatus = 400; // No billable items found
             responseError = 'No completed quote requests found for this client to invoice.';
        } else if (error.message.includes('Cannot create an invoice with no line items')) {
             responseStatus = 400; // Should be caught earlier, but handle defensively
             responseError = 'Cannot generate an invoice with zero items.';
        }
        // Keep the original error message in details unless overwritten above
        if (responseDetails === error.message && responseStatus !== 400 && responseStatus !== 404) {
             // Avoid leaking potentially sensitive internal details for generic 500s/502s
             responseDetails = 'See server logs for more information.';
        }
    }

    // Return the structured error response
    return res.status(responseStatus).json({
        error: responseError,
        details: responseDetails, // Provide specific details for debugging
        failedInvoiceId: invoicedInvoiceId // Include if invoice was partially successful (created but DB update failed)
    });
  }
}
