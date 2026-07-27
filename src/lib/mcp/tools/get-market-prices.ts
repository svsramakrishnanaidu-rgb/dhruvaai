import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const ENDPOINT = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

type RawRecord = Record<string, string | number | undefined>;

function pick(r: RawRecord, keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return "";
}

function toNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Live mandi prices from the public Agmarknet dataset on data.gov.in. */
export default defineTool({
  name: "get_market_prices",
  title: "Live mandi prices",
  description:
    "Get live Indian mandi (market) prices per quintal from the public Agmarknet dataset on data.gov.in, filtered by state, district, market or commodity.",
  inputSchema: {
    state: z.string().optional().describe("State name, e.g. 'Andhra Pradesh'."),
    district: z.string().optional().describe("District name."),
    market: z.string().optional().describe("Mandi/market name."),
    commodity: z.string().optional().describe("Commodity name, e.g. 'Paddy(Dhan)(Common)', 'Cotton', 'Onion'."),
    limit: z.number().int().optional().describe("Max rows (default 50, max 300)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ state, district, market, commodity, limit }) => {
    const key = process.env.DATA_GOV_IN_API_KEY;
    if (!key) {
      return {
        content: [
          {
            type: "text",
            text: "Live mandi prices are unavailable: the DATA_GOV_IN_API_KEY secret is not configured for this app.",
          },
        ],
        isError: true,
      };
    }

    const params = new URLSearchParams({
      "api-key": key,
      format: "json",
      limit: String(Math.min(Math.max(limit ?? 50, 1), 300)),
      offset: "0",
    });
    if (state) params.set("filters[state.keyword]", state);
    if (district) params.set("filters[district]", district);
    if (market) params.set("filters[market]", market);
    if (commodity) params.set("filters[commodity]", commodity);

    const res = await fetch(`${ENDPOINT}?${params.toString()}`, { headers: { accept: "application/json" } });
    if (!res.ok) {
      const body = await res.text();
      return {
        content: [{ type: "text", text: `Agmarknet request failed [${res.status}]: ${body.slice(0, 200)}` }],
        isError: true,
      };
    }

    const json = (await res.json()) as { records?: RawRecord[]; total?: number };
    const records = (json.records ?? []).map((r) => ({
      state: pick(r, ["state", "State"]),
      district: pick(r, ["district", "District"]),
      market: pick(r, ["market", "Market"]),
      commodity: pick(r, ["commodity", "Commodity"]),
      variety: pick(r, ["variety", "Variety"]),
      arrivalDate: pick(r, ["arrival_date", "Arrival_Date"]),
      minPrice: toNum(r.min_price),
      maxPrice: toNum(r.max_price),
      modalPrice: toNum(r.modal_price),
      unit: "INR per quintal",
    }));

    const payload = {
      source: "data.gov.in / Agmarknet (Directorate of Marketing & Inspection)",
      updated: new Date().toISOString(),
      count: records.length,
      records,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
