# Plan - Krish Sense RAG Knowledge Base Implementation

Implement a robust RAG (Retrieval-Augmented Generation) infrastructure for Krish Sense to provide accurate, context-aware agricultural advisory using the project's high-quality datasets.

## User Review Required

> [!IMPORTANT]
> To enable RAG, I will need to use a Vector Database. I will use Supabase Vector (pgvector) which is already available in your Lovable Cloud backend.

## Proposed Changes

### Database & Storage
- Enable `pgvector` extension in the Lovable Cloud database.
- Create a `kb_documents` table to store text chunks and their corresponding vector embeddings.
- Implement a search function using cosine similarity to retrieve relevant context.

### Data Ingestion (ETL)
- Create a server-side ingestion script that parses:
  - `src/data/crops/*.ts`: Full agronomy guides (soil, water, fertilizer, sowing).
  - `src/data/diseases/index.ts`: Identification and treatment protocols.
  - `src/data/crop-knowledge.ts`: Detailed weed and pest libraries.
  - `src/data/pdf-data.ts`: Official government production stats and yield KPIs.
- Chunk the data intelligently to maintain agricultural context (e.g., keeping a specific disease treatment together).
- Generate embeddings using OpenAI's `text-embedding-3-small` or Gemini's embedding model via the Lovable AI Gateway.

### API & AI Integration
- Create a new server function `queryKnowledgeBase` that:
  - Takes a user query.
  - Generates a search embedding.
  - Performs a vector search to find the most relevant agricultural context.
  - Passes the retrieved context to the LLM (Krish AI) to formulate a grounded response.
- Update the Krish AI interface to show "Sources" when it uses the RAG database.

## Technical Details

### Schema
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.kb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  embedding vector(1536) -- Optimized for OpenAI/Gemini embeddings
);

-- Grant access to authenticated users and service role
GRANT SELECT ON public.kb_documents TO authenticated;
GRANT ALL ON public.kb_documents TO service_role;
```

### Ingestion Logic
The ingestion will happen as a one-time migration or via a dedicated server route that reads the static TypeScript data files and upserts them into the vector database.
