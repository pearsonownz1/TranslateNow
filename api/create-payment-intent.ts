// api/intent.ts (Renamed from create-payment-intent.ts)
import Stripe from 'stripe';

// Initialize Stripe with your SECRET KEY.
// IMPORTANT: Store your secret key in Vercel Environment Variables, not directly in the code.
// Name the environment variable e.g., STRIPE_SECRET_KEY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', // Updated to match expected type
  typescript: true,
});

// Define the expected request body structure (optional but good practice)
interface RequestBody {
    amount: number; // Amount should be in the smallest currency unit (e.g., cents)
    currency: string;
    // Add any other data you might need, like orderId, description, etc.
    // description?: string;
    // metadata?: { order_id: string };
    // metadata?: { order_id: string };
}

import { VercelRequest, VercelResponse } from '@vercel/node'; // Re-import Vercel types

// Revert to Vercel Serverless Function handler signature
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // console.log("Function handler started."); // Remove log

  if (req.method !== 'POST') {
    // console.log("Method not POST, returning 405."); // Remove log
    // Revert to Vercel response methods
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // console.log("Attempting to read request body..."); // Remove log
    // Revert to using req.body (VercelRequest)
    const { amount, currency }: RequestBody = req.body;
    // console.log("Request body parsed:", { amount, currency }); // Remove log

    // Basic validation
    if (typeof amount !== 'number' || amount <= 0 || typeof currency !== 'string') {
        // console.log("Invalid amount or currency received."); // Remove log
        // Revert to Vercel response methods
        return res.status(400).json({ error: { message: 'Invalid amount or currency.' }});
    }

    // Log masked key for verification - Keep this one for now
    const keyPreview = process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 5)}...${process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 4)}` : 'Not Set';
    console.log(`Using Stripe Key: ${keyPreview}`);

    // console.log(`Attempting to create PaymentIntent for amount: ${amount} ${currency}`); // Remove log

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      // Add description or metadata if needed
      // description: 'Translation Service Order',
      // metadata: { order_id: 'your_order_id' } // Example metadata
    });

    // console.log("PaymentIntent created successfully:", paymentIntent.id); // Remove log

    // Revert to Vercel response methods
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err: any) {
    console.error("Error creating PaymentIntent:", err); // Keep error log
    // Revert to Vercel response methods
    res.status(500).json({ error: { message: err.message || 'Internal Server Error' } });
  }
}

// Add config export for Vercel if needed (optional, often inferred)
// export const config = {
//   runtime: 'edge', // or 'nodejs' - Vercel usually infers this
// };
