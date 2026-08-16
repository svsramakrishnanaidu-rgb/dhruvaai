-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create kb_documents table
CREATE TABLE public.kb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  embedding vector(1536) -- Optimized for OpenAI/Gemini embeddings (e.g., text-embedding-3-small)
);

-- 3. Grant privileges
GRANT SELECT ON public.kb_documents TO authenticated;
GRANT ALL ON public.kb_documents TO service_role;

-- 4. Enable RLS
ALTER TABLE public.kb_documents ENABLE ROW LEVEL SECURITY;

-- 5. Create policies
CREATE POLICY "Allow authenticated users to read documents"
  ON public.kb_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. Create similarity search function
CREATE OR REPLACE FUNCTION public.match_kb_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb_documents.id,
    kb_documents.content,
    kb_documents.metadata,
    1 - (kb_documents.embedding <=> query_embedding) AS similarity
  FROM kb_documents
  WHERE 1 - (kb_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
