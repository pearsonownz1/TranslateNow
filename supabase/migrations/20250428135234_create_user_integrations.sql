-- supabase/migrations/20250428135234_create_user_integrations.sql

-- Table to store connection details for third-party integrations (e.g., Clio)
create table public.user_integrations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade, -- Link to the user in Supabase Auth
    integration_name text not null, -- Name of the integration (e.g., 'clio')
    access_token text not null, -- Encrypted access token
    refresh_token text not null, -- Encrypted refresh token
    expires_at timestamptz null, -- Timestamp when the access token expires
    clio_user_identifier text null, -- Optional: Store a Clio-specific identifier if needed for webhooks
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Ensure a user can only connect one account per integration type
    constraint user_integrations_user_id_integration_name_key unique (user_id, integration_name)
);

-- Add comments to the table and columns
comment on table public.user_integrations is 'Stores encrypted credentials and metadata for third-party user integrations.';
comment on column public.user_integrations.user_id is 'References the user in auth.users.';
comment on column public.user_integrations.integration_name is 'Identifier for the third-party service (e.g., ''clio'').';
comment on column public.user_integrations.access_token is 'Encrypted OAuth access token.';
comment on column public.user_integrations.refresh_token is 'Encrypted OAuth refresh token.';
comment on column public.user_integrations.expires_at is 'Timestamp when the access token expires.';
comment on column public.user_integrations.clio_user_identifier is 'Optional Clio-specific identifier for webhook lookups.';

-- Enable Row Level Security (RLS)
alter table public.user_integrations enable row level security;

-- Grant basic permissions (adjust RLS policies as needed for security)
-- Policies should restrict access based on the authenticated user_id
-- Example (restrictive - only allows users to see their own integrations):
-- create policy "Allow users to manage their own integrations"
-- on public.user_integrations
-- for all
-- using (auth.uid() = user_id);

-- Note: For server-side operations (like token exchange or webhook handling) using the service_role key,
-- RLS policies are bypassed by default. Ensure your server-side logic correctly identifies the user
-- before performing operations.

-- Optional: Trigger function to automatically update `updated_at` timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_user_integrations_updated
  before update on public.user_integrations
  for each row execute procedure public.handle_updated_at();
