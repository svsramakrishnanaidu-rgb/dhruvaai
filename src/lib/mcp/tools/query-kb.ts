import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { queryKnowledgeBase } from "../../rag.functions";

/** 
 * Performs a search across the Krish Sense Knowledge Base.
 * Designed to provide context for AI agents using consolidated agronomy and production data.
 */
export default defineTool({
  name: "query_knowledge_base",
  title: "Query Knowledge Base",
  description:
    "Searches the Krish Sense Knowledge Base for detailed agronomy, disease protocols, and regional production statistics. Use this for complex agricultural advisory queries.",
  inputSchema: {
    query: z.string().describe("Natural language query to search in the knowledge base."),
    limit: z.number().int().optional().describe("Number of relevant documents to return (default 5)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    try {
      // Execute the server function to query the database
      const { documents, error } = await queryKnowledgeBase({ data: { query, limit } });
      
      if (error) {
        return {
          content: [{ type: "text", text: `Error querying knowledge base: ${error}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ count: documents?.length || 0, documents }, null, 2) }],
        structuredContent: { count: documents?.length || 0, documents },
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Failed to query knowledge base: ${err.message}` }],
        isError: true,
      };
    }
  },
});
