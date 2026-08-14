import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchAgmarknet, type AgmarknetRecord } from "./agmarknet.functions";

export interface DailyPoint { date: string; avg: number; count: number }
export interface MandiRow  { market: string; state: string; district: string; modal: number }

export interface LiveCommodity {
  commodity: string;
  modal: number;         // avg modal ₹/quintal for latest day
  previous: number;      // avg modal ₹/quintal for prior day (or same if only 1 day)
  min: number;
  max: number;
  avg: number;           // avg across all reported records (window)
  markets: number;       // # mandis reporting today
  arrivals: number;      // total record count (proxy for arrivals)
  topMarket: string;
  topPrice: number;
  delta: number;
  deltaPct: number;
  volatility: number;    // stddev of modal_price across records
  weekly: DailyPoint[];  // daily avg over the reported window
  mandis: MandiRow[];    // top mandis by modal_price
  status: "OPEN" | "CLOSED"; // based on latest arrival_date freshness
  demand: "High" | "Moderate" | "Low";
  supply: "High" | "Moderate" | "Low";
}

function parseDate(d: string): number {
  const [dd, mm, yy] = d.split("/").map(Number);
  return new Date(yy, (mm ?? 1) - 1, dd ?? 1).getTime();
}
function stddev(xs: number[]) {
  if (xs.length < 2) return 0;
  const m = xs.reduce((s, v) => s + v, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, v) => s + (v - m) ** 2, 0) / xs.length);
}
function bucket(pct: number, arrivals: number): { demand: LiveCommodity["demand"]; supply: LiveCommodity["supply"] } {
  const demand = pct > 2 ? "High" : pct < -2 ? "Low" : "Moderate";
  const supply = arrivals > 60 ? "High" : arrivals > 20 ? "Moderate" : "Low";
  return { demand, supply };
}

function summarize(records: AgmarknetRecord[]): LiveCommodity[] {
  const byCommodity = new Map<string, AgmarknetRecord[]>();
  for (const r of records) {
    if (!r.commodity || !r.modal_price) continue;
    const list = byCommodity.get(r.commodity) ?? [];
    list.push(r);
    byCommodity.set(r.commodity, list);
  }

  const now = Date.now();
  const out: LiveCommodity[] = [];

  for (const [commodity, list] of byCommodity) {
    const byDate = new Map<string, AgmarknetRecord[]>();
    for (const r of list) {
      const arr = byDate.get(r.arrival_date) ?? [];
      arr.push(r);
      byDate.set(r.arrival_date, arr);
    }
    const dates = [...byDate.keys()].sort((a, b) => parseDate(a) - parseDate(b));
    const avg = (xs: AgmarknetRecord[]) => xs.reduce((s, r) => s + r.modal_price, 0) / (xs.length || 1);

    const weekly: DailyPoint[] = dates.slice(-14).map((d) => {
      const bucketRecs = byDate.get(d)!;
      return { date: d, avg: Math.round(avg(bucketRecs)), count: bucketRecs.length };
    });

    const latestDate = dates[dates.length - 1];
    const prevDate = dates[dates.length - 2];
    const latest = byDate.get(latestDate) ?? [];
    const prev = prevDate ? byDate.get(prevDate) ?? [] : latest;
    const modal = avg(latest);
    const prevModal = avg(prev);
    const delta = modal - prevModal;
    const deltaPct = prevModal ? (delta / prevModal) * 100 : 0;

    const allModals = list.map((r) => r.modal_price);
    const overallAvg = allModals.reduce((s, v) => s + v, 0) / allModals.length;

    const topMandis: MandiRow[] = [...latest]
      .sort((a, b) => b.modal_price - a.modal_price)
      .slice(0, 5)
      .map((r) => ({ market: r.market, state: r.state, district: r.district, modal: r.modal_price }));

    const latestTs = parseDate(latestDate);
    const ageDays = (now - latestTs) / 86_400_000;
    const status: LiveCommodity["status"] = ageDays <= 2 ? "OPEN" : "CLOSED";

    const { demand, supply } = bucket(deltaPct, latest.length);

    out.push({
      commodity,
      modal: Math.round(modal),
      previous: Math.round(prevModal),
      min: Math.min(...latest.map((r) => r.min_price).filter(Boolean)),
      max: Math.max(...latest.map((r) => r.max_price)),
      avg: Math.round(overallAvg),
      markets: latest.length,
      arrivals: list.length,
      topMarket: topMandis[0]?.market ?? "",
      topPrice: topMandis[0]?.modal ?? 0,
      delta: Math.round(delta),
      deltaPct,
      volatility: Math.round(stddev(allModals)),
      weekly,
      mandis: topMandis,
      status,
      demand,
      supply,
    });
  }
  return out.sort((a, b) => b.arrivals - a.arrivals);
}

export interface UseAgmarknetOpts {
  state?: string;         // omit or "" for nationwide
  refreshMs?: number;
  limit?: number;
}

export function useAgmarknetLive(stateOrOpts?: string | UseAgmarknetOpts, legacyRefreshMs = 5 * 60 * 1000) {
  // Back-compat: allow useAgmarknetLive("Andhra Pradesh")
  const opts: UseAgmarknetOpts = typeof stateOrOpts === "string" || stateOrOpts === undefined
    ? { state: stateOrOpts as string | undefined, refreshMs: legacyRefreshMs }
    : stateOrOpts;
  const { state, refreshMs = 5 * 60 * 1000, limit = 3000 } = opts;

  const call = useServerFn(fetchAgmarknet);
  const [data, setData] = useState<LiveCommodity[]>([]);
  const [updated, setUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await call({ data: { state: state || undefined, limit } });
        if (!alive) return;
        if (!res.ok) {
          setError(res.error ?? "Failed to load");
          setLoading(false);
          return;
        }
        setData(summarize(res.records));
        setUpdated(res.updated);
        setError(null);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(id); };
  }, [state, refreshMs, limit, call]);

  const stats = useMemo(() => {
    if (!data.length) return { total: 0, gainers: 0, losers: 0, avgModal: 0, totalArrivals: 0 };
    const gainers = data.filter((d) => d.delta > 0).length;
    const losers = data.filter((d) => d.delta < 0).length;
    const avgModal = Math.round(data.reduce((s, d) => s + d.modal, 0) / data.length);
    const totalArrivals = data.reduce((s, d) => s + d.arrivals, 0);
    return { total: data.length, gainers, losers, avgModal, totalArrivals };
  }, [data]);

  return { data, updated, loading, error, stats, refresh: () => setTick?.(t => t + 1) || window.location.reload() };
}
