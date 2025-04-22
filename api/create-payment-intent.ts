// api/intent.ts (Renamed from create-payment-intent.ts)
import Stripe from 'stripe';

// Initialize Stripe with your SECRET KEY.
// IMPORTANT: Store your secret key in Vercel Environment Variables, not directly in the code.
// Name the environment variable e.g., STRIPE_SECRET_KEY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2024-04-10', // Removed explicit version for now
  typescript: true, // Enable TypeScript support if needed elsewhere
});

// Define the expected request body structure (optional but good practice)
interface RequestBody {
    amount: number; // Amount should be in the smallest currency unit (e.g., cents)
    currency: string;
    // Add any other data you might need, like orderId, description, etc.
    // description?: string;
    // metadata?: { order_id: string };
}

import { VercelRequest, VercelResponse } from '@vercel/node'; // Import types

// Vercel Serverless Function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { amount, currency }: RequestBody = req.body;

    // Basic validation
    if (typeof amount !== 'number' || amount <= 0 || typeof currency !== 'string') {
        return res.status(400).json({ error: { message: 'Invalid amount or currency.' }});
    }

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

    // Send the client secret back to the frontend
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err: any) {
    console.error("Error creating PaymentIntent:", err);
    res.status(500).json({ error: { message: err.message || 'Internal Server Error' } });
  }
}
