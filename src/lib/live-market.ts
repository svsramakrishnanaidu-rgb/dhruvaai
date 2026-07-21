// Live-style market data engine.
//
// Two layers:
//  1. A deterministic "history" generator (monthly/yearly) seeded from each
//     crop's baseline price — so charts look real and stable across renders.
//  2. A live intraday ticker that random-walks the current price every few
//     seconds via `useLiveTicker`. Applies the district `priceModifier`.
//
// If a real API is wired up later (e.g. data.gov.in Agmarknet), plug it in
// inside `fetchLivePrice()` — the UI already consumes this signal.

import { useEffect, useRef, useState } from "react";
import { CROP_LIST, type Crop } from "@/data/crops";

// ---------- deterministic PRNG ----------
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFromString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// ---------- history generators ----------
export type SeriesPoint = { label: string; price: number; volume?: number };

export function monthlyTrend(crop: Crop, mod = 1): SeriesPoint[] {
  const rnd = mulberry32(seedFromString(crop.slug + "m"));
  const base = crop.marketPrice.price * mod;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let p = base * 0.9;
  return months.map((m) => {
    p += (rnd() - 0.45) * base * 0.05;
    p = Math.max(base * 0.75, Math.min(base * 1.2, p));
    return { label: m, price: Math.round(p), volume: Math.round(500 + rnd() * 1800) };
  });
}

export function yearlyTrend(crop: Crop, mod = 1): SeriesPoint[] {
  const rnd = mulberry32(seedFromString(crop.slug + "y"));
  const base = crop.marketPrice.price * mod;
  const startYear = new Date().getFullYear() - 5;
  let p = base * 0.7;
  return Array.from({ length: 6 }, (_, i) => {
    p += (rnd() - 0.35) * base * 0.08;
    p = Math.max(base * 0.55, Math.min(base * 1.15, p));
    return { label: String(startYear + i), price: Math.round(p) };
  });
}

export function intradayTrend(crop: Crop, mod = 1): SeriesPoint[] {
  const rnd = mulberry32(seedFromString(crop.slug + "i" + new Date().toDateString()));
  const base = crop.marketPrice.price * mod;
  let p = base * (0.985 + rnd() * 0.01);
  const out: SeriesPoint[] = [];
  for (let h = 6; h <= 18; h++) {
    p += (rnd() - 0.5) * base * 0.006;
    out.push({ label: `${h}:00`, price: Math.round(p) });
  }
  return out;
}

export function mandiComparison(crop: Crop, district: string, mod = 1): { mandi: string; price: number; distanceKm: number }[] {
  const rnd = mulberry32(seedFromString(crop.slug + district + "mandi"));
  const base = crop.marketPrice.price * mod;
  const nearby = ["Local Yard", "APMC Main", "Regional Hub", "State Terminal", "Export Yard"];
  return nearby.map((m, i) => ({
    mandi: `${m} · ${district}`,
    price: Math.round(base * (0.95 + rnd() * 0.12)),
    distanceKm: Math.round((i * 8 + rnd() * 15) * 10) / 10,
  })).sort((a, b) => b.price - a.price);
}

export function highLow(series: SeriesPoint[]) {
  let hi = -Infinity, lo = Infinity;
  for (const s of series) { if (s.price > hi) hi = s.price; if (s.price < lo) lo = s.price; }
  return { high: hi, low: lo };
}

// ---------- live intraday ticker ----------
export function useLiveTicker(basePrice: number, opts: { intervalMs?: number; volatility?: number } = {}) {
  const { intervalMs = 4000, volatility = 0.004 } = opts;
  const [price, setPrice] = useState(basePrice);
  const [delta, setDelta] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());
  const baseRef = useRef(basePrice);

  useEffect(() => {
    baseRef.current = basePrice;
    setPrice(basePrice);
  }, [basePrice]);

  useEffect(() => {
    const id = setInterval(() => {
      setPrice((prev) => {
        const drift = (Math.random() - 0.5) * baseRef.current * volatility;
        // mean-reversion around base ±3%
        const target = baseRef.current;
        const pull = (target - prev) * 0.15;
        const next = Math.max(target * 0.94, Math.min(target * 1.06, prev + drift + pull));
        setDelta(next - prev);
        setUpdatedAt(Date.now());
        return Math.round(next);
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, volatility]);

  return { price, delta, updatedAt };
}

// ---------- top movers ----------
export function computeTopMovers(mod: number) {
  return CROP_LIST.map((c) => {
    const first = c.marketPrice.trend[0].price * mod;
    const last = c.marketPrice.trend[c.marketPrice.trend.length - 1].price * mod;
    const pct = ((last - first) / first) * 100;
    return { crop: c, pct, price: Math.round(c.marketPrice.price * mod) };
  }).sort((a, b) => b.pct - a.pct);
}
