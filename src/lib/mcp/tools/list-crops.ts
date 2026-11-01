import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CROP_LIST, categoryOf } from "@/data/crops";

/** Lists the public crop catalogue with light filtering. */
export default defineTool({
  name: "list_crops",
  title: "List crops",
  description:
    "List crops in the DHRUVA catalogue with optional text, category, season or district filters. Returns slug, name, season, soil, water need, profit % and expected yield.",
  inputSchema: {
    query: z.string().optional().describe("Free-text match on crop or scientific name."),
    category: z.string().optional().describe("Category such as Cereal, Pulse, Millet, Oilseed, Cash, Spice, Vegetable, Fruit."),
    season: z.string().optional().describe("Season substring such as Kharif or Rabi."),
    district: z.string().optional().describe("District name to match against a crop's suitable districts."),
    trendingOnly: z.boolean().optional().describe("Only return crops flagged as trending."),
    limit: z.number().int().optional().describe("Max rows to return (default 40, max 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, category, season, district, trendingOnly, limit }) => {
    const q = query?.trim().toLowerCase();
    const cat = category?.trim().toLowerCase();
    const sea = season?.trim().toLowerCase();
    const dis = district?.trim().toLowerCase();
    const max = Math.min(Math.max(limit ?? 40, 1), 200);

    const rows = CROP_LIST.filter((c) => {
      if (q && !`${c.name} ${c.scientificName} ${c.slug}`.toLowerCase().includes(q)) return false;
      if (cat && categoryOf(c).toLowerCase() !== cat) return false;
      if (sea && !c.season.toLowerCase().includes(sea)) return false;
      if (dis && !c.suitableDistricts.some((d) => d.toLowerCase().includes(dis))) return false;
      if (trendingOnly && !c.trending) return false;
      return true;
    })
      .slice(0, max)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        scientificName: c.scientificName,
        category: categoryOf(c),
        season: c.season,
        soilType: c.soilType,
        waterNeed: c.waterNeed,
        profitPct: c.profitPct,
        yield: c.yield,
        trending: c.trending,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify({ count: rows.length, crops: rows }, null, 2) }],
      structuredContent: { count: rows.length, crops: rows },
    };
  },
});
