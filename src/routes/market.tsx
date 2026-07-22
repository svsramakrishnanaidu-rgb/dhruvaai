import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp, TrendingDown, Minus, Search, Star, MapPin, Clock,
  Radio, Flame, RefreshCw, SlidersHorizontal, IndianRupee, Activity,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { useAgmarknetLive, type LiveCommodity } from "@/lib/agmarknet-live";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { HeroBanner } from "@/components/HeroBanner";
import heroImg from "@/assets/heroes/market.jpg";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Live Crop Market — Krish Sense" },
      { name: "description", content: "Real-time mandi prices for India and Andhra Pradesh with trending crop signals, live search and stack-style dashboard cards." },
      { property: "og:title", content: "Live Crop Market — Krish Sense" },
      { property: "og:description", content: "Real-time mandi prices, trending crops and district signals across India and Andhra Pradesh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketPage,
});

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

const FAV_KEY = "ks.market.favs";
type SortKey = "trending" | "priceHigh" | "priceLow" | "updated" | "gainers" | "losers";

function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw) as string[]));
    } catch { /* ignore */ }
  }, []);
  const toggle = (name: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      try { localStorage.setItem(FAV_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  };
  return { favs, toggle };
}

function trendTone(pct: number): { label: "up" | "down" | "flat"; cls: string; icon: typeof TrendingUp } {
  if (pct > 0.25) return { label: "up", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", icon: TrendingUp };
  if (pct < -0.25) return { label: "down", cls: "text-red-400 bg-red-500/10 border-red-500/25", icon: TrendingDown };
  return { label: "flat", cls: "text-muted-foreground bg-muted/40 border-border/60", icon: Minus };
}

function timeAgo(iso: string): string {
  if (!iso) return "—";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/* ------------------------------------------------------------------ */
/*  Stack Card                                                         */
/* ------------------------------------------------------------------ */

interface StackCardProps {
  c: LiveCommodity;
  updated: string;
  rank?: number;
  isFav: boolean;
  onFav: () => void;
}

function StackCard({ c, updated, rank, isFav, onFav }: StackCardProps) {
  const tone = trendTone(c.deltaPct);
  const TrendIcon = tone.icon;
  const gradientId = `spark-${c.commodity.replace(/[^a-z0-9]/gi, "")}`;
  const arrow = tone.label === "up" ? "▲" : tone.label === "down" ? "▼" : "➜";

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-elegant sm:p-5"
      style={{ animation: "fade-in 0.4s ease-out both" }}
    >
      {/* Corner accents */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
      {rank !== undefined && (
        <div className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-[10px] font-bold text-primary ring-1 ring-primary/40">
          {rank}
        </div>
      )}

      {/* Header */}
      <header className={`flex items-start justify-between gap-2 ${rank !== undefined ? "pl-8" : ""}`}>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-bold leading-tight sm:text-lg">{c.commodity}</h3>
          <div className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{c.topMarket || "—"}</span>
          </div>
        </div>
        <button
          onClick={onFav}
          aria-label={isFav ? "Remove favorite" : "Add favorite"}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary/60 hover:text-primary"
        >
          <Star className={`h-4 w-4 transition ${isFav ? "fill-primary text-primary" : ""}`} />
        </button>
      </header>

      {/* Price */}
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1 font-display text-2xl font-black tabular-nums sm:text-3xl">
            <IndianRupee className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <AnimatedNumber value={c.modal} />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">₹ / Quintal</div>
        </div>
        <div className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold tabular-nums ${tone.cls}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{arrow}</span>
          <span>{c.deltaPct >= 0 ? "+" : ""}{c.deltaPct.toFixed(2)}%</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-3 h-14 -mx-1">
        <ResponsiveContainer>
          <AreaChart data={c.weekly} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tone.label === "down" ? "#f87171" : "var(--primary)"} stopOpacity={0.55} />
                <stop offset="100%" stopColor={tone.label === "down" ? "#f87171" : "var(--primary)"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 }}
              formatter={(v: number) => [`₹${v}`, "Avg"]}
              labelFormatter={(l) => `Date: ${l}`}
            />
            <Area
              type="monotone"
              dataKey="avg"
              stroke={tone.label === "down" ? "#f87171" : "var(--primary)"}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer meta */}
      <footer className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${c.status === "OPEN" ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50"}`} />
          {c.status === "OPEN" ? "LIVE" : "CLOSED"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo(updated)}
        </span>
        <span className="tabular-nums">{c.markets} mandis</span>
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Board                                                              */
/* ------------------------------------------------------------------ */

interface BoardProps {
  title: string;
  subtitle: string;
  scope: "India" | "Andhra Pradesh";
  data: LiveCommodity[];
  updated: string;
  loading: boolean;
  error: string | null;
  favs: Set<string>;
  onFav: (name: string) => void;
}

function Board({ title, subtitle, scope, data, updated, loading, error, favs, onFav }: BoardProps) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("trending");
  const [favOnly, setFavOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = [...data];
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((d) => d.commodity.toLowerCase().includes(s) || d.topMarket.toLowerCase().includes(s));
    }
    if (favOnly) list = list.filter((d) => favs.has(d.commodity));
    switch (sort) {
      case "priceHigh": list.sort((a, b) => b.modal - a.modal); break;
      case "priceLow":  list.sort((a, b) => a.modal - b.modal); break;
      case "gainers":   list.sort((a, b) => b.deltaPct - a.deltaPct); break;
      case "losers":    list.sort((a, b) => a.deltaPct - b.deltaPct); break;
      case "updated":   list.sort((a, b) => b.arrivals - a.arrivals); break;
      case "trending":  list.sort((a, b) => (b.arrivals * Math.abs(b.deltaPct)) - (a.arrivals * Math.abs(a.deltaPct))); break;
    }
    return list;
  }, [data, q, sort, favOnly, favs]);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Radio className="h-3 w-3 animate-pulse" /> {scope} · Live
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-right text-[11px] text-muted-foreground">
          <div className="inline-flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Auto-refresh · 60s
          </div>
          {updated && <div>Last update {timeAgo(updated)}</div>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card/40 p-2 backdrop-blur-md">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search crop or mandi…"
            className="w-full rounded-xl border border-border/50 bg-background/70 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-background/70 px-2 py-1.5 text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-transparent text-xs font-medium outline-none"
          >
            <option value="trending">Trending</option>
            <option value="gainers">Top Gainers</option>
            <option value="losers">Top Losers</option>
            <option value="priceHigh">Price · High to Low</option>
            <option value="priceLow">Price · Low to High</option>
            <option value="updated">Most Active</option>
          </select>
        </div>
        <button
          onClick={() => setFavOnly((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
            favOnly ? "border-primary bg-primary text-primary-foreground" : "border-border/50 bg-background/70 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${favOnly ? "fill-current" : ""}`} /> Favorites
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading && !filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted/30" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted/40">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {favOnly ? "No favorites yet. Tap ⭐ on any card to pin it." : "No live prices match your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, 32).map((c) => (
            <StackCard
              key={`${scope}-${c.commodity}`}
              c={c}
              updated={updated}
              isFav={favs.has(c.commodity)}
              onFav={() => onFav(c.commodity)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trending Panel                                                     */
/* ------------------------------------------------------------------ */

function TrendingPanel({ india, ap, favs, onFav, updated }: {
  india: LiveCommodity[]; ap: LiveCommodity[];
  favs: Set<string>; onFav: (n: string) => void; updated: string;
}) {
  const combined = useMemo(() => {
    const map = new Map<string, LiveCommodity>();
    for (const c of [...ap, ...india]) {
      const key = c.commodity;
      const existing = map.get(key);
      if (!existing || c.arrivals > existing.arrivals) map.set(key, c);
    }
    return [...map.values()]
      .filter((c) => c.arrivals >= 3)
      .sort((a, b) => (b.arrivals * (1 + Math.abs(b.deltaPct) / 10)) - (a.arrivals * (1 + Math.abs(a.deltaPct) / 10)))
      .slice(0, 8);
  }, [india, ap]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Flame className="h-3 w-3" /> Trending Now
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Hottest Crops · India + AP</h2>
          <p className="text-sm text-muted-foreground">Ranked by combined market activity and price momentum.</p>
        </div>
      </div>

      {combined.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted/30" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {combined.map((c, i) => (
            <StackCard
              key={`trend-${c.commodity}`}
              c={c}
              updated={updated}
              rank={i + 1}
              isFav={favs.has(c.commodity)}
              onFav={() => onFav(c.commodity)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI Strip                                                          */
/* ------------------------------------------------------------------ */

function KpiStrip({
  indiaData, apData, updated, loading,
}: {
  indiaData: LiveCommodity[]; apData: LiveCommodity[]; updated: string; loading: boolean;
}) {
  const now = useNow(1000);
  const stats = useMemo(() => {
    const all = [...indiaData, ...apData];
    const gainers = all.filter((c) => c.deltaPct > 0).length;
    const losers = all.filter((c) => c.deltaPct < 0).length;
    const mandis = all.reduce((s, c) => s + c.markets, 0);
    return { total: all.length, gainers, losers, mandis };
  }, [indiaData, apData]);
  const age = updated ? Math.floor((now - new Date(updated).getTime()) / 1000) : 0;

  const cards = [
    { label: "Commodities Tracked", value: stats.total, icon: Activity, tone: "text-primary" },
    { label: "Gainers", value: stats.gainers, icon: TrendingUp, tone: "text-emerald-400" },
    { label: "Losers", value: stats.losers, icon: TrendingDown, tone: "text-red-400" },
    { label: "Reporting Mandis", value: stats.mandis, icon: MapPin, tone: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((k) => {
        const Icon = k.icon;
        return (
          <div key={k.label} className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</span>
              <Icon className={`h-4 w-4 ${k.tone}`} />
            </div>
            <div className="mt-1 font-display text-2xl font-black tabular-nums sm:text-3xl">
              {loading ? "…" : <AnimatedNumber value={k.value} />}
            </div>
          </div>
        );
      })}
      <div className="col-span-2 md:col-span-4">
        <div className="flex items-center justify-between rounded-full border border-border/60 bg-card/40 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Streaming from Agmarknet · Ministry of Agriculture (data.gov.in)
          </span>
          <span className="tabular-nums">Feed age: {age}s · Next tick in {Math.max(0, 60 - (age % 60))}s</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function MarketPage() {
  const india = useAgmarknetLive({ limit: 3000, refreshMs: 60_000 });
  const ap = useAgmarknetLive({ state: "Andhra Pradesh", limit: 2000, refreshMs: 60_000 });
  const { favs, toggle } = useFavorites();

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="Live Trading Dashboard"
        title="Crop Market"
        description="A real-time agricultural trading floor — live mandi prices across India and Andhra Pradesh with trending signals, stack-card intelligence and auto-refresh."
      />

      <div className="ks-container space-y-14 py-10 sm:py-14">
        <KpiStrip
          indiaData={india.data}
          apData={ap.data}
          updated={india.updated || ap.updated}
          loading={india.loading && ap.loading}
        />

        <TrendingPanel
          india={india.data}
          ap={ap.data}
          favs={favs}
          onFav={toggle}
          updated={india.updated || ap.updated}
        />

        <Board
          title="India Live Crops"
          subtitle="Latest mandi prices streaming from every reporting market across India."
          scope="India"
          data={india.data}
          updated={india.updated}
          loading={india.loading}
          error={india.error}
          favs={favs}
          onFav={toggle}
        />

        <Board
          title="Andhra Pradesh Live Crops"
          subtitle="District-wise AP mandi rates — paddy, chilli, cotton, turmeric, groundnut and more."
          scope="Andhra Pradesh"
          data={ap.data}
          updated={ap.updated}
          loading={ap.loading}
          error={ap.error}
          favs={favs}
          onFav={toggle}
        />
      </div>
    </div>
  );
}
