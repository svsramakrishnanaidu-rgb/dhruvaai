import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CROPS } from "@/data/crops";

/**
 * Scales a crop's per-acre fertilizer schedule to the user's land size.
 * Pure computation over the crop's own isolated fertilizer data.
 */
export default defineTool({
  name: "calculate_fertilizer",
  title: "Fertilizer calculator",
  description:
    "Calculate the fertilizer quantities needed for a crop over a given land size, using that crop's own per-acre schedule. Returns per-acre and total kilograms per product and stage.",
  inputSchema: {
    slug: z.string().describe("Crop slug, e.g. 'rice'. Use list_crops to discover slugs."),
    landSize: z.number().describe("Land size as a number."),
    unit: z.enum(["acre", "hectare"]).optional().describe("Unit for landSize (default acre)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug, landSize, unit }) => {
    const crop = CROPS[slug.trim().toLowerCase()];
    if (!crop) {
      return { content: [{ type: "text", text: `No crop found for slug "${slug}".` }], isError: true };
    }
    if (!(landSize > 0)) {
      return { content: [{ type: "text", text: "landSize must be greater than 0." }], isError: true };
    }
    const acres = (unit ?? "acre") === "hectare" ? landSize * 2.47105 : landSize;
    const items = crop.fertilizer.map((f) => ({
      name: f.name,
      stage: f.stage,
      perAcreKg: f.perAcreKg,
      totalKg: Number((f.perAcreKg * acres).toFixed(2)),
    }));
    const payload = {
      crop: crop.name,
      slug: crop.slug,
      landSize,
      unit: unit ?? "acre",
      acres: Number(acres.toFixed(3)),
      totalKg: Number(items.reduce((s, i) => s + i.totalKg, 0).toFixed(2)),
      items,
      note: "Indicative doses from the app's crop guide. Confirm with a local soil test and extension officer.",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
