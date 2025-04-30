import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { decrypt } from "../../_lib/encryption.js"; // Add .js extension

// --- Environment Variables ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clioApiBaseUrl = "https://app.clio.com"; // Base URL for API calls

// --- Basic Validation ---
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Supabase environment variables are missing for Clio custom action."
  );
  // Consider throwing an error or handling this more gracefully depending on requirements
}

// Initialize Supabase Admin client
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!);

// --- Type Definitions (Simplified - adjust based on actual Clio response) ---
interface ClioSubjectData {
  id: number | string;
  etag?: string;
  name?: string; // For documents
  display_number?: string; // For matters
  description?: string; // For matters
  // Removed document_holder from here, will be fetched separately
  client?: {
    // For matters
    id: number | string;
    etag?: string;
    name?: string;
    email_addresses?: { email: string; primary: boolean }[];
  };
  parent?: {
    // For documents, represents the Matter, Contact, or Folder it's linked to
    id: number | string;
    type: "Matter" | "Contact" | "Folder"; // Added Folder
  };
  // Add other fields you might need from the subject_url response
}

// --- Helper Function to find Matter ID recursively ---
async function findMatterIdRecursive(
  currentItem: { id: string | number; type: string },
  accessToken: string,
  depth = 0,
  maxDepth = 5 // Limit recursion depth to prevent infinite loops
): Promise<number | null> {
  console.log(
    `[findMatterIdRecursive depth ${depth}] Checking item: Type=${currentItem.type}, ID=${currentItem.id}`
  );

  if (currentItem.type === "Matter") {
    console.log(
      `[findMatterIdRecursive] Found Matter directly: ID=${currentItem.id}`
    );
    // Ensure it's a number
    const matterIdNum = parseInt(String(currentItem.id), 10);
    return !isNaN(matterIdNum) ? matterIdNum : null;
  }

  if (currentItem.type !== "Folder" || depth >= maxDepth) {
    console.log(
      `[findMatterIdRecursive] Not a Folder or max depth reached. Stopping search.`
    );
    return null; // Not a Matter, not a Folder we can traverse, or too deep
  }

  // It's a Folder, fetch its parent
  const folderId = currentItem.id;
  console.log(
    `[findMatterIdRecursive] Item is Folder ${folderId}. Fetching its parent...`
  );
  const folderDetailsUrl = `${clioApiBaseUrl}/api/v4/folders/${folderId}?fields=parent{id,type}`;

  try {
    const folderRes = await fetch(folderDetailsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (!folderRes.ok) {
      console.error(
        `[findMatterIdRecursive] Failed to fetch Folder ${folderId} details (${folderRes.status})`
      );
      return null;
    }
    const folderData = await folderRes.json();
    const parent = folderData?.data?.parent;

    if (!parent || !parent.id || !parent.type) {
      console.warn(
        `[findMatterIdRecursive] Folder ${folderId} has no parent information.`
      );
      return null;
    }

    // Recurse with the parent
    return await findMatterIdRecursive(
      parent,
      accessToken,
      depth + 1,
      maxDepth
    );
  } catch (folderFetchErr: any) {
    console.error(
      `[findMatterIdRecursive] Error fetching Folder ${folderId} details: ${folderFetchErr.message}`
    );
    return null;
  }
}

// --- Helper Functions --- (Original functions follow)

/**
 * Validates the nonce and fetches subject data from Clio.
 */
async function validateNonceAndFetchSubject(
  subjectUrlRelative: string,
  nonce: string,
  accessToken: string
): Promise<{ valid: boolean; data?: ClioSubjectData; error?: string }> {
  // Reverted return type

  // *** REMOVED fields parameter construction ***

  // Construct validation URL without fields, using 'custom_action_nonce' parameter name
  const validationUrl = `${clioApiBaseUrl}${subjectUrlRelative}?custom_action_nonce=${encodeURIComponent(nonce)}`;
  console.log(`Validating nonce via URL: ${validationUrl}`);

  try {
    // Make the call - Clio might return minimal data or just status
    const response = await fetch(validationUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (response.ok) {
      // Nonce is valid. We might get some data back, but we won't rely on it here.
      let responseData: any; // Declare outside try
      try {
        responseData = await response.json(); // Assign inside try
        console.log(
          "Nonce validation successful. Response data (if any):",
          JSON.stringify(responseData)
        );
      } catch (e) {
        console.log("Nonce validation successful. Could not parse JSON body.");
        // Return valid, but no data assumed
        return { valid: true, data: undefined };
      }
      // If JSON parsed successfully, return it along with validity
      // Check if responseData exists and has a data property before accessing
      return {
        valid: true,
        data: responseData?.data as ClioSubjectData | undefined,
      };
    } else if (response.status === 403) {
      console.error(
        "Nonce validation failed (403 Forbidden). Nonce might be invalid, expired, or reused."
      );
      return {
        valid: false,
        error: "Invalid or expired request link (nonce validation failed).",
      };
    } else {
      // Handle other errors (like the 400 Bad Request)
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Nonce validation API call failed: ${response.status} - ${errorData?.error?.message || response.statusText}`
      );
      return {
        valid: false,
        error: `Failed to validate request with Clio (Status: ${response.status}).`,
      };
    }
  } catch (error) {
    console.error("Network error during nonce validation:", error);
    return {
      valid: false,
      error: "Network error communicating with Clio for validation.",
    };
  }
}

/**
 * Creates a quote request in OpenEval's database.
 * (This function remains largely the same as before)
 */
async function createOpenEvalQuoteRequest(
  details: {
    clioSubjectId?: string | number;
    clioSubjectType?: "matter" | "document";
    clioMatterId: number | null; // <<< ADDED: Store the determined Matter ID
    clioContactName?: string;
    clioContactEmail?: string;
    subjectDescription?: string;
    internalUserId: string;
  },
  dbClient: SupabaseClient
): Promise<{ success: boolean; quoteId?: string; error?: string }> {
  console.log("Attempting to create OpenEval quote request with details:", {
    ...details,
    clioMatterId: details.clioMatterId ?? "NULL",
  }); // Log null explicitly

  // --- Database insertion logic ---
  // IMPORTANT: Assumes a nullable 'clio_matter_id' column exists in 'clio_quotes' table
  const { data, error } = await dbClient
    .from("clio_quotes") // Use the new table name
    .insert({
      user_id: details.internalUserId,
      source: "clio_custom_action", // Matches default value in schema
      // Store generic subject ID and type, or map based on type
      clio_subject_id: details.clioSubjectId, // Keep original subject info
      clio_subject_type: details.clioSubjectType,
      clio_matter_id: details.clioMatterId, // <<< ADDED: Store determined Matter ID (can be null)
      client_name: details.clioContactName,
      client_email: details.clioContactEmail,
      subject_description: details.subjectDescription,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Database error creating quote request:", error);
    return {
      success: false,
      error: "Failed to create quote request in database.",
    };
  }
  if (!data?.id) {
    console.error("Quote request created but failed to retrieve ID.");
    return {
      success: false,
      error: "Failed to confirm quote request creation.",
    };
  }

  console.log(`Successfully created quote request with ID: ${data.id}`);
  return { success: true, quoteId: data.id };
}

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Expect GET request now
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("Received Clio Custom Action GET Request");

  // --- Extract Query Parameters ---
  const {
    user_id: clioUserId, // ID of the Clio user who clicked
    subject_url: encodedSubjectUrl,
    custom_action_nonce: nonce,
    // custom_action_id // We don't strictly need this for the current logic
  } = req.query;

  console.log(
    `Query Params - Clio User ID: ${clioUserId}, Encoded Subject URL: ${encodedSubjectUrl}, Nonce: ${nonce}`
  );

  // Validate required parameters
  if (!clioUserId || typeof clioUserId !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid 'user_id' query parameter." });
  }
  if (!encodedSubjectUrl || typeof encodedSubjectUrl !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid 'subject_url' query parameter." });
  }
  if (!nonce || typeof nonce !== "string") {
    return res.status(400).json({
      error: "Missing or invalid 'custom_action_nonce' query parameter.",
    });
  }

  const subjectUrlRelative = decodeURIComponent(encodedSubjectUrl);
  console.log(`Decoded Subject URL Relative Path: ${subjectUrlRelative}`); // Log the decoded URL
  // Basic check if URL looks like a Clio API path
  if (!subjectUrlRelative.startsWith("/api/v4/")) {
    console.error(`Invalid subject_url format: ${subjectUrlRelative}`);
    return res.status(400).json({ error: "Invalid 'subject_url' format." });
  }

  try {
    // --- Find Internal User and Tokens using Clio User ID ---
    console.log(
      `Looking up integration details for Clio User ID: ${clioUserId}`
    );
    // Fetch integration data. Do not use .single() as there might be duplicate rows
    // for the same integration_user_id due to potential data issues or logic flaws.
    const { data: integrationDataArray, error: dbFetchError } =
      await supabaseAdmin
        .from("user_integrations")
        .select("user_id, access_token, refresh_token, expires_at") // Select internal user_id
        .eq("integration_name", "clio")
        .eq("integration_user_id", clioUserId); // Match using the stored Clio User ID
    // Removed .single()

    if (
      dbFetchError ||
      !integrationDataArray ||
      integrationDataArray.length === 0
    ) {
      console.error(
        `Failed to find integration credentials for Clio User ID ${clioUserId}:`,
        dbFetchError || "No data returned from query."
      );
      // Check if the error is because the column doesn't exist
      if (
        dbFetchError?.message.includes(
          'column "integration_user_id" of relation "user_integrations" does not exist'
        )
      ) {
        console.error(
          "REMINDER: The 'integration_user_id' column needs to be added to the 'user_integrations' table."
        );
        return res.status(500).json({
          error:
            "Integration setup incomplete (DB schema). Please contact support or reconnect.",
        });
      }
      return res.status(404).json({
        error:
          "Integration not found or not configured correctly for this Clio user.",
      });
    }

    // Assuming the first result is the correct one if duplicates exist
    const integrationData = integrationDataArray[0];

    const internalUserId = integrationData.user_id;
    console.log(
      `Found OpenEval User ID: ${internalUserId} for Clio User ID: ${clioUserId}`
    );

    // --- Decrypt Token (Refresh logic might be needed here too, but skipping for brevity initially) ---
    let accessToken: string;
    try {
      // TODO: Add token refresh logic here if needed, similar to the previous POST version
      accessToken = decrypt(integrationData.access_token);
    } catch (decryptionError) {
      console.error(
        `Failed to decrypt token for user ${internalUserId}:`,
        decryptionError
      );
      return res
        .status(500)
        .json({ error: "Failed to process integration credentials." });
    }

    // --- Validate Nonce (and potentially get basic data) ---
    const validationResult = await validateNonceAndFetchSubject(
      subjectUrlRelative,
      nonce,
      accessToken
    );

    if (!validationResult.valid) {
      return res.status(403).json({
        error: validationResult.error || "Request validation failed.",
      });
    }
    console.log("Nonce validation successful.");

    // --- Nonce Validated, Now Fetch Full Subject Details Separately ---
    // We use subjectDataFromValidation primarily for the ID if needed, but fetch fresh details
    const subjectIdFromValidation = validationResult.data?.id; // May be undefined if validation returns no data
    let subjectData: ClioSubjectData | null = null;
    let fetchDetailsError: string | null = null;
    try {
      // Construct the URL to fetch actual details, *without* the nonce, but *with* fields
      let fields = "id,etag"; // Base fields
      if (subjectUrlRelative.includes("/matters/")) {
        fields +=
          ",display_number,description,client{id,etag,name,email_addresses}";
      } else if (subjectUrlRelative.includes("/documents/")) {
        // Use parent instead of document_holder
        fields += ",name,parent{id,type,matter}"; // Get parent info (Matter or Contact)
      }
      const detailsUrl = `${clioApiBaseUrl}${subjectUrlRelative}?fields=${fields}`; // Use relative URL from input
      console.log(`Fetching full subject details from: ${detailsUrl}`);

      const detailsResponse = await fetch(detailsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!detailsResponse.ok) {
        throw new Error(
          `Failed to fetch subject details (Status: ${detailsResponse.status})`
        );
      }
      const detailsData = await detailsResponse.json();
      subjectData = detailsData.data as ClioSubjectData;
      console.log(
        "Successfully fetched subject details:",
        JSON.stringify(subjectData, null, 2)
      );
    } catch (detailsError: any) {
      console.error(
        `Error fetching subject details after nonce validation: ${detailsError.message}`
      );
      fetchDetailsError = `Failed to retrieve subject details from Clio after validation: ${detailsError.message}`;
      // Decide if we should stop here or try to proceed with minimal info if possible
      // For now, let's stop if we can't get details.
      return res.status(500).json({ error: fetchDetailsError });
    }

    // Ensure we got subject data from the second fetch
    if (!subjectData) {
      // Use the specific error if fetch failed, otherwise a generic one
      return res.status(500).json({
        error:
          fetchDetailsError ||
          "Failed to retrieve subject data object after validation.",
      });
    }

    // --- Determine Subject Type, Matter ID, and Extract Details (using fetched subjectData) ---
    let subjectType: "matter" | "document" | undefined = undefined;
    let subjectDescription: string | undefined;
    let matterIdToStore: number | null = null;
    let contactName: string | undefined;
    let primaryEmail: string | undefined;

    if (subjectUrlRelative.includes("/matters/")) {
      subjectType = "matter";
      subjectDescription =
        subjectData.description || subjectData.display_number;
      contactName = subjectData.client?.name;
      primaryEmail = subjectData.client?.email_addresses?.find(
        (e) => e.primary
      )?.email;
      // Subject IS the matter
      if (typeof subjectData.id === "number") {
        matterIdToStore = subjectData.id;
      } else if (typeof subjectData.id === "string") {
        const matterIdNum = parseInt(subjectData.id, 10);
        if (!isNaN(matterIdNum)) {
          matterIdToStore = matterIdNum;
        } else {
          console.error(
            `Subject Matter ID is not a parseable number: ${subjectData.id}`
          );
        }
      } else {
        console.error(
          `Unexpected type for subject Matter ID: ${typeof subjectData.id}`
        );
      }
      if (matterIdToStore)
        console.log(`Subject is Matter, using ID: ${matterIdToStore}`);
    } else if (subjectUrlRelative.includes("/documents/")) {
      subjectType = "document";
      subjectDescription = subjectData.name;
      const documentId = subjectData.id; // Get validated document ID

      console.log(
        `[Document Subject] Full subjectData: ${JSON.stringify(subjectData, null, 2)}`
      ); // Added log
      const parentInfo = subjectData.parent;
      console.log(
        `[Document Subject] Inspecting subjectData.parent: ${JSON.stringify(parentInfo)}`
      ); // Modified log

      // Prioritize nested matter ID if parent is a Folder and has it
      if (parentInfo?.type === "Folder" && parentInfo.matter?.id) {
        console.log(
          `[Document Subject] Found nested Matter ID via Folder parent: ${parentInfo.matter.id}`
        );
        const matterIdNum = parseInt(String(parentInfo.matter.id), 10);
        if (!isNaN(matterIdNum)) {
          matterIdToStore = matterIdNum;
        } else {
          console.warn(
            `[Document Subject] Nested Matter ID is not a parseable number: ${parentInfo.matter.id}`
          );
        }
      } else if (parentInfo?.type === "Matter" && parentInfo.id) {
        console.log(
          `[Document Subject] Found Matter ID directly via Matter parent: ${parentInfo.id}`
        );
        const matterIdNum = parseInt(String(parentInfo.id), 10);
        if (!isNaN(matterIdNum)) {
          matterIdToStore = matterIdNum;
        } else {
          console.warn(
            `[Document Subject] Matter parent ID is not a parseable number: ${parentInfo.id}`
          );
        }
      } else {
        console.warn(
          `[Document Subject] Document ${documentId} is not directly linked to a Matter or a Folder with a nested Matter.`
        );
        // matterIdToStore remains null
      }

      console.log(
        `[Document Subject] Determined matterIdToStore: ${matterIdToStore}`
      ); // Added log
    }

    // --- Create Quote Request ---
    const quoteDetails = {
      internalUserId: internalUserId,
      clioSubjectId: subjectData.id,
      clioSubjectType: subjectType,
      clioMatterId: matterIdToStore, // Pass determined Matter ID (can be null)
      clioContactName: contactName, // May be undefined if subject was document
      clioContactEmail: primaryEmail, // May be undefined if subject was document
      subjectDescription: subjectDescription,
    };

    // Log if we couldn't find a matter ID where expected
    if (!matterIdToStore) {
      console.warn(
        `Proceeding to create quote request without a determined Clio Matter ID for subject ${subjectData.id} (Type: ${subjectType})`
      );
    }

    // *** Add detailed log before inserting ***
    console.log("Final details being sent to createOpenEvalQuoteRequest:", {
      internalUserId: quoteDetails.internalUserId,
      clioSubjectId: quoteDetails.clioSubjectId,
      clioSubjectType: quoteDetails.clioSubjectType,
      clioMatterId: quoteDetails.clioMatterId, // Check this value specifically
      clioContactName: quoteDetails.clioContactName,
      clioContactEmail: quoteDetails.clioContactEmail,
      subjectDescription: quoteDetails.subjectDescription,
    });

    const quoteResult = await createOpenEvalQuoteRequest(
      quoteDetails,
      supabaseAdmin
    );

    if (quoteResult.success) {
      console.log(
        `Successfully initiated OpenEval quote request: ${quoteResult.quoteId}`
      );
      // Respond with success - maybe a simple HTML page?
      // For now, JSON response. Could redirect to a success page later.
      res.status(200).json({
        message: `Quote request created successfully (ID: ${quoteResult.quoteId}). You can close this tab.`,
      });
    } else {
      console.error(
        `Failed to create OpenEval quote request: ${quoteResult.error}`
      );
      res.status(500).json({
        error: quoteResult.error || "Failed to create internal quote request.",
      });
    }
  } catch (error) {
    console.error(
      "Unhandled error processing Clio Custom Action GET request:",
      error
    );
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    res
      .status(500)
      .json({ error: `Failed to process custom action: ${message}` });
  }
}
