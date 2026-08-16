import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const QuerySchema = z.object({
  query: z.string(),
  limit: z.number().optional().default(5),
});

const IngestSchema = z.object({
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  embedding: z.array(z.number()).optional(),
});

/**
 * Searches the knowledge base using simple text matching.
 */
export const queryKnowledgeBase = createServerFn({ method: "POST" })
  .validator((input: unknown) => QuerySchema.parse(input))
  .handler(async (args) => {
    const data = args.data as z.infer<typeof QuerySchema>;
    const { data: documents, error } = await supabase
      .from("kb_documents")
      .select("content, metadata")
      .ilike("content", `%${data.query}%`)
      .limit(data.limit || 5);

    if (error) {
      console.error("Knowledge base query error:", error);
      return { documents: [], error: error.message };
    }

    return { documents: documents || [] };
  });

/**
 * Ingests a new document into the RAG store.
 */
export const ingestDocument = createServerFn({ method: "POST" })
  .validator((input: unknown) => IngestSchema.parse(input))
  .handler(async (args) => {
    const data = args.data as z.infer<typeof IngestSchema>;
    const embeddingString = data.embedding ? `[${data.embedding.join(",")}]` : null;

    const { error } = await supabase
      .from("kb_documents")
      .insert({
        content: data.content,
        metadata: data.metadata as any,
        embedding: embeddingString
      } as any);

    if (error) throw new Error(error.message);
    return { success: true };
  });
