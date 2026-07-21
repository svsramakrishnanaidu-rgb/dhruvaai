// Live analysis strip for the Analytics dashboard.
// Aggregates: real-time market pulse (via useLiveTicker across top crops),
// live weather for the selected district, and a rolling activity feed.

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Radio, TrendingUp, TrendingDown, CloudSun, Droplets, Wind, Thermometer } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CROP_LIST, type Crop } from "@/data/crops";
import { useLocation } from "@/lib/location-store";
import { profileFor } from "@/lib/district-profiles";
import { useLiveTicker } from "@/lib/live-market";
import { fetchLiveWeather, type LiveWeather } from "@/lib/live-weather";

const TOP = CROP_LIST.slice(0, 8);

export function LiveAnalysis() {
  const loc = useLocation();
  const p = profileFor(loc.district);
  const mod = 1 + p.priceModifier;

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <MarketPulse mod={mod} />
      <LiveWeatherCard district={loc.district} />
      <ActivityFeed mod={mod} className="lg:col-span-2" />
    </section>
  );
}

/* ---------------- Market Pulse ---------------- */
function MarketPulse({ mod }: { mod: number }) {
  // Track live prices for TOP crops; compute an aggregate index.
  const tickers = TOP.map((c) => useLiveTicker(c.marketPrice.price * mod));
  const total = tickers.reduce((s, t) => s + t.price, 0);
  const delta = tickers.reduce((s, t) => s + t.delta, 0);
  const up = delta >= 0;

  const [history, setHistory] = useState<{ t: number; v: number }[]>([]);
  useEffect(() => {
    setHistory((h) => {
      const next = [...h, { t: Date.now(), v: total }];
      return next.slice(-40);
    });
  }, [total]);

  return (
    <div className="card-elegant relative overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> Live · Market Pulse Index
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
          up ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
        }`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}{delta.toFixed(0)}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <div className="font-display text-4xl font-black tabular-nums md:text-5xl">
          ₹{Math.round(total).toLocaleString()}
        </div>
        <div className="mb-2 text-xs text-muted-foreground">index of {TOP.length} core crops · updated live</div>
      </div>

      <div className="mt-4 h-24">
        <ResponsiveContainer>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="pulseG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              labelFormatter={(v) => new Date(Number(v)).toLocaleTimeString()}
              formatter={(v: number) => [`₹${Math.round(v).toLocaleString()}`, "Index"]}
            />
            <Area type="monotone" dataKey="v" stroke="var(--primary)" fill="url(#pulseG)" strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {TOP.slice(0, 4).map((c, i) => (
          <MiniTick key={c.slug} crop={c} price={tickers[i].price} delta={tickers[i].delta} />
        ))}
      </div>
    </div>
  );
}

function MiniTick({ crop, price, delta }: { crop: Crop; price: number; delta: number }) {
  const up = delta >= 0;
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 px-3 py-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{crop.emoji}</span>
        <span className="truncate">{crop.name}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-1">
        <span className="font-display text-sm font-bold tabular-nums">₹{price.toLocaleString()}</span>
        <span className={`text-[10px] tabular-nums ${up ? "text-primary" : "text-destructive"}`}>
          {up ? "+" : ""}{delta.toFixed(0)}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Weather ---------------- */
function LiveWeatherCard({ district }: { district: string }) {
  const [w, setW] = useState<LiveWeather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLiveWeather(district).then((d) => {
      if (!cancelled) { setW(d); setLoading(false); }
    });
    const id = setInterval(() => {
      fetchLiveWeather(district).then((d) => !cancelled && d && setW(d));
    }, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [district]);

  return (
    <div className="card-elegant relative overflow-hidden p-6">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-primary">
        <Radio className="h-3.5 w-3.5 animate-pulse" /> Live · Weather · {district}
      </div>
      {loading || !w ? (
        <div className="mt-6 h-24 animate-pulse rounded-xl bg-muted/40" />
      ) : (
        <>
          <div className="mt-3 flex items-end gap-3">
            <div className="font-display text-5xl font-black tabular-nums">{Math.round(w.tempC)}°</div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CloudSun className="h-4 w-4" /> {w.sky}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <WMetric icon={<Droplets className="h-3.5 w-3.5" />} label="Humidity" value={`${w.humidity}%`} />
            <WMetric icon={<Wind className="h-3.5 w-3.5" />} label="Wind" value={`${Math.round(w.windKph)} kph`} />
            <WMetric icon={<Thermometer className="h-3.5 w-3.5" />} label="Rain" value={`${w.precipMm.toFixed(1)}mm`} />
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground">
            Updated {new Date(w.fetchedAt).toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}

function WMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 font-display text-sm font-bold tabular-nums">{value}</div>
    </div>
  );
}

/* ---------------- Activity Feed ---------------- */
type FeedItem = { id: number; crop: Crop; price: number; delta: number; at: number };

function ActivityFeed({ mod, className = "" }: { mod: number; className?: string }) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const c = CROP_LIST[Math.floor(Math.random() * CROP_LIST.length)];
      const base = c.marketPrice.price * mod;
      const delta = (Math.random() - 0.5) * base * 0.02;
      const price = Math.round(base + delta);
      idRef.current += 1;
      setFeed((f) => [{ id: idRef.current, crop: c, price, delta, at: Date.now() }, ...f].slice(0, 8));
    }, 2200);
    return () => clearInterval(id);
  }, [mod]);

  return (
    <div className={`card-elegant p-6 ${className}`}>
      <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-primary">
        <Activity className="h-3.5 w-3.5 animate-pulse" /> Live · Market Activity
      </div>
      {feed.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">Listening for ticks…</div>
      ) : (
        <ul className="divide-y divide-border/50">
          {feed.map((f) => {
            const up = f.delta >= 0;
            return (
              <li key={f.id} className="flex items-center justify-between py-2 text-sm animate-in fade-in slide-in-from-top-1">
                <span className="flex items-center gap-2">
                  <span className="text-lg">{f.crop.emoji}</span>
                  <span className="font-medium">{f.crop.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {new Date(f.at).toLocaleTimeString()}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-display tabular-nums">₹{f.price.toLocaleString()}</span>
                  <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                    up ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                  }`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}{f.delta.toFixed(0)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
