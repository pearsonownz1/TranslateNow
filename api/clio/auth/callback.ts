import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import cookie from "cookie";
import { unsign } from "cookie-signature";
import { encrypt } from "../../_lib/encryption.js"; // Add .js extension

// --- Environment Variables ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needed for DB operations
const cookieSecret = process.env.OAUTH_STATE_SECRET;
const clioClientId = process.env.CLIO_CLIENT_ID;
const clioClientSecret = process.env.CLIO_CLIENT_SECRET;
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.openeval.com"
).replace("www.", "");
const clioRedirectUri = `${siteUrl}/api/clio/auth/callback`; // Use the non-www base

// --- Basic Validation ---
if (
  !supabaseUrl ||
  !supabaseServiceRoleKey ||
  !cookieSecret ||
  !clioClientId ||
  !clioClientSecret
) {
  console.error(
    "One or more required environment variables are missing for Clio callback."
  );
}

// Initialize Supabase Admin client
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!);

// --- Helper Functions ---

/**
 * Fetches the Clio User ID using the access token.
 */
async function getClioUserId(accessToken: string): Promise<string | null> {
  const url = "https://app.clio.com/api/v4/users/who_am_i?fields=id";
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Clio API Error fetching user ID: ${response.status} - ${errorData?.error?.message || response.statusText}`
      );
      return null;
    }
    const data = await response.json();
    return data?.data?.id?.toString() || null; // Ensure it's a string or null
  } catch (error) {
    console.error("Network error fetching Clio user ID:", error);
    return null;
  }
}

/**
 * Creates the Custom Action in Clio for the user.
 * (Optional but recommended)
 */
async function createClioCustomAction(
  accessToken: string,
  targetUrl: string
): Promise<boolean> {
  const url = "https://app.clio.com/api/v4/custom_actions";
  const payload = {
    data: {
      label: "Request Evaluation (OpenEval)", // User-facing label
      target_url: targetUrl, // The URL of your Vercel endpoint
      // Choose where it appears. Add more as needed.
      // Using 'documents/show' makes sense if triggered from a document.
      // Using 'matters/show' makes sense if triggered from a matter.
      // Let's start with documents.
      ui_reference: "documents/show",
      // Potentially add 'matters/show' if you want it in both places
      //   ui_references: ["documents/show", "matters/show"], // Use this if Clio API supports array
    },
  };

  // Check if Clio API expects single string or array for ui_reference
  // If single: payload.data.ui_reference = "documents/show";
  // If array: payload.data.ui_references = ["documents/show", "matters/show"];
  // Adjust based on Clio API docs if needed. Assuming single string for now.

  console.log("Attempting to create Clio Custom Action with payload:", payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 201) {
      // 201 Created
      console.log("Successfully created Clio Custom Action.");
      return true;
    } else if (response.status === 422) {
      // 422 Unprocessable Entity (often means it already exists with same target_url/ui_reference)
      console.warn(
        "Clio Custom Action might already exist (received 422). Assuming success."
      );
      // You might want to fetch existing actions first to avoid this, but for simplicity, we'll treat 422 as non-fatal.
      return true; // Treat as success for the flow
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Failed to create Clio Custom Action: ${response.status} - ${JSON.stringify(errorData)}`
      );
      return false;
    }
  } catch (error) {
    console.error("Network error creating Clio Custom Action:", error);
    return false;
  }
}

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { code, state: receivedState } = req.query;
  const cookies = cookie.parse(req.headers.cookie || "");
  const signedStateFromCookie = cookies.clio_oauth_state;

  // Clear State Cookie Immediately
  const clearCookie = cookie.serialize("clio_oauth_state", "", {
    /* ... options ... */ httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
  });
  res.setHeader("Set-Cookie", clearCookie);

  // Validate Input
  if (!code || typeof code !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid authorization code." });
  }
  if (!receivedState || typeof receivedState !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid state parameter." });
  }
  if (!signedStateFromCookie) {
    return res.redirect(
      302,
      `/dashboard/integrations?clio_status=error&clio_error=${encodeURIComponent("Session state cookie missing. Please try connecting again.")}`
    );
  }
  if (!cookieSecret) {
    return res
      .status(500)
      .json({ error: "Internal server configuration error (state secret)." });
  }

  // Verify State Cookie (CSRF Protection)
  const originalState = unsign(signedStateFromCookie, cookieSecret);
  if (!originalState) {
    return res.redirect(
      302,
      `/dashboard/integrations?clio_status=error&clio_error=${encodeURIComponent("Invalid session state cookie. Please try connecting again.")}`
    );
  }
  if (originalState !== receivedState) {
    return res.redirect(
      302,
      `/dashboard/integrations?clio_status=error&clio_error=${encodeURIComponent("State mismatch (potential CSRF). Please try connecting again.")}`
    );
  }

  // --- Retrieve User ID using State ---
  let userId: string | null = null;
  try {
    console.log(
      `Clio Callback: Validated state ${receivedState}. Looking up user ID...`
    );
    const { data: stateData, error: stateError } = await supabaseAdmin
      .from("oauth_states")
      .select("user_id")
      .eq("state", receivedState)
      .single(); // Expect one matching state

    if (stateError || !stateData?.user_id) {
      console.error(
        `Clio Callback: Failed to find user ID for state ${receivedState}:`,
        stateError
      );
      throw new Error(
        "Invalid or expired authorization state. Please try connecting again."
      );
    }

    userId = stateData.user_id;
    console.log(
      `Clio Callback: Found user ID ${userId} for state ${receivedState}.`
    );

    // Clean up the used state from the database
    const { error: deleteError } = await supabaseAdmin
      .from("oauth_states")
      .delete()
      .eq("state", receivedState);

    if (deleteError) {
      // Log the error but don't necessarily fail the whole flow
      console.warn(
        `Clio Callback: Failed to delete used OAuth state ${receivedState}:`,
        deleteError
      );
    }
  } catch (error) {
    console.error("Clio Callback: Error retrieving user ID from state:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to validate authorization state.";
    const redirectUrl = `/dashboard/integrations?clio_status=error&clio_error=${encodeURIComponent(message)}`;
    return res.redirect(302, redirectUrl);
  }

  // --- Exchange Code for Tokens ---
  try {
    // Ensure userId was found
    if (!userId) {
      throw new Error("User ID could not be determined from state."); // Should have been caught above, but belts and suspenders
    }

    const tokenUrl = "https://app.clio.com/oauth/token";
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clioClientId!,
      client_secret: clioClientSecret!,
      code: code,
      redirect_uri: clioRedirectUri, // Use the constructed non-www URI
    });

    const tokenResponse = await fetch(tokenUrl, {
      /* ... fetch options ... */ method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenParams,
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      /* ... error handling ... */
      console.error("Clio token exchange error:", tokenData);
      const errorDesc =
        tokenData.error_description ||
        tokenData.error ||
        `Clio API Error: ${tokenResponse.statusText}`;
      throw new Error(
        `Failed to exchange authorization code with Clio. ${errorDesc}`
      );
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    if (!access_token || !refresh_token || typeof expires_in !== "number") {
      /* ... error handling ... */
      console.error("Incomplete token data received from Clio:", tokenData);
      throw new Error("Incomplete token data received from Clio.");
    }

    // --- Get Clio User ID ---
    const clioUserId = await getClioUserId(access_token);
    if (!clioUserId) {
      // Log the error but proceed to store tokens; user might need to reconnect later if ID fetch failed.
      console.error(
        `Could not fetch Clio User ID for OpenEval user ${userId}. Tokens will be stored without it.`
      );
      // Optionally, redirect with a specific error indicating partial success?
      // For now, continue to store tokens but log the issue.
      // throw new Error("Failed to retrieve Clio User ID after token exchange."); // Or handle more gracefully
    } else {
      console.log(
        `Retrieved Clio User ID: ${clioUserId} for OpenEval user ${userId}`
      );
    }

    // --- Store Tokens and Clio User ID Securely ---
    console.log(`Storing Clio tokens & ID for OpenEval user: ${userId}`);
    const encryptedAccessToken = encrypt(access_token);
    const encryptedRefreshToken = encrypt(refresh_token);
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    const upsertPayload: any = {
      user_id: userId,
      integration_name: "clio",
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Only add integration_user_id if we successfully fetched it
    if (clioUserId) {
      upsertPayload.integration_user_id = clioUserId;
    }

    const { data: upsertData, error: dbError } = await supabaseAdmin
      .from("user_integrations")
      .upsert(upsertPayload, { onConflict: "user_id, integration_name" }) // Assumes unique constraint on (user_id, integration_name)
      .select()
      .single();

    if (dbError) {
      console.error(
        `Database error storing Clio integration details for OpenEval user ${userId}:`,
        dbError
      );
      // If we failed to store the Clio User ID previously, this error might be because the column doesn't exist yet.
      if (
        dbError.message.includes(
          'column "integration_user_id" of relation "user_integrations" does not exist'
        )
      ) {
        console.error(
          "REMINDER: The 'integration_user_id' column needs to be added to the 'user_integrations' table."
        );
        throw new Error(
          "Database schema update required. Integration partially connected."
        );
      }
      throw new Error("Failed to save integration details to database.");
    }

    console.log(
      `Successfully stored/updated Clio integration details for OpenEval user ${userId}.`
    );

    // --- Attempt to Create Custom Action (Optional) ---
    const customActionTargetUrl = `${siteUrl}/api/clio/custom-action/request-evaluation`; // URL of your handler
    const actionCreated = await createClioCustomAction(
      access_token,
      customActionTargetUrl
    );
    if (!actionCreated) {
      // Log warning, but don't fail the overall connection process
      console.warn(
        `Failed to automatically create Clio Custom Action for user ${userId}. It may need to be created manually or via a separate process.`
      );
      // You could potentially add a flag to the redirect URL here if needed: ?clio_action_status=failed
    }

    // --- Redirect User Back to App ---
    const redirectUrl = "/dashboard/integrations?clio_status=success"; // Add clio_action_status if needed
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error("Clio OAuth callback failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during Clio connection.";
    const redirectUrl = `/dashboard/integrations?clio_status=error&clio_error=${encodeURIComponent(message)}`;
    res.redirect(302, redirectUrl);
  }
}
