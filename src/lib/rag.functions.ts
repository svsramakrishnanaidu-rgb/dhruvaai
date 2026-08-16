import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Note: In a real production environment, you would call an embedding API here.
// For this implementation, we assume the content is being searched via text
// until a full embedding integration is hooked up.
// Or we use the match_kb_documents function if we have the embedding.

export const queryKnowledgeBase = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    query: z.string(),
    limit: z.number().optional().default(5),
  }).parse(data))
  .handler(async ({ data }) => {
    // 1. Generate embedding for the query (simulated or via AI Gateway)
    // For now, we'll search by text if embedding isn't provided, 
    // but the schema is ready for vector search.
    
    const { data: documents, error } = await supabase
      .from("kb_documents")
      .select("content, metadata")
      .textSearch("content", data.query)
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
    const { error } = await supabase
      .from("kb_documents")
      .insert([{
        content: data.content,
        metadata: data.metadata || {},
        embedding: data.embedding
      }]);

    if (error) throw new Error(error.message);
    return { success: true };
  });
