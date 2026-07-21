import { createServerFn } from "@tanstack/react-start";

// Official Government of India — data.gov.in
// "Current Daily Price of Various Commodities from Various Markets (Mandi)"
// Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
// Publisher: Directorate of Marketing & Inspection (DMI), Ministry of Agriculture — Agmarknet
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const ENDPOINT = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

export interface AgmarknetRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string; // DD/MM/YYYY
  min_price: number;    // ₹ / quintal
  max_price: number;
  modal_price: number;
}

export interface AgmarknetResponse {
  ok: boolean;
  updated: string;      // ISO
  source: string;
  total: number;
  records: AgmarknetRecord[];
  error?: string;
}

interface RawRecord {
  state?: string; State?: string;
  district?: string; District?: string;
  market?: string; Market?: string;
  commodity?: string; Commodity?: string;
  variety?: string; Variety?: string;
  grade?: string; Grade?: string;
  arrival_date?: string; Arrival_Date?: string;
  min_price?: string | number;
  max_price?: string | number;
  modal_price?: string | number;
}

function pick<T = string>(r: RawRecord, keys: string[], fallback: T): T {
  for (const k of keys) {
    const v = (r as Record<string, unknown>)[k];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return fallback;
}

function toNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export const fetchAgmarknet = createServerFn({ method: "GET" })
  .inputValidator((input: {
    state?: string;
    district?: string;
    market?: string;
    commodity?: string;
    variety?: string;
    date?: string;   // DD/MM/YYYY
    limit?: number;
    offset?: number;
  }) => input)
  .handler(async ({ data }): Promise<AgmarknetResponse> => {
    const key = process.env.DATA_GOV_IN_API_KEY;
    if (!key) {
      return {
        ok: false,
        updated: new Date().toISOString(),
        source: "data.gov.in / Agmarknet (DMI)",
        total: 0,
        records: [],
        error: "Missing DATA_GOV_IN_API_KEY. Add it in Project Settings → Secrets. Get a free key at https://data.gov.in → Register → My Account → APIs.",
      };
    }

    const params = new URLSearchParams({
      "api-key": key,
      format: "json",
      limit: String(data.limit ?? 500),
      offset: String(data.offset ?? 0),
    });
    if (data.state)     params.set("filters[state.keyword]", data.state);
    if (data.district)  params.set("filters[district]", data.district);
    if (data.market)    params.set("filters[market]", data.market);
    if (data.commodity) params.set("filters[commodity]", data.commodity);
    if (data.variety)   params.set("filters[variety]", data.variety);
    if (data.date)      params.set("filters[arrival_date]", data.date);

    try {
      const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) {
        const body = await res.text();
        return {
          ok: false,
          updated: new Date().toISOString(),
          source: "data.gov.in / Agmarknet (DMI)",
          total: 0,
          records: [],
          error: `Upstream ${res.status}: ${body.slice(0, 200)}`,
        };
      }
      const json = (await res.json()) as {
        total?: number;
        records?: RawRecord[];
      };
      const raw = json.records ?? [];
      const records: AgmarknetRecord[] = raw.map((r) => ({
        state:        pick(r, ["state", "State"], ""),
        district:     pick(r, ["district", "District"], ""),
        market:       pick(r, ["market", "Market"], ""),
        commodity:    pick(r, ["commodity", "Commodity"], ""),
        variety:      pick(r, ["variety", "Variety"], ""),
        grade:        pick(r, ["grade", "Grade"], ""),
        arrival_date: pick(r, ["arrival_date", "Arrival_Date"], ""),
        min_price:    toNum(r.min_price),
        max_price:    toNum(r.max_price),
        modal_price:  toNum(r.modal_price),
      })).filter((r) => r.commodity && r.market);

      return {
        ok: true,
        updated: new Date().toISOString(),
        source: "data.gov.in / Agmarknet (DMI, Ministry of Agriculture)",
        total: json.total ?? records.length,
        records,
      };
    } catch (err) {
      return {
        ok: false,
        updated: new Date().toISOString(),
        source: "data.gov.in / Agmarknet (DMI)",
        total: 0,
        records: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });
