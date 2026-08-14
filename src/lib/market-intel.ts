// Market intelligence engine.
//
// Consumes the live Agmarknet (data.gov.in) feed and derives everything the
// Market + Analysis dashboards need: per-commodity summaries, mandi tables,
// state/district comparisons, trends, volatility, demand/supply signals and
// simple forecasting. 100% derived from live government records — nothing
// mocked, nothing hardcoded.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchAgmarknetPaged } from "./agmarknet.functions";
import type { AgmarknetRecord } from "./agmarknet.server";

export type { AgmarknetRecord };

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

export function parseArrivalDate(d: string): number {
  const [dd, mm, yy] = d.split("/").map(Number);
  if (!dd || !mm || !yy) return 0;
  return new Date(yy, mm - 1, dd).getTime();
}

export function fmtINR(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : 0;
}

function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((v) => (v - m) ** 2)));
}

function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/* ------------------------------------------------------------------ */
/*  Fuzzy search                                                       */
/* ------------------------------------------------------------------ */

/** Lightweight subsequence + prefix fuzzy scorer. Higher is better, 0 = no match. */
export function fuzzyScore(needle: string, haystack: string): number {
  const n = needle.trim().toLowerCase();
  const h = haystack.toLowerCase();
  if (!n) return 1;
  if (h === n) return 1000;
  if (h.startsWith(n)) return 800 - h.length;
  const idx = h.indexOf(n);
  if (idx >= 0) return 600 - idx - h.length * 0.1;
  // subsequence
  let hi = 0;
  let hits = 0;
  let streak = 0;
  let best = 0;
  for (let i = 0; i < n.length; i++) {
    const found = h.indexOf(n[i], hi);
    if (found < 0) return 0;
    if (found === hi) streak++;
    else streak = 1;
    best = Math.max(best, streak);
    hi = found + 1;
    hits++;
  }
  return 200 + hits * 4 + best * 6 - h.length * 0.2;
}

/** Common farmer-facing aliases mapped to Agmarknet commodity naming. */
export const CROP_ALIASES: Record<string, string[]> = {
  "black gram": ["urad", "urd", "minumulu", "black gram (urd beans)(whole)"],
  "green gram": ["moong", "mung", "pesalu", "green gram (moong)(whole)"],
  "red gram": ["tur", "arhar", "toor", "kandulu", "arhar (tur/red gram)(whole)"],
  "bengal gram": ["chana", "gram", "senagalu", "bengal gram(gram)(whole)"],
  paddy: ["dhan", "rice paddy", "vari", "paddy(dhan)(common)"],
  rice: ["biyyam", "chawal"],
  wheat: ["gehu", "godhuma"],
  maize: ["corn", "makka", "mokkajonna"],
  cotton: ["kapas", "patti"],
  groundnut: ["peanut", "moongphali", "verusenaga"],
  soyabean: ["soybean", "soya"],
  "mustard": ["sarson", "rai", "raya"],
  jowar: ["sorghum", "jonna"],
  bajra: ["pearl millet", "sajja"],
  ragi: ["finger millet", "nachani"],
  onion: ["pyaz", "ullipaya"],
  tomato: ["tamatar", "tomato local"],
  potato: ["aloo", "bangaladumpa"],
  "dry chillies": ["chilli", "mirchi", "mirapakaya", "red chilli"],
  turmeric: ["haldi", "pasupu"],
  coriander: ["dhaniya", "kothimeera"],
  cummin: ["cumin", "jeera"],
  banana: ["kela", "arati"],
  mango: ["aam", "mamidi"],
  grapes: ["angoor", "draksha"],
  apple: ["seb"],
  coconut: ["nariyal", "kobbari"],
  arecanut: ["supari", "betelnut"],
  cashewnuts: ["cashew", "kaju"],
  coffee: ["kaapi"],
  tea: ["chai"],
  rubber: [],
  sugarcane: ["ganna", "cheruku"],
  sunflower: ["surajmukhi", "poddu tirugudu"],
  sesamum: ["sesame", "til", "nuvvulu"],
};

function aliasHits(query: string, commodity: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const c = commodity.toLowerCase();
  for (const [canonical, alts] of Object.entries(CROP_ALIASES)) {
    const group = [canonical, ...alts];
    const queryInGroup = group.some((g) => g.includes(q) || q.includes(g));
    const commodityInGroup = group.some((g) => c.includes(g) || g.includes(c));
    if (queryInGroup && commodityInGroup) return 900;
  }
  return 0;
}

