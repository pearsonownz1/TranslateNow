import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Stripe (ensure STRIPE_SECRET_KEY is set in environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', // Use the version expected by the installed types
});

// Initialize Supabase client (ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set)
// Use the service role key for backend operations like updating user metadata
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // 1. Get User from Supabase Auth Token
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('Supabase user fetch error:', userError);
      return res.status(401).json({ error: 'Unauthorized: Invalid token or user not found' });
    }

    // 2. Find or Create Stripe Customer ID
    let stripeCustomerId = user.user_metadata?.stripe_customer_id;

    if (!stripeCustomerId) {
      console.log(`Creating Stripe customer for user ${user.id}`);
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
        // Add any other metadata you want to sync
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update Supabase user metadata with the new Stripe Customer ID
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, stripe_customer_id: stripeCustomerId } }
      );

      if (updateError) {
        console.error('Supabase metadata update error:', updateError);
        // Don't block setup intent creation, but log the error
      }
      console.log(`Stripe customer ${stripeCustomerId} created and linked to user ${user.id}`);
    } else {
      console.log(`Found existing Stripe customer ${stripeCustomerId} for user ${user.id}`);
    }

    // 3. Create Stripe SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      // Add metadata if needed
      metadata: {
         supabase_user_id: user.id,
      }
    });

    console.log(`SetupIntent ${setupIntent.id} created for customer ${stripeCustomerId}`);

    // 4. Return Client Secret
    res.status(200).json({ clientSecret: setupIntent.client_secret });

  } catch (error: any) {
    console.error('Error creating SetupIntent:', error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
}
