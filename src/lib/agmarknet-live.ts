import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchAgmarknet, type AgmarknetRecord } from "./agmarknet.functions";

export interface LiveCommodity {
  commodity: string;
  modal: number;         // avg modal ₹/quintal today
  min: number;
  max: number;
  markets: number;       // # of mandis reporting
  topMarket: string;     // best-price mandi today
  topPrice: number;
  delta: number;         // ₹ vs previous arrival_date avg
  deltaPct: number;
}

function parseDate(d: string): number {
  // DD/MM/YYYY
  const [dd, mm, yy] = d.split("/").map(Number);
  return new Date(yy, (mm ?? 1) - 1, dd ?? 1).getTime();
}

function summarize(records: AgmarknetRecord[]): LiveCommodity[] {
  const byCommodity = new Map<string, AgmarknetRecord[]>();
  for (const r of records) {
    if (!r.commodity || !r.modal_price) continue;
    const list = byCommodity.get(r.commodity) ?? [];
    list.push(r);
    byCommodity.set(r.commodity, list);
  }
  const out: LiveCommodity[] = [];
  for (const [commodity, list] of byCommodity) {
    // group by date, take latest 2
    const byDate = new Map<string, AgmarknetRecord[]>();
    for (const r of list) {
      const arr = byDate.get(r.arrival_date) ?? [];
      arr.push(r);
      byDate.set(r.arrival_date, arr);
    }
    const dates = [...byDate.keys()].sort((a, b) => parseDate(b) - parseDate(a));
    const latest = byDate.get(dates[0]) ?? [];
    const prev = dates[1] ? byDate.get(dates[1]) ?? [] : [];
    const avg = (xs: AgmarknetRecord[]) =>
      xs.reduce((s, r) => s + r.modal_price, 0) / (xs.length || 1);
    const modal = avg(latest);
    const prevModal = prev.length ? avg(prev) : modal;
    const delta = modal - prevModal;
    const top = [...latest].sort((a, b) => b.modal_price - a.modal_price)[0];
    out.push({
      commodity,
      modal: Math.round(modal),
      min: Math.min(...latest.map((r) => r.min_price).filter(Boolean)),
      max: Math.max(...latest.map((r) => r.max_price)),
      markets: latest.length,
      topMarket: top?.market ?? "",
      topPrice: top?.modal_price ?? 0,
      delta: Math.round(delta),
      deltaPct: prevModal ? (delta / prevModal) * 100 : 0,
    });
  }
  return out.sort((a, b) => b.markets - a.markets);
}

export function useAgmarknetLive(state: string | undefined, refreshMs = 5 * 60 * 1000) {
  const call = useServerFn(fetchAgmarknet);
  const [data, setData] = useState<LiveCommodity[]>([]);
  const [updated, setUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await call({ data: { state, limit: 1000 } });
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
  }, [state, refreshMs, call]);

  return { data, updated, loading, error };
}
