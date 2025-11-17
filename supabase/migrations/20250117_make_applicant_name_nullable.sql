-- Make applicant_name nullable in api_quote_requests table
ALTER TABLE public.api_quote_requests
ALTER COLUMN applicant_name DROP NOT NULL;