const CATEGORY_MAP: Record<string, MarketCategory> = {
  "black gram (urd beans)(whole)": "Pulses",
  "green gram (moong)(whole)": "Pulses",
  "arhar (tur/red gram)(whole)": "Pulses",
  "bengal gram(gram)(whole)": "Pulses",
  "paddy(dhan)(common)": "Cereals",
  "cotton": "Fibre",
  "sugarcane": "Commercial",
};

/* ------------------------------------------------------------------ */
/*  Category taxonomy                                                  */
/* ------------------------------------------------------------------ */

export type MarketCategory =
  | "Cereals" | "Pulses" | "Millets" | "Oilseeds" | "Fibre"
  | "Commercial" | "Plantation" | "Fruits" | "Vegetables"
  | "Spices" | "Flowers" | "Medicinal" | "Fodder" | "Other";

const CATEGORY_RULES: [MarketCategory, string[]][] = [
  ["Pulses", ["gram", "dal", "urd", "moong", "arhar", "tur", "lentil", "masur", "peas", "rajma", "cowpea", "lobia", "horse gram", "moth"]],
  ["Millets", ["jowar", "bajra", "ragi", "millet", "kodo", "foxtail", "barnyard"]],
  ["Cereals", ["paddy", "rice", "wheat", "maize", "barley", "oat"]],
  ["Oilseeds", ["groundnut", "mustard", "sesam", "soyabean", "soybean", "sunflower", "castor", "safflower", "niger", "linseed", "copra", "oil"]],
  ["Fibre", ["cotton", "jute", "kapas", "mesta", "sunhemp"]],
  ["Plantation", ["coconut", "arecanut", "cashew", "coffee", "tea", "rubber", "cocoa", "betel"]],
  ["Spices", ["chilli", "turmeric", "coriander", "cummin", "cumin", "pepper", "cardamom", "ginger", "garlic", "clove", "fenugreek", "methi", "ajwan", "tamarind", "nutmeg", "cinnamon", "mace"]],
  ["Fruits", ["mango", "banana", "grapes", "apple", "orange", "sweet lime", "mosambi", "papaya", "guava", "pomegranate", "pineapple", "watermelon", "musk melon", "sapota", "lemon", "litchi", "pear", "plum", "kinnow", "jack", "amla", "fig", "cherry", "apricot", "peach", "kiwi", "dates"]],
  ["Vegetables", ["tomato", "onion", "potato", "brinjal", "cabbage", "cauliflower", "carrot", "beans", "bhindi", "okra", "cucumber", "pumpkin", "gourd", "spinach", "leafy", "radish", "beetroot", "peas cod", "capsicum", "chow", "drumstick", "knool", "colacasia", "yam", "tapioca", "mushroom", "cluster", "ridgeguard", "bitter", "snakeguard", "ashgourd"]],
  ["Flowers", ["rose", "jasmine", "marigold", "chrysanthemum", "gladiolus", "tuberose", "flower", "lilly", "arum"]],
  ["Medicinal", ["ashwagandha", "isabgol", "aloe", "neem", "sarpagandha", "medicinal", "shatavari", "kalmegh"]],
  ["Fodder", ["fodder", "berseem", "lucerne", "hay", "straw", "husk", "bran", "cake"]],
  ["Commercial", ["sugarcane", "jaggery", "gur", "tobacco", "indigo"]],
];

export function categorizeCommodity(name: string): MarketCategory {
  const n = name.toLowerCase();
  if (CATEGORY_MAP[n]) return CATEGORY_MAP[n];
  for (const [cat, keys] of CATEGORY_RULES) {
    if (keys.some((k) => n.includes(k))) return cat;
  }
  return "Other";
}

export const MARKET_CATEGORIES: MarketCategory[] = [
  "Cereals", "Pulses", "Millets", "Oilseeds", "Fibre", "Commercial",
  "Plantation", "Fruits", "Vegetables", "Spices", "Flowers", "Medicinal", "Fodder", "Other",
];

/* ------------------------------------------------------------------ */
/*  Derived shapes                                                     */
/* ------------------------------------------------------------------ */

