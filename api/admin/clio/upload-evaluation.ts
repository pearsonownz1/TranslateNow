import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "../../_lib/encryption.js";
import { IncomingForm, File, Fields, Files } from "formidable"; // Use formidable for multipart/form-data
import fs from "fs"; // Needed to read the temporary file
import path from "path"; // Needed for file path operations

// --- Environment Variables ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clioApiBaseUrl = "https://app.clio.com";

// --- Basic Validation ---
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Supabase environment variables are missing for Clio evaluation upload."
  );
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
const parseForm = (
  req: VercelRequest
): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("Received request to upload Clio evaluation.");

  let tempFilePath: string | undefined;

  try {
    // --- Parse Form Data ---
    const { fields, files } = await parseForm(req);
    const clioQuoteIdValue = fields.clioQuoteId;
    const clioQuoteId = Array.isArray(clioQuoteIdValue)
      ? clioQuoteIdValue[0]
      : clioQuoteIdValue;
    const evaluationFileValue = files.evaluationFile;
    const evaluationFile = Array.isArray(evaluationFileValue)
      ? evaluationFileValue[0]
      : evaluationFileValue;

    if (!clioQuoteId || typeof clioQuoteId !== "string")
      return res
        .status(400)
        .json({ error: "Missing or invalid 'clioQuoteId' field." });
    if (!evaluationFile)
      return res.status(400).json({ error: "Missing 'evaluationFile' field." });

    tempFilePath = evaluationFile.filepath;
    const originalFilename =
      evaluationFile.originalFilename || "evaluation.pdf";
    const mimeType = evaluationFile.mimetype || "application/pdf";

    console.log(
      `Attempting evaluation upload for Clio Quote ID: ${clioQuoteId}, File: ${originalFilename}`
    );

    // --- Fetch Quote Details (including the stored clio_matter_id) ---
    const { data: quoteData, error: quoteError } = await supabaseAdmin
      .from("clio_quotes")
      .select("user_id, clio_matter_id") // Fetch user_id and the stored clio_matter_id
      .eq("id", clioQuoteId)
      .single();

    if (quoteError) throw quoteError;
    if (!quoteData)
      throw new Error(`Clio Quote with ID ${clioQuoteId} not found.`);

    const userId = quoteData.user_id;
    const matterIdForUpload = quoteData.clio_matter_id; // Use the stored Matter ID

    console.log(
      `Found quote details: UserID ${userId}, Stored Clio Matter ID: ${matterIdForUpload}`
    );

    // --- Ensure we have a Matter ID ---
    // This check now uses the ID stored during the custom action request
    if (!matterIdForUpload) {
      const errorMessage = `Cannot upload evaluation: No Clio Matter ID is associated with this quote request (ID: ${clioQuoteId}). The quote might have originated from a Clio Document not linked to a Matter.`;
      console.error(errorMessage);
      // Return 400 Bad Request as this is a data issue preventing the action
      return res.status(400).json({ error: errorMessage });
    }

    // --- Fetch User's Clio Credentials ---
    const { data: integrationData, error: integrationError } =
      await supabaseAdmin
        .from("user_integrations")
        .select("access_token")
        .eq("user_id", userId)
        .eq("integration_name", "clio")
        .single();

    if (integrationError) throw integrationError;
    if (!integrationData)
      throw new Error(`Clio integration not found for user ${userId}.`);

    // --- Decrypt Token ---
    let accessToken: string;
    try {
      accessToken = decrypt(integrationData.access_token);
    } catch (decryptionError) {
      console.error(
        `Failed to decrypt token for user ${userId}:`,
        decryptionError
      );
      return res
        .status(500)
        .json({ error: "Failed to process integration credentials." });
    }

    // --- Upload Document to Clio (Two-Step Process) ---

    // Step 1: Create Document Entry and Get Upload URL
    const createDocumentUrl = `${clioApiBaseUrl}/api/v4/documents?fields=id,latest_document_version{uuid,put_url,put_headers}`;
    console.log(
      `Step 1: Creating document entry in Clio via POST to ${createDocumentUrl}`
    );

    const documentMetadata = {
      data: {
        name: `Evaluation - ${originalFilename}`,
        parent: {
          id: matterIdForUpload,
          type: "Matter",
        },
      },
    };

    const createDocumentResponse = await fetch(createDocumentUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json", // Send metadata as JSON
      },
      body: JSON.stringify(documentMetadata),
    });

    if (!createDocumentResponse.ok) {
      let errorDetails = `Clio API Error (Step 1 - Create Document): ${createDocumentResponse.status} ${createDocumentResponse.statusText}`;
      try {
        const errorJson = await createDocumentResponse.json();
        console.error(
          "Clio API Error Response Body (Step 1):",
          JSON.stringify(errorJson, null, 2)
        );
        const specificMessage =
          errorJson?.error?.message ||
          errorJson?.message ||
          JSON.stringify(errorJson);
        errorDetails = `Clio API Error (Step 1 - ${createDocumentResponse.status}): ${specificMessage}`;
      } catch (e) {
        try {
          const errorText = await createDocumentResponse.text();
          console.error("Clio API Error Response Text (Step 1):", errorText);
          errorDetails += `\nResponse Text: ${errorText}`;
        } catch (_) {
          console.error(
            "Could not read Clio API error response body (Step 1)."
          );
        }
      }
      console.error(
        `Failed to create document entry in Clio. Details: ${errorDetails}`
      );
      throw new Error(
        `Failed to create document entry in Clio: ${errorDetails}`
      );
    }

    const createDocumentResult = await createDocumentResponse.json();
    const documentId = createDocumentResult?.data?.id;
    const putUrl = createDocumentResult?.data?.latest_document_version?.put_url;
    const putHeaders =
      createDocumentResult?.data?.latest_document_version?.put_headers;

    if (!documentId || !putUrl || !putHeaders) {
      console.error(
        "Missing document ID, put_url, or put_headers in Step 1 response:",
        createDocumentResult
      );
      throw new Error("Failed to get document upload details from Clio.");
    }

    console.log(
      `Step 1 successful. Created document ID: ${documentId}. Got put_url and put_headers.`
    );

    // Step 2: Upload File Content to the Signed URL
    console.log(
      `Step 2: Uploading file content to signed URL via PUT to ${putUrl}`
    );

    const fileBuffer = fs.readFileSync(tempFilePath);

    // Ensure all headers are strings
    const stringifiedHeaders: Record<string, string> = {};
    for (const key in putHeaders) {
      if (Object.prototype.hasOwnProperty.call(putHeaders, key)) {
        const value = putHeaders[key];
        stringifiedHeaders[key] = String(value); // Convert to string
      }
    }

    const uploadFileResponse = await fetch(putUrl, {
      method: "PUT",
      headers: stringifiedHeaders, // Use the stringified headers
      body: fileBuffer, // Send the raw file buffer as the body
    });

    if (!uploadFileResponse.ok) {
      let errorDetails = `Clio API Error (Step 2 - Upload File): ${uploadFileResponse.status} ${uploadFileResponse.statusText}`;
      // Note: Signed URL errors might not return JSON
      try {
        const errorText = await uploadFileResponse.text();
        console.error("Clio API Error Response Text (Step 2):", errorText);
        errorDetails += `\nResponse Text: ${errorText}`;
      } catch (_) {
        console.error("Could not read Clio API error response body (Step 2).");
      }

      console.error(
        `Failed to upload file content to signed URL. Details: ${errorDetails}`
      );
      throw new Error(`Failed to upload file content to Clio: ${errorDetails}`);
    }

    console.log(`Step 2 successful. File content uploaded to signed URL.`);

    // --- Update Quote Status in Supabase ---
    const { error: updateError } = await supabaseAdmin
      .from("clio_quotes")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", clioQuoteId);

    if (updateError)
      console.error(
        `Failed to update clio_quotes status for ID ${clioQuoteId}:`,
        updateError
      );
    else
      console.log(
        `Successfully updated status for clio_quotes ID ${clioQuoteId} to completed.`
      );

    // --- Respond to Client ---
    res.status(200).json({
      success: true,
      message: "Evaluation uploaded and sent to Clio successfully.",
    });
  } catch (error: any) {
    console.error("Error processing Clio evaluation upload request:", error);
    const message = error.message || "An unknown error occurred.";
    // Send specific error message back if it was the Matter ID issue
    if (message.startsWith("Cannot upload evaluation:")) {
      res.status(400).json({ success: false, error: message });
    } else {
      res.status(500).json({
        success: false,
        error: `Failed to upload evaluation: ${message}`,
      });
    }
  } finally {
    if (tempFilePath) {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Error deleting temporary upload file:", err);
      });
    }
  }
}
