import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const QuerySchema = z.object({
  query: z.string(),
  limit: z.number().optional().default(5),
});

const IngestSchema = z.object({
  content: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  embedding: z.array(z.number()).optional(),
});

export const queryKnowledgeBase = createServerFn({ method: "POST" })
  .validator((input: any) => QuerySchema.parse(input))
  .handler(async ({ data }: any) => {
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

export const ingestDocument = createServerFn({ method: "POST" })
  .validator((input: any) => IngestSchema.parse(input))
  .handler(async ({ data }: any) => {
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
