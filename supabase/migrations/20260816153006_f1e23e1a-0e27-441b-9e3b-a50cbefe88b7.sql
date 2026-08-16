-- Create a dedicated schema for extensions to avoid linter warnings about extensions in public
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move vector extension to the extensions schema
-- Note: If it already exists in public, we should drop and recreate or alter it
-- However, match_kb_documents depends on it, so let's be careful.
-- Easiest for security is to set search_path on the function first.

ALTER FUNCTION public.match_kb_documents(vector(1536), float, int) SET search_path = public, extensions;

-- If vector was in public, this handles the linter warning 0014
-- We can't easily move extensions if they have dependent objects without dropping them.
-- Setting search_path is the most critical fix for 0011.
