import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcrypt";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Interface for the data selected from api_keys table
interface ApiKeyData {
  id: string;
  hashed_key: string;
  revoked: boolean;
  user_id: string;
  client_name: string;
}

// Interface for expected request body
interface QuoteRequestBody {
  country_of_education: string;
  college_attended: string;
  degree_received: string;
  year_of_graduation: number;
  notes?: string;
  applicant_name?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 1. Authenticate API Key
    const apiKey = req.headers.authorization?.split("Bearer ")[1];
    if (!apiKey) {
      return res.status(401).json({ error: "API key is required" });
    }

    // Basic validation: check prefix 'sk_'
    if (!apiKey.startsWith("sk_")) {
      return res.status(401).json({ error: "Invalid API key format" });
    }

    // Find potential keys by prefix (more efficient than scanning all keys)
    const keyPrefix = apiKey.substring(0, 8);
    const { data: potentialKeys, error: findError } = await supabaseAdmin
      .from("api_keys")
      .select("id, hashed_key, revoked, user_id, client_name") // Select necessary fields including client_name
      .eq("key_prefix", keyPrefix);

    if (findError) {
      console.error("Supabase find key error:", findError);
      return res.status(500).json({ error: "Error finding API key" });
    }

    if (!potentialKeys || potentialKeys.length === 0) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    let validKeyData: ApiKeyData | null = null; // Explicitly type the variable
    for (const key of potentialKeys) {
      // Assuming 'key' has the correct shape from Supabase select
      const isMatch = await bcrypt.compare(apiKey, key.hashed_key);
      if (isMatch) {
        validKeyData = key as ApiKeyData; // Assert the type on assignment
        break; // Found the matching key
      }
    }

    if (!validKeyData) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Check if the key is revoked
    if (validKeyData.revoked) {
      return res.status(403).json({ error: "API key has been revoked" });
    }

    const apiKeyId = validKeyData.id;
    const associatedUserId = validKeyData.user_id; // User who owns the key
    const clientName = validKeyData.client_name || "standard"; // Get client name from API key

    // 2. Validate Request Body
    const {
      country_of_education,
      college_attended,
      degree_received,
      year_of_graduation,
      notes,
      applicant_name,
    } = req.body as QuoteRequestBody;

    // Validate required fields based on client
    let requiredFields = [
      "country_of_education",
      "college_attended",
      "degree_received",
      "year_of_graduation",
    ];

    // HireRight does not require applicant_name, but other clients do
    if (clientName !== "hireright") {
      requiredFields.push("applicant_name");
    }

    const missingFields = requiredFields.filter(
      (field) => !(req.body as any)[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields in request body: ${missingFields.join(", ")}`,
        required: requiredFields,
      });
    }

    // Validate year_of_graduation type
    if (
      typeof year_of_graduation !== "number" ||
      !Number.isInteger(year_of_graduation)
    ) {
      return res
        .status(400)
        .json({ error: 'Field "year_of_graduation" must be an integer.' });
    }

    // 3. Update last_used_at for the API key (fire and forget - don't block response)
    supabaseAdmin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyId)
      .then(({ error: updateError }) => {
        if (updateError) {
          console.error(
            `Failed to update last_used_at for key ${apiKeyId}:`,
            updateError
          );
        } else {
          console.log(`Updated last_used_at for key ${apiKeyId}`);
        }
      });

    // 4. Insert into api_quote_requests table (ASSUMED TABLE NAME)
    const { data: newQuoteRequest, error: insertError } = await supabaseAdmin
      .from("api_quote_requests") // *** ASSUMPTION: Table name is 'api_quote_requests' ***
      .insert({
        api_key_id: apiKeyId,
        user_id: associatedUserId,
        country_of_education: country_of_education,
        college_attended: college_attended,
        degree_received: degree_received,
        year_of_graduation: year_of_graduation,
        notes: notes,
        status: "pending",
        applicant_name: applicant_name,
      })
      .select("id") // Select the ID of the newly created record
      .single(); // Expect a single record

    if (insertError) {
      console.error("Supabase insert quote request error:", insertError);
      return res.status(500).json({
        error: "Failed to create quote request",
        details: insertError.message,
      });
    }

    // 5. Return Success Response
    return res.status(201).json({
      message: "Quote request received successfully",
      quote_request_id: newQuoteRequest.id, // Return the ID of the new request
    });
  } catch (error) {
    console.error("Unexpected Error in /v1/quote-requests:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    // Avoid leaking sensitive details in production
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
