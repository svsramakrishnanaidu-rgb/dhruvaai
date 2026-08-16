import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const queryKnowledgeBase = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    query: z.string(),
    limit: z.number().optional().default(5),
  }).parse(data))
  .handler(async ({ data }) => {
    // Basic text search until embeddings are hooked up in the next turn
    const { data: documents, error } = await supabase
      .from("kb_documents")
      .select("content, metadata")
      .ilike("content", `%${data.query}%`)
      .limit(data.limit);

    if (error) {
      console.error("Knowledge base query error:", error);
      return { documents: [], error: error.message };
    }

    return { documents };
  });

export const ingestDocument = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    content: z.string(),
    metadata: z.record(z.any()).optional(),
    embedding: z.array(z.number()).optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    // Embedding is stored as a vector string "[0.1, 0.2, ...]" for pgvector
    const embeddingString = data.embedding ? `[${data.embedding.join(",")}]` : null;

    const { error } = await supabase
      .from("kb_documents")
      .insert({
        content: data.content,
        metadata: data.metadata || {},
        embedding: embeddingString as any // The supabase-js client accepts the string for vector columns
      });

    if (error) throw new Error(error.message);
    return { success: true };
  });