export interface DayPoint { date: string; ts: number; avg: number; min: number; max: number; count: number }
export interface MandiRow {
  market: string; district: string; state: string;
  variety: string; grade: string; arrivalDate: string;
  min: number; max: number; modal: number;
}
export interface RegionStat { name: string; modal: number; min: number; max: number; markets: number; records: number }

export interface CommoditySummary {
  commodity: string;
  category: MarketCategory;
  modal: number;      // avg modal on latest reported day
  min: number;        // lowest min on latest day
  max: number;        // highest max on latest day
  avgAll: number;     // avg modal across the whole window
  previous: number;   // avg modal on the previous reported day
  delta: number;
  deltaPct: number;
  weekPct: number;    // change vs ~7 days ago (or window start)
  monthPct: number;   // change vs window start (best available history)
  markets: number;    // mandis reporting latest day
  arrivals: number;   // total records today (arrival proxy)
  totalRecords: number; // total history count
  states: number;
  topMandi: MandiRow | null;
  cheapestMandi: MandiRow | null;
  volatility: number;      // stddev ₹
  volatilityPct: number;   // stddev as % of mean
  spread: number;          // max-min on latest day
  daily: DayPoint[];
  mandis: MandiRow[];      // latest-day mandi rows, sorted by modal desc
  byState: RegionStat[];
  byDistrict: RegionStat[];
  varieties: string[];
  grades: string[];
  lastArrival: string;     // DD/MM/YYYY
  fresh: boolean;          // arrival within 3 days
  demand: "High" | "Moderate" | "Low";
  supply: "High" | "Moderate" | "Low";
  forecast: number;        // next-session projection ₹
  forecastPct: number;
  signal: "BUY" | "HOLD" | "SELL";
  advice: string;
}


function regionStats(rows: AgmarknetRecord[], key: "state" | "district"): RegionStat[] {
  const map = new Map<string, AgmarknetRecord[]>();
  for (const r of rows) {
    const k = r[key] || "—";
    const arr = map.get(k) ?? [];
    arr.push(r);
    map.set(k, arr);
  }
  return [...map.entries()]
    .map(([name, rs]) => ({
      name,
      modal: Math.round(mean(rs.map((r) => r.modal_price))),
      min: Math.min(...rs.map((r) => r.min_price || r.modal_price)),
      max: Math.max(...rs.map((r) => r.max_price || r.modal_price)),
      markets: new Set(rs.map((r) => r.market)).size,
      records: rs.length,
    }))
    .sort((a, b) => b.modal - a.modal);
}

function toMandiRow(r: AgmarknetRecord): MandiRow {
  return {
    market: r.market, district: r.district, state: r.state,
    variety: r.variety || "—", grade: r.grade || "—", arrivalDate: r.arrival_date,
    min: r.min_price, max: r.max_price, modal: r.modal_price,
  };
}

