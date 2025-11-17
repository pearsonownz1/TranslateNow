-- Add client_name column to api_keys table
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS client_name TEXT DEFAULT 'standard';

-- Add comment to document the purpose
COMMENT ON COLUMN public.api_keys.client_name IS 'Client identifier for applying client-specific validation rules. Examples: standard, hireright';
