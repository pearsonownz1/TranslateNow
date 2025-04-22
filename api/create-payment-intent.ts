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
}

// Use standard Request and Response objects (suitable for Edge/Serverless)
export default async function handler(req: Request) {
  console.log("Function handler started."); // Log start

  if (req.method !== 'POST') {
    console.log("Method not POST, returning 405.");
    // Return standard Response object for 405
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }

  try {
    console.log("Attempting to read request body...");
    // Need to await req.json() for standard Request object
    const { amount, currency }: RequestBody = await req.json();
    console.log("Request body parsed:", { amount, currency });

    // Basic validation
    if (typeof amount !== 'number' || amount <= 0 || typeof currency !== 'string') {
        console.log("Invalid amount or currency received.");
        // Return standard Response object for 400
        return new Response(JSON.stringify({ error: { message: 'Invalid amount or currency.' }}), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Log masked key for verification
    const keyPreview = process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 5)}...${process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 4)}` : 'Not Set';
    console.log(`Using Stripe Key: ${keyPreview}`);

    console.log(`Attempting to create PaymentIntent for amount: ${amount} ${currency}`); // Add logging before Stripe call

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

    console.log("PaymentIntent created successfully:", paymentIntent.id); // Log success

    // Send the client secret back using standard Response
    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error("Error creating PaymentIntent:", err);
    // Return standard Response object for 500
    return new Response(JSON.stringify({ error: { message: err.message || 'Internal Server Error' } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Add config export for Vercel if needed (optional, often inferred)
// export const config = {
//   runtime: 'edge', // or 'nodejs' - Vercel usually infers this
// };
