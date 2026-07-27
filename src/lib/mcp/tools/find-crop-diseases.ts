import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CROP_LIST } from "@/data/crops";

/** Searches the per-crop disease libraries. */
export default defineTool({
  name: "find_crop_diseases",
  title: "Crop disease lookup",
  description:
    "Look up crop diseases by crop slug and/or symptom keywords. Returns symptoms, cause, severity, and organic and chemical control measures from that crop's own disease library.",
  inputSchema: {
    slug: z.string().optional().describe("Crop slug to restrict the search to one crop."),
    symptom: z.string().optional().describe("Keyword to match against disease name, symptoms or cause."),
    limit: z.number().int().optional().describe("Max rows (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug, symptom, limit }) => {
    const s = slug?.trim().toLowerCase();
    const kw = symptom?.trim().toLowerCase();
    const max = Math.min(Math.max(limit ?? 20, 1), 100);

    const rows: unknown[] = [];
    for (const crop of CROP_LIST) {
      if (s && crop.slug !== s) continue;
      for (const d of crop.diseases) {
        if (kw && !`${d.name} ${d.symptoms} ${d.cause}`.toLowerCase().includes(kw)) continue;
        rows.push({
          crop: crop.name,
          cropSlug: crop.slug,
          disease: d.name,
          symptoms: d.symptoms,
          cause: d.cause,
          severity: d.severity,
          organicControl: d.organic,
          chemicalControl: d.chemical,
        });
        if (rows.length >= max) break;
      }
      if (rows.length >= max) break;
    }

    const payload = { count: rows.length, diseases: rows };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
