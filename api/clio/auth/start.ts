import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js'; // Use standard client
import crypto from 'crypto';
import { sign } from 'cookie-signature';
import cookie from 'cookie';

const LOG_VERSION = 'v_query_param_1'; // Add a version identifier

export default async function handler(req: VercelRequest, res: VercelResponse) {

    // --- Environment Variable Checks ---
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const cookieSecret = process.env.OAUTH_STATE_SECRET;
    const clioClientId = process.env.CLIO_CLIENT_ID;
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.openeval.com').replace('www.', '');
    const clioRedirectUri = `${siteUrl}/api/clio/auth/callback`;
    // Need Service Role Key for DB writes
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


    const missingVars = [
        !supabaseUrl && 'VITE_SUPABASE_URL',
        !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
        !cookieSecret && 'OAUTH_STATE_SECRET',
        !clioClientId && 'CLIO_CLIENT_ID',
        !supabaseServiceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY', // Added check
    ].filter(Boolean);

    if (missingVars.length > 0) {
        const errorMsg = `Internal Server Configuration Error. Missing env vars: ${missingVars.join(', ')}`;
        console.error(`Clio Auth Start Error [${LOG_VERSION}]: ${errorMsg}`);
        return res.status(500).json({ error: errorMsg });
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Initialize Supabase clients
        const supabase = createClient(supabaseUrl!, supabaseAnonKey!); // For auth check
        const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!); // For DB write

        // 1. Verify User Authentication (using access_token from query param)
        console.log(`Clio Auth Start [${LOG_VERSION}]: Attempting to get user from access_token query parameter...`);
        const token = req.query.access_token as string | undefined;

        if (!token) {
            console.warn(`Clio Auth Start [${LOG_VERSION}]: access_token query parameter missing.`);
            return res.redirect(302, '/login?message=Authentication token missing');
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            console.error(`Clio Auth Start [${LOG_VERSION}]: Auth error getting user from token:`, userError?.message || 'User object was null or token invalid.');
            return res.redirect(302, '/login?message=Invalid or expired session');
        }

        console.log(`Clio Auth Start [${LOG_VERSION}]: Successfully authenticated user ${user.id} from token.`);

        // 2. Generate State for CSRF protection AND database storage
        const state = crypto.randomBytes(16).toString('hex');

        // 3. Store state and user ID in the database (short-lived)
        const { error: stateError } = await supabaseAdmin
            .from('oauth_states')
            .insert({ state: state, user_id: user.id, provider: 'clio' });

        if (stateError) {
            console.error(`Clio Auth Start [${LOG_VERSION}]: Failed to store OAuth state for user ${user.id}:`, stateError);
            throw new Error('Failed to initiate authorization flow.'); // Throw internal error
        }
        console.log(`Clio Auth Start [${LOG_VERSION}]: Stored state ${state} for user ${user.id}.`);


        // 4. Sign and set the separate state cookie (for CSRF check on callback)
        const signedState = sign(state, cookieSecret!);
        const stateCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            path: '/',
            maxAge: 60 * 15, // 15 minutes validity
            sameSite: 'lax' as const,
        };
        res.setHeader('Set-Cookie', cookie.serialize('clio_oauth_state', signedState, stateCookieOptions));

        // 5. Construct Clio Authorization URL
        const paramsObj: Record<string, string> = {
            response_type: 'code',
            client_id: clioClientId!,
            redirect_uri: clioRedirectUri,
            state: state, // Send the raw state (used for lookup on callback)
        };
        const params = new URLSearchParams(paramsObj);
        const authorizationUrl = `https://app.clio.com/oauth/authorize?${params.toString()}`;

        // 6. Redirect user to Clio
        console.log(`Clio Auth Start [${LOG_VERSION}]: Redirecting user ${user.id} to Clio with redirect_uri: ${clioRedirectUri}`);
        res.setHeader('Location', authorizationUrl);
        return res.status(302).end();

    } catch (error) {
        console.error(`Clio Auth Start [${LOG_VERSION}]: Unhandled exception:`, error);
        const message = error instanceof Error ? error.message : "An unknown server error occurred.";
        return res.status(500).json({ error: `Internal Server Error: ${message}` });
    }
}
