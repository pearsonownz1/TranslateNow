-- Add an updated_at column to track modifications to clio_quotes
ALTER TABLE public.clio_quotes
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Optional: Add a trigger to automatically update updated_at on row changes
-- This requires creating a function first.
-- CREATE OR REPLACE FUNCTION public.handle_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER on_clio_quotes_update
-- BEFORE UPDATE ON public.clio_quotes
-- FOR EACH ROW
-- EXECUTE PROCEDURE public.handle_updated_at();

-- Note: The trigger is commented out by default. Uncomment if you want automatic updates.
-- If you only update via the API like in upload-evaluation.ts, setting it manually is sufficient.