export function summarizeCommodity(commodity: string, rows: AgmarknetRecord[]): CommoditySummary {
  const byDate = new Map<string, AgmarknetRecord[]>();
  for (const r of rows) {
    const arr = byDate.get(r.arrival_date) ?? [];
    arr.push(r);
    byDate.set(r.arrival_date, arr);
  }
  const dates = [...byDate.keys()].sort((a, b) => parseArrivalDate(a) - parseArrivalDate(b));

  const daily: DayPoint[] = dates.map((d) => {
    const rs = byDate.get(d)!;
    return {
      date: d,
      ts: parseArrivalDate(d),
      avg: Math.round(mean(rs.map((r) => r.modal_price))),
      min: Math.min(...rs.map((r) => r.min_price || r.modal_price)),
      max: Math.max(...rs.map((r) => r.max_price || r.modal_price)),
      count: rs.length,
    };
  });

  const latestDate = dates[dates.length - 1] ?? "";
  const latest = byDate.get(latestDate) ?? [];
  const prev = dates.length > 1 ? byDate.get(dates[dates.length - 2])! : latest;

  const modal = mean(latest.map((r) => r.modal_price));
  const previous = mean(prev.map((r) => r.modal_price));
  const delta = modal - previous;
  const deltaPct = previous ? (delta / previous) * 100 : 0;

  const weekBase = daily.length > 7 ? daily[daily.length - 8].avg : daily[0]?.avg ?? modal;
  const monthBase = daily[0]?.avg ?? modal;
  const weekPct = weekBase ? ((modal - weekBase) / weekBase) * 100 : 0;
  const monthPct = monthBase ? ((modal - monthBase) / monthBase) * 100 : 0;

  const allModals = rows.map((r) => r.modal_price);
  const vol = stddev(allModals);
  const avgAll = mean(allModals);

  const mandis = [...latest].sort((a, b) => b.modal_price - a.modal_price).map(toMandiRow);

  const arrivals = latest.length;
  const totalRecords = rows.length;
  const supply: CommoditySummary["supply"] = arrivals > 60 ? "High" : arrivals > 18 ? "Moderate" : "Low";

  const demand: CommoditySummary["demand"] = deltaPct > 2 ? "High" : deltaPct < -2 ? "Low" : "Moderate";

  // Forecast: momentum-damped projection toward the window median.
  const med = median(allModals);
  const momentum = deltaPct * 0.45 + weekPct * 0.15;
  const reversion = med ? ((med - modal) / modal) * 100 * 0.2 : 0;
  const forecastPct = Math.max(-12, Math.min(12, momentum + reversion));
  const forecast = Math.round(modal * (1 + forecastPct / 100));

  let signal: CommoditySummary["signal"] = "HOLD";
  if (forecastPct > 1.5 && supply !== "High") signal = "BUY";
  else if (forecastPct < -1.5 || (deltaPct > 6 && supply === "High")) signal = "SELL";

  const top = mandis[0] ?? null;
  const cheapest = mandis.length ? mandis[mandis.length - 1] : null;

  const advice =
    signal === "SELL"
      ? `Prices are projected to soften ~${Math.abs(forecastPct).toFixed(1)}%. Selling now at ${top ? top.market : "the top mandi"} locks the current ${fmtINR(modal)} level.`
      : signal === "BUY"
        ? `Momentum is positive (~+${forecastPct.toFixed(1)}% projected). Holding a few sessions and routing to ${top ? `${top.market}, ${top.district}` : "the strongest mandi"} may improve realisation.`
        : `Market is range-bound near ${fmtINR(modal)}. Sell in tranches; best current realisation is ${top ? `${fmtINR(top.modal)} at ${top.market}` : "at the top mandi"}.`;

  const ageDays = latestDate ? (Date.now() - parseArrivalDate(latestDate)) / 86_400_000 : 99;

  return {
    commodity,
    category: categorizeCommodity(commodity),
    modal: Math.round(modal),
    min: latest.length ? Math.min(...latest.map((r) => r.min_price || r.modal_price)) : 0,
    max: latest.length ? Math.max(...latest.map((r) => r.max_price || r.modal_price)) : 0,
    avgAll: Math.round(avgAll),
    previous: Math.round(previous),
    delta: Math.round(delta),
    deltaPct,
    weekPct,
    monthPct,
    markets: new Set(latest.map((r) => r.market)).size,
    arrivals,
    totalRecords,
    states: new Set(rows.map((r) => r.state)).size,

    topMandi: top,
    cheapestMandi: cheapest,
    volatility: Math.round(vol),
    volatilityPct: avgAll ? (vol / avgAll) * 100 : 0,
    spread: latest.length ? Math.max(...latest.map((r) => r.max_price)) - Math.min(...latest.map((r) => r.min_price || r.modal_price)) : 0,
    daily,
    mandis,
    byState: regionStats(rows, "state"),
    byDistrict: regionStats(rows, "district"),
    varieties: [...new Set(rows.map((r) => r.variety).filter(Boolean))].sort(),
    grades: [...new Set(rows.map((r) => r.grade).filter(Boolean))].sort(),
    lastArrival: latestDate,
    fresh: ageDays <= 3,
    demand,
    supply,
    forecast,
    forecastPct,
    signal,
    advice,
  };
}

export function summarizeAll(records: AgmarknetRecord[]): CommoditySummary[] {
  const byCommodity = new Map<string, AgmarknetRecord[]>();
  for (const r of records) {
    const arr = byCommodity.get(r.commodity) ?? [];
    arr.push(r);
    byCommodity.set(r.commodity, arr);
  }
  return [...byCommodity.entries()]
    .map(([name, rows]) => summarizeCommodity(name, rows))
    .sort((a, b) => b.arrivals - a.arrivals);
}

