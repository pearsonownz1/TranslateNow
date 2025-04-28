import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173'; // Fallback for local dev
const senderEmail = process.env.SENDER_EMAIL || 'OpenEval <noreply@openeval.com>'; // Replace with your verified sender and domain

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!process.env.RESEND_API_KEY) {
      console.error("Resend API key is not configured.");
      return res.status(500).json({ message: 'Email configuration error.' });
  }

  try {
    const { email, quoteId, price } = req.body;

    if (!email || !quoteId || price === undefined || typeof price !== 'number') {
      return res.status(400).json({ message: 'Missing or invalid required fields: email (string), quoteId (string), price (number)' });
    }

    console.log(`Sending quote ready email to ${email} for quote ${quoteId} with price ${price}`);

    // --- Implement actual email sending logic using Resend ---
    const { data, error } = await resend.emails.send({
      from: senderEmail, // Use configured sender email
      to: [email],
      subject: `Your Translation Quote #${quoteId.substring(0, 8)} is Ready!`, // Use partial ID for subject
      html: `
        <h1>Your Quote is Ready!</h1>
        <p>Hello,</p>
        <p>Your quote request (#${quoteId.substring(0, 8)}) has been processed.</p>
        <p>The price for your translation is: <strong>$${price.toFixed(2)}</strong></p>
        <p>Please log in to your dashboard to review and proceed with payment:</p>
        <a href="${appUrl}/dashboard/my-quotes">View Your Quote</a>
        <p>Thank you for choosing OpenEval!</p>
      `,
      // Optional: Add a plain text version
      // text: `Hello,\nYour quote request (#${quoteId.substring(0, 8)}) has been processed. The price is $${price.toFixed(2)}. View your quote here: ${appUrl}/dashboard/my-quotes\nThank you!`
    });

    if (error) {
      console.error('Resend Error:', error);
      // Don't expose detailed error messages to the client potentially
      return res.status(500).json({ message: 'Failed to send quote notification email.' });
    }

    console.log('Resend Success:', data);
    // --- End of email sending logic ---

    // Return success response
    return res.status(200).json({ message: 'Quote notification email sent successfully.' });

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
