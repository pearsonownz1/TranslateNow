import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Interface for the expected request body to this function
interface CallbackRequestBody {
  callbackUrl: string;
  webhookSecret: string;
  payload: {
    quote_request_id: string;
    applicant_name: string;
    status: string; // e.g., 'completed', 'rejected'
    us_equivalent?: string; // Required for 'completed' status
    rejection_reason?: string; // Required for 'rejected' status
    unable_to_provide?: boolean; // For rejection cases
  };
}

// Function to generate HMAC signature
const generateHmacSignature = (secret: string, body: string): string => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  return `sha256=${hmac.digest('hex')}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { callbackUrl, webhookSecret, payload } = req.body as CallbackRequestBody;

    // Validate input
    if (!callbackUrl || !webhookSecret || !payload) {
      return res.status(400).json({ error: 'Missing required fields: callbackUrl, webhookSecret, or payload' });
    }
    
    // Basic validation for all payloads
    if (!payload.quote_request_id || !payload.applicant_name || !payload.status) {
      return res.status(400).json({ error: 'Missing required fields in payload: quote_request_id, applicant_name, or status' });
    }
    
    // Conditional validation based on status
    if (payload.status === 'completed' && !payload.us_equivalent) {
      return res.status(400).json({ error: 'Missing us_equivalent field for completed status' });
    }
    
    if (payload.status === 'rejected' && !payload.rejection_reason) {
      return res.status(400).json({ error: 'Missing rejection_reason field for rejected status' });
    }

    const requestBody = JSON.stringify(payload);

    // Generate HMAC signature
    const signature = generateHmacSignature(webhookSecret, requestBody);

    console.log(`Sending callback to: ${callbackUrl}`);
    console.log(`Payload: ${requestBody}`);
    console.log(`Signature: ${signature}`);

    // Send the POST request to the partner's callback URL
    const callbackResponse = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature, // Custom header for the signature
      },
      body: requestBody,
    });

    // Check the response from the partner's server
    if (!callbackResponse.ok) {
      const errorBody = await callbackResponse.text();
      console.error(`Partner callback failed (${callbackResponse.status}): ${errorBody}`);
      // Even if partner fails, we succeeded in sending. Don't necessarily return 500 here.
      // The calling function should handle the DB update regardless.
      // We might return a specific status or message indicating the partner endpoint issue.
      return res.status(200).json({
          message: 'Callback sent, but partner endpoint responded with an error.',
          partner_status: callbackResponse.status,
          partner_response: errorBody
      });
    }

    const responseBody = await callbackResponse.text();
    console.log(`Partner callback successful (${callbackResponse.status}): ${responseBody}`);

    // Return success
    return res.status(200).json({ message: 'Callback sent successfully.' });

  } catch (error) {
    console.error('Error sending partner callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return res.status(500).json({ error: 'Internal Server Error while sending callback', details: errorMessage });
  }
}