/** Rank commodity summaries against a search query (fuzzy + alias aware). */
export function searchSummaries(list: CommoditySummary[], query: string): CommoditySummary[] {
  const q = query.trim();
  if (!q) return list;
  return list
    .map((s) => ({ s, score: Math.max(fuzzyScore(q, s.commodity), aliasHits(q, s.commodity)) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.s.arrivals - a.s.arrivals)
    .map((x) => x.s);
}

/* ------------------------------------------------------------------ */
/*  Live feed hook                                                     */
/* ------------------------------------------------------------------ */

export interface FeedQuery {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  limit?: number;
  pages?: number;
  refreshMs?: number;
}

export interface MarketFeed {
  records: AgmarknetRecord[];
  summaries: CommoditySummary[];
  updated: string;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  source: string;
  refresh: () => void;
  facets: {
    states: string[];
    districts: string[];
    markets: string[];
    commodities: string[];
    varieties: string[];
    grades: string[];
    dates: string[];
  };
  totals: {
    records: number; commodities: number; mandis: number; states: number;
    gainers: number; losers: number; avgModal: number;
    highest: CommoditySummary | null; lowest: CommoditySummary | null;
  };
}

const memoryCache = new Map<string, { at: number; records: AgmarknetRecord[]; updated: string }>();
const CACHE_TTL = 60_000;

function getLocalCache(key: string) {
  try {
    const raw = localStorage.getItem(`market_feed_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.at > CACHE_TTL * 5) return null;
    return parsed;
  } catch { return null; }
}

function setLocalCache(key: string, data: any) {
  try {
    localStorage.setItem(`market_feed_${key}`, JSON.stringify({ ...data, at: Date.now() }));
  } catch {}
}

export function useMarketFeed(query: FeedQuery = {}): MarketFeed {
  const { state, district, market, commodity, limit = 2000, pages = 5, refreshMs = 120_000 } = query;
  const call = useServerFn(fetchAgmarknetPaged);

  const cacheKey = useMemo(() => JSON.stringify({ state, district, market, commodity, limit, pages }), [state, district, market, commodity, limit, pages]);
  const initial = useMemo(() => memoryCache.get(cacheKey) || (typeof window !== "undefined" ? getLocalCache(cacheKey) : null), [cacheKey]);

  const [records, setRecords] = useState<AgmarknetRecord[]>(initial?.records ?? []);
  const [updated, setUpdated] = useState(initial?.updated ?? "");
  const [loading, setLoading] = useState(!initial);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const abortController = useRef<AbortController | null>(null);
  const alive = useRef(true);

  useEffect(() => { alive.current = true; return () => { alive.current = false; abortController.current?.abort(); }; }, []);

  useEffect(() => {
    const hit = memoryCache.get(cacheKey) || (typeof window !== "undefined" ? getLocalCache(cacheKey) : null);

    if (hit && Date.now() - hit.at < CACHE_TTL && tick === 0) {
      setRecords(hit.records);
      setUpdated(hit.updated);
      setLoading(false);
      return;
    }

    const fetchData = async (isRefresh = false) => {
      if (abortController.current) abortController.current.abort();
      const controller = new AbortController();
      abortController.current = controller;

      if (isRefresh) setRefreshing(true); else if (!records.length) setLoading(true);
      setError(null);

      try {
        const res = await call({ data: { state, district, market, commodity, limit, pages } });
        if (controller.signal.aborted || !alive.current) return;
        if (res.ok) {
          setRecords(res.records as AgmarknetRecord[]);
          setUpdated(res.updated);
          const cacheEntry = { at: Date.now(), records: res.records as AgmarknetRecord[], updated: res.updated };
          memoryCache.set(cacheKey, cacheEntry);
          if (typeof window !== "undefined") setLocalCache(cacheKey, cacheEntry);
        } else {
          setError(res.error || "Failed to fetch market data");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (alive.current) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (alive.current && !controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchData(tick > 0);

    return () => { abortController.current?.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, tick]);

  useEffect(() => {
    if (!refreshMs) return;
    const id = setInterval(() => setTick((t) => t + 1), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);


  const summaries = useMemo(() => summarizeAll(records), [records]);

  const facets = useMemo(() => {
    const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort();
    return {
      states: uniq(records.map((r) => r.state)),
      districts: uniq(records.map((r) => r.district)),
      markets: uniq(records.map((r) => r.market)),
      commodities: uniq(records.map((r) => r.commodity)),
      varieties: uniq(records.map((r) => r.variety)),
      grades: uniq(records.map((r) => r.grade)),
      dates: [...new Set(records.map((r) => r.arrival_date))].sort((a, b) => parseArrivalDate(b) - parseArrivalDate(a)),
    };
  }, [records]);

  const totals = useMemo(() => {
    const gainers = summaries.filter((s) => s.deltaPct > 0.25).length;
    const losers = summaries.filter((s) => s.deltaPct < -0.25).length;
    const sorted = [...summaries].sort((a, b) => b.modal - a.modal);
    return {
      records: records.length,
      commodities: summaries.length,
      mandis: facets.markets.length,
      states: facets.states.length,
      gainers,
      losers,
      avgModal: Math.round(mean(summaries.map((s) => s.modal))),
      highest: sorted[0] ?? null,
      lowest: sorted[sorted.length - 1] ?? null,
    };
  }, [summaries, records.length, facets]);

  return { records, summaries, updated, loading, refreshing, error, source: "Agmarknet · data.gov.in", refresh, facets, totals };
}

/* ------------------------------------------------------------------ */
/*  Favorites + alerts                                                 */
/* ------------------------------------------------------------------ */

const FAV_KEY = "ks.market.favs.v2";
const ALERT_KEY = "ks.market.alerts.v1";

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try { const raw = localStorage.getItem(FAV_KEY); if (raw) setFavs(JSON.parse(raw) as string[]); } catch { /* ignore */ }
  }, []);
  const toggle = useCallback((name: string) => {
    setFavs((prev) => {
      const next = prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  return { favs, isFav: (n: string) => favs.includes(n), toggle };
}

export interface PriceAlert { commodity: string; direction: "above" | "below"; price: number }

export function useAlerts(summaries: CommoditySummary[]) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(ALERT_KEY); if (raw) setAlerts(JSON.parse(raw) as PriceAlert[]); } catch { /* ignore */ }
    if (typeof Notification !== "undefined") setEnabled(Notification.permission === "granted");
  }, []);

  const persist = (next: PriceAlert[]) => {
    setAlerts(next);
    try { localStorage.setItem(ALERT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const add = (a: PriceAlert) => persist([...alerts.filter((x) => x.commodity !== a.commodity), a]);
  const remove = (commodity: string) => persist(alerts.filter((x) => x.commodity !== commodity));

  const enable = async () => {
    if (typeof Notification === "undefined") return false;
    const res = await Notification.requestPermission();
    setEnabled(res === "granted");
    return res === "granted";
  };

  const fired = useRef<Set<string>>(new Set());
  const triggered = useMemo(() => {
    const hits: { alert: PriceAlert; price: number }[] = [];
    for (const a of alerts) {
      const s = summaries.find((x) => x.commodity === a.commodity);
      if (!s) continue;
      if ((a.direction === "above" && s.modal >= a.price) || (a.direction === "below" && s.modal <= a.price)) {
        hits.push({ alert: a, price: s.modal });
      }
    }
    return hits;
  }, [alerts, summaries]);

  useEffect(() => {
    if (!enabled || typeof Notification === "undefined") return;
    for (const h of triggered) {
      const key = `${h.alert.commodity}:${h.alert.direction}:${h.alert.price}:${h.price}`;
      if (fired.current.has(key)) continue;
      fired.current.add(key);
      try {
        new Notification(`${h.alert.commodity} ${h.alert.direction} ${fmtINR(h.alert.price)}`, {
          body: `Live modal price is now ${fmtINR(h.price)} / quintal.`,
        });
      } catch { /* ignore */ }
    }
  }, [triggered, enabled]);

  return { alerts, add, remove, enable, enabled, triggered };
}

/* ------------------------------------------------------------------ */
/*  Voice search                                                       */
/* ------------------------------------------------------------------ */

type SpeechRecognitionLike = {
  lang: string; continuous: boolean; interimResults: boolean;
  start: () => void; stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function useVoiceSearch(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const start = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) onResult(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    try { rec.start(); setListening(true); } catch { setListening(false); }
  }, [onResult]);

  const stop = useCallback(() => { try { recRef.current?.stop(); } catch { /* ignore */ } setListening(false); }, []);

  return { listening, supported, start, stop };
}
