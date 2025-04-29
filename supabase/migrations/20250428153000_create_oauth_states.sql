-- Table to temporarily store OAuth state and associated user ID
create table public.oauth_states (
    state text primary key, -- The random state string
    user_id uuid not null references auth.users(id) on delete cascade, -- The user who initiated the flow
    provider text not null default 'clio', -- Could be used for multiple OAuth providers
    created_at timestamptz not null default now()
);

-- Add comments
comment on table public.oauth_states is 'Temporary storage for OAuth state parameters to link callbacks to users.';
comment on column public.oauth_states.state is 'Random string used for CSRF protection and user lookup.';
comment on column public.oauth_states.user_id is 'The user ID associated with this OAuth flow.';
comment on column public.oauth_states.provider is 'Identifier for the OAuth provider (e.g., clio).';

-- Index for faster lookup and cleanup
create index idx_oauth_states_created_at on public.oauth_states(created_at);

-- RLS is likely not strictly necessary if only service_role key accesses it,
-- but enabling it is good practice. Service role bypasses RLS by default.
alter table public.oauth_states enable row level security;

-- No policies needed if only accessed by service_role key.

-- Optional: Function/Cron job to periodically delete old states (e.g., > 1 hour old)
-- to prevent table bloat.
