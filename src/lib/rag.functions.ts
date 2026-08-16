import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const queryKnowledgeBase = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { query: string; limit?: number } }) => {
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
  .handler(async ({ data }: { data: { content: string; metadata?: any; embedding?: number[] } }) => {
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
