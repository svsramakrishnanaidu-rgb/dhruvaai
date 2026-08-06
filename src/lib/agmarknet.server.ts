// Server-only Agmarknet (data.gov.in) access helpers.
// Official Government of India dataset:
// "Current Daily Price of Various Commodities from Various Markets (Mandi)"
// Publisher: Directorate of Marketing & Inspection (DMI), Ministry of Agriculture.

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const ENDPOINT = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

export const AGMARKNET_SOURCE =
  "data.gov.in / Agmarknet (DMI, Ministry of Agriculture & Farmers Welfare)";

export interface AgmarknetRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string; // DD/MM/YYYY
  min_price: number; // ₹ / quintal
  max_price: number;
  modal_price: number;
}

export interface AgmarknetResponse {
  ok: boolean;
  updated: string; // ISO
  source: string;
  total: number;
  records: AgmarknetRecord[];
  error?: string;
}

export interface AgmarknetQuery {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  date?: string; // DD/MM/YYYY
  limit?: number;
  offset?: number;
  /** Number of sequential pages to pull (paged fetch only). */
  pages?: number;
}

type RawRecord = Record<string, unknown>;

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

function normalize(raw: RawRecord[]): AgmarknetRecord[] {
  return raw
    .map((r) => ({
      state: pick(r, ["state", "State"]),
      district: pick(r, ["district", "District"]),
      market: pick(r, ["market", "Market"]),
      commodity: pick(r, ["commodity", "Commodity"]),
      variety: pick(r, ["variety", "Variety"]),
      grade: pick(r, ["grade", "Grade"]),
      arrival_date: pick(r, ["arrival_date", "Arrival_Date"]),
      min_price: toNum(r["min_price"]),
      max_price: toNum(r["max_price"]),
      modal_price: toNum(r["modal_price"]),
    }))
    .filter((r) => r.commodity && r.market && r.modal_price > 0);
}

function buildParams(key: string, q: AgmarknetQuery, limit: number, offset: number) {
  const params = new URLSearchParams({
    "api-key": key,
    format: "json",
    limit: String(limit),
    offset: String(offset),
  });
  if (q.state) params.set("filters[state.keyword]", q.state);
  if (q.district) params.set("filters[district]", q.district);
  if (q.market) params.set("filters[market]", q.market);
  if (q.commodity) params.set("filters[commodity]", q.commodity);
  if (q.variety) params.set("filters[variety]", q.variety);
  if (q.grade) params.set("filters[grade]", q.grade);
  if (q.date) params.set("filters[arrival_date]", q.date);
  return params;
}

function missingKey(): AgmarknetResponse {
  return {
    ok: false,
    updated: new Date().toISOString(),
    source: AGMARKNET_SOURCE,
    total: 0,
    records: [],
    error:
      "Missing DATA_GOV_IN_API_KEY. Add it in Project Settings → Secrets. Get a free key at https://data.gov.in → Register → My Account → APIs.",
  };
}

/** Fetch one page with a small retry-on-failure budget. */
async function fetchPage(
  key: string,
  q: AgmarknetQuery,
  limit: number,
  offset: number,
  retries = 3,
): Promise<{ total: number; records: AgmarknetRecord[] }> {
  const url = `${ENDPOINT}?${buildParams(key, q, limit, offset).toString()}`;
  let lastErr = "";
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (res.status === 429) {
        lastErr = "Upstream rate limit (429). Please update DATA_GOV_IN_API_KEY in secrets for higher limits.";
        // On 429, wait longer before retry
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) {
        lastErr = `Upstream ${res.status}`;
        if (res.status < 500) break; // Don't retry client errors except 429
      } else {
        const json = (await res.json()) as { total?: number; records?: RawRecord[] };
        const records = normalize(json.records ?? []);
        return { total: json.total ?? records.length, records };
      }
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  throw new Error(lastErr || "Agmarknet request failed");
}

/** Single-page query. */
export async function agmarknetQuery(q: AgmarknetQuery): Promise<AgmarknetResponse> {
  const key = process.env["DATA_GOV_IN_API_KEY"];
  if (!key) return missingKey();
  try {
    const { total, records } = await fetchPage(key, q, q.limit ?? 500, q.offset ?? 0);
    return { ok: true, updated: new Date().toISOString(), source: AGMARKNET_SOURCE, total, records };
  } catch (err) {
    return {
      ok: false,
      updated: new Date().toISOString(),
      source: AGMARKNET_SOURCE,
      total: 0,
      records: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Multi-page query with adaptive page size.
 *
 * data.gov.in caps how many rows a key may pull per request (the public
 * sample key caps at 10). We probe the first page, learn the effective page
 * size, then fan out the remaining offsets concurrently until we reach the
 * requested record budget — so nationwide crop coverage works on any key.
 */
export async function agmarknetQueryPaged(q: AgmarknetQuery): Promise<AgmarknetResponse> {
  const key = process.env["DATA_GOV_IN_API_KEY"];
  if (!key) return missingKey();

  const requested = Math.min(Math.max(q.limit ?? 2000, 100), 5000);
  const budget = Math.min(requested * Math.min(Math.max(q.pages ?? 4, 1), 12), 12_000);
  const all: AgmarknetRecord[] = [];
  let total = 0;
  let error: string | undefined;

  try {
    const first = await fetchPage(key, q, requested, q.offset ?? 0);
    total = first.total || first.records.length;
    all.push(...first.records);

    const effective = first.records.length;
    if (effective > 0 && all.length < Math.min(budget, total)) {
      const target = Math.min(budget, total);
      const offsets: number[] = [];
      const MAX_REQUESTS = 96; // keeps latency sane on low-quota keys
      for (let o = (q.offset ?? 0) + effective; o < target && offsets.length < MAX_REQUESTS; o += effective) offsets.push(o);

      const CONCURRENCY = 4; // Reduced from 8 to mitigate 429 errors
      for (let i = 0; i < offsets.length; i += CONCURRENCY) {
        const batch = offsets.slice(i, i + CONCURRENCY);
        const pages = await Promise.all(
          batch.map((o) => fetchPage(key, q, requested, o, 2).catch(() => ({ total, records: [] as AgmarknetRecord[] }))),
        );
        for (const p of pages) all.push(...p.records);
        if (all.length >= target) break;
        // Small delay between batches to further mitigate rate limiting
        await new Promise(r => setTimeout(r, 200));
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }


  if (!all.length) {
    return {
      ok: false,
      updated: new Date().toISOString(),
      source: AGMARKNET_SOURCE,
      total: 0,
      records: [],
      error: error ?? "No market records returned by Agmarknet right now.",
    };
  }

  return {
    ok: true,
    updated: new Date().toISOString(),
    source: AGMARKNET_SOURCE,
    total: total || all.length,
    records: all,
    ...(error ? { error: `Partial data: ${error}` } : {}),
  };
}
