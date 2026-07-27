import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CROPS, categoryOf } from "@/data/crops";

/** Returns the full isolated agronomy record for a single crop. */
export default defineTool({
  name: "get_crop",
  title: "Get crop guide",
  description:
    "Get the full agronomy guide for one crop by slug: climate, soil, land preparation, seed rate, irrigation, fertilizer schedule, diseases, pests, harvesting, market price, rotation, tips and references.",
  inputSchema: {
    slug: z.string().describe("Crop slug, e.g. 'rice', 'cotton', 'chilli'. Use list_crops to discover slugs."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const crop = CROPS[slug.trim().toLowerCase()];
    if (!crop) {
      return {
        content: [{ type: "text", text: `No crop found for slug "${slug}". Use list_crops to discover valid slugs.` }],
        isError: true,
      };
    }
    const payload = { ...crop, category: categoryOf(crop) };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: { crop: payload },
    };
  },
});
