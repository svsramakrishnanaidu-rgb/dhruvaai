import { z } from "zod";
import { AgmarknetResponseSchema } from "./agmarknet.schema";

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const ENDPOINT = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

export const AGMARKNET_SOURCE = "data.gov.in / Agmarknet (DMI, Ministry of Agriculture & Farmers Welfare)";

export interface AgmarknetRecord {
  state: string; district: string; market: string; commodity: string; variety: string;
  grade: string; arrival_date: string; min_price: number; max_price: number; modal_price: number;
  source: string; // Track origin of record
}


export type AgmarknetResponse = z.infer<typeof AgmarknetResponseSchema>;

export interface AgmarknetQuery {
  state?: string; district?: string; market?: string; commodity?: string;
  variety?: string; grade?: string; date?: string; limit?: number; offset?: number; pages?: number;
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
  const records: AgmarknetRecord[] = [];
  for (const r of raw) {
    try {
      const doc = {
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
        source: AGMARKNET_SOURCE,
      };
      if (doc.commodity && doc.market && doc.modal_price > 0 && doc.arrival_date) {
        records.push(doc as AgmarknetRecord);
      }
    } catch {
      continue;
    }
  }
  return records;
}


function buildParams(key: string, q: AgmarknetQuery, limit: number, offset: number) {
  const params = new URLSearchParams({ "api-key": key, format: "json", limit: String(limit), offset: String(offset) });
  if (q.state) params.set("filters[state.keyword]", q.state);
  if (q.district) params.set("filters[district]", q.district);
  if (q.market) params.set("filters[market]", q.market);
  if (q.commodity) params.set("filters[commodity]", q.commodity);
  if (q.variety) params.set("filters[variety]", q.variety);
  if (q.grade) params.set("filters[grade]", q.grade);
  if (q.date) params.set("filters[arrival_date]", q.date);
  return params;
}

const cache = new Map<string, { data: AgmarknetResponse; at: number }>();
const inflight = new Map<string, Promise<AgmarknetResponse>>();
const TTL = 5 * 60 * 1000;

async function fetchPage(key: string, q: AgmarknetQuery, limit: number, offset: number, retries = 3): Promise<{ total: number; records: AgmarknetRecord[] }> {
  const url = `${ENDPOINT}?${buildParams(key, q, limit, offset).toString()}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { 
        headers: { 
          accept: "application/json",
          // Add User-Agent to look like a browser if needed, 
          // though usually not required for data.gov.in
        },
        // Force a shorter timeout to trigger retries faster
        signal: AbortSignal.timeout(10000) 
      });
      
      if (res.status === 429) {
        // Exponential backoff for rate limiting
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      
      if (!res.ok) {
        console.error(`Agmarknet upstream error: ${res.status} ${res.statusText} at ${url}`);
        throw new Error(`Upstream ${res.status}`);
      }

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error("Agmarknet JSON parse failed. Response text:", text.slice(0, 200));
        throw new Error("Invalid JSON response from Agmarknet");
      }

      const records = normalize(json.records ?? []);
      return { total: json.total ?? records.length, records };
    } catch (err) {
      console.error(`Agmarknet attempt ${attempt + 1} failed:`, err);
      if (attempt === retries) {
        // If all retries failed, return empty instead of crashing the feed
        return { total: 0, records: [] };
      }
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return { total: 0, records: [] };
}

export async function agmarknetQuery(q: AgmarknetQuery): Promise<AgmarknetResponse> {
  const key = process.env["DATA_GOV_IN_API_KEY"];
  if (!key) return { ok: false, updated: new Date().toISOString(), source: AGMARKNET_SOURCE, total: 0, records: [], error: "Missing API Key" };
  
  const cacheKey = JSON.stringify({ q, type: "single" });
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < TTL) return cached.data;

  const existing = inflight.get(cacheKey);
  if (existing) return existing;

  const task = (async () => {
    try {
      const { total, records } = await fetchPage(key, q, q.limit ?? 500, q.offset ?? 0);
      const data = AgmarknetResponseSchema.parse({ ok: true, updated: new Date().toISOString(), source: AGMARKNET_SOURCE, total, records }) as AgmarknetResponse;
      cache.set(cacheKey, { data, at: Date.now() });
      return data;
    } catch (err) {
      return { ok: false, updated: new Date().toISOString(), source: AGMARKNET_SOURCE, total: 0, records: [], error: err instanceof Error ? err.message : String(err) };
    } finally {
      inflight.delete(cacheKey);
    }
  })();

  inflight.set(cacheKey, task);
  return task;
}

export async function agmarknetQueryPaged(q: AgmarknetQuery): Promise<AgmarknetResponse> {
  const key = process.env["DATA_GOV_IN_API_KEY"];
  if (!key) return { ok: false, updated: new Date().toISOString(), source: AGMARKNET_SOURCE, total: 0, records: [], error: "Missing API Key" };
  
  const cacheKey = JSON.stringify({ q, type: "paged" });
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < TTL) return cached.data;

  const existing = inflight.get(cacheKey);
  if (existing) return existing;

  const task = (async () => {
    const requested = Math.min(Math.max(q.limit ?? 2000, 100), 5000);
    const budget = Math.min(requested * Math.min(Math.max(q.pages ?? 4, 1), 12), 12_000);
    const all: AgmarknetRecord[] = [];
    
    try {
      const first = await fetchPage(key, q, requested, q.offset ?? 0);
      all.push(...first.records);
      const effective = first.records.length;
      if (effective > 0 && all.length < Math.min(budget, first.total)) {
        const target = Math.min(budget, first.total);
        const offsets = [];
        for (let o = (q.offset ?? 0) + effective; o < target && offsets.length < 96; o += effective) offsets.push(o);
        const batches = [];
        for (let i = 0; i < offsets.length; i += 4) batches.push(offsets.slice(i, i + 4));
        for (const batch of batches) {
          const pages = await Promise.all(batch.map((o) => fetchPage(key, q, requested, o, 1).catch(() => ({ total: 0, records: [] }))));
          for (const p of pages) all.push(...p.records);
          if (all.length >= target) break;
          await new Promise(r => setTimeout(r, 200));
        }
      }
      const data = AgmarknetResponseSchema.parse({ ok: true, updated: new Date().toISOString(), source: AGMARKNET_SOURCE, total: first.total || all.length, records: all }) as AgmarknetResponse;
      cache.set(cacheKey, { data, at: Date.now() });
      return data;
    } catch (err) {
      return { ok: false, updated: new Date().toISOString(), source: AGMARKNET_SOURCE, total: 0, records: [], error: err instanceof Error ? err.message : String(err) };
    } finally {
      inflight.delete(cacheKey);
    }
  })();

  inflight.set(cacheKey, task);
  return task;
}
