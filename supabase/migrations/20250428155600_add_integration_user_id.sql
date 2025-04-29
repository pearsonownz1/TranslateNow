-- Add the integration_user_id column to store the user ID from the integrated service (e.g., Clio User ID)
ALTER TABLE public.user_integrations
ADD COLUMN integration_user_id TEXT;

-- Optional: Add an index if you plan to query frequently by this column
-- CREATE INDEX idx_user_integrations_integration_user_id ON public.user_integrations (integration_user_id);
