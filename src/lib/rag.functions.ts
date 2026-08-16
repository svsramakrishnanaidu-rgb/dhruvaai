import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const QuerySchema = z.object({
  query: z.string(),
  limit: z.number().optional().default(5),
});

export const queryKnowledgeBase = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    return QuerySchema.parse(input);
  })
  .handler(async ({ data }) => {
    // Basic text search until embeddings are hooked up
    const { data: documents, error } = await supabase
      .from("kb_documents")
      .select("content, metadata")
      .ilike("content", `%${data.query}%`)
      .limit(data.limit);

    if (error) {
      console.error("Knowledge base query error:", error);
      return { documents: [], error: error.message };
    }

    return { documents: documents || [] };
  });

const IngestSchema = z.object({
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  embedding: z.array(z.number()).optional(),
});

export const ingestDocument = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    return IngestSchema.parse(input);
  })
  .handler(async ({ data }) => {
    // Embedding is stored as a vector string "[0.1, 0.2, ...]" for pgvector
    const embeddingString = data.embedding ? `[${data.embedding.join(",")}]` : null;

    // Use a multi-object insert to ensure we match the signature that accepts an array
    const { error } = await supabase
      .from("kb_documents")
      .insert([{
        content: data.content,
        metadata: data.metadata as any,
        embedding: embeddingString
      }]);

    if (error) throw new Error(error.message);
    return { success: true };
  });
