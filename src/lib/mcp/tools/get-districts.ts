import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { AP_DISTRICTS, AP_DISTRICT_BY_SLUG } from "@/data/ap-districts";
import { CROPS } from "@/data/crops";

/** Andhra Pradesh district registry with locally cultivated crops. */
export default defineTool({
  name: "get_districts",
  title: "Districts and their crops",
  description:
    "List Andhra Pradesh districts (region, headquarters, soil, climate) or get one district by slug along with the crops cultivated there.",
  inputSchema: {
    slug: z.string().optional().describe("District slug for a single district. Omit to list all districts."),
    region: z.string().optional().describe("Filter list by region: Coastal, Rayalaseema or Uttarandhra."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug, region }) => {
    if (slug) {
      const d = AP_DISTRICT_BY_SLUG[slug.trim().toLowerCase()];
      if (!d) {
        return {
          content: [{ type: "text", text: `No district found for slug "${slug}".` }],
          isError: true,
        };
      }
      const payload = {
        ...d,
        crops: d.crops.map((s) => {
          const c = CROPS[s];
          return c ? { slug: c.slug, name: c.name, season: c.season, waterNeed: c.waterNeed } : { slug: s };
        }),
      };
      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: { district: payload },
      };
    }

    const reg = region?.trim().toLowerCase();
    const list = AP_DISTRICTS.filter((d) => !reg || d.region.toLowerCase() === reg).map((d) => ({
      slug: d.slug,
      name: d.name,
      region: d.region,
      headquarters: d.headquarters,
      soil: d.soil,
      climate: d.climate,
      cropCount: d.crops.length,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify({ count: list.length, districts: list }, null, 2) }],
      structuredContent: { count: list.length, districts: list },
    };
  },
});
