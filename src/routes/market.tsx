import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CROP_LIST, type Crop } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useLocation } from "@/lib/location-store";
import { profileFor } from "@/lib/district-profiles";
import { HeroBanner } from "@/components/HeroBanner";
import { TrendingUp, TrendingDown, Activity, MapPin, Clock } from "lucide-react";
import heroImg from "@/assets/heroes/market.jpg";
import {
  useLiveTicker, monthlyTrend, yearlyTrend, intradayTrend,
  mandiComparison, highLow,
} from "@/lib/live-market";
import { LiveMarketBoard } from "@/components/LiveMarketBoard";
import { MarketInsightsPanel } from "@/components/MarketInsightsPanel";



export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Live Market Prices — Krish Sense" },
      { name: "description", content: "Live-updating mandi prices, intraday & yearly trends, mandi comparison, top movers and MSP for every crop." },
    ],
  }),
  component: Market,
});

const CHART_TOOLTIP = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
} as const;

function Market() {
  const loc = useLocation();
  const p = profileFor(loc.district);
  const mod = 1 + p.priceModifier;

  const [activeSlug, setActiveSlug] = useState<string>(CROP_LIST[0].slug);
  const active = CROP_LIST.find((c) => c.slug === activeSlug) ?? CROP_LIST[0];

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="Live Mandi · All India"
        title="Market Intelligence"
        description="Live prices, movers, volatility and AI-generated insights streaming from Agmarknet across every reporting mandi in India."
      />

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-14">
        {/* All-India live board (replaces state-locked ticker + selector) */}
        <LiveMarketBoard title="All-India Live Mandi Board" />

        {/* AI-generated market intelligence brief */}
        <MarketInsightsPanel />

        {/* Deep-dive analytics for selected crop */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold">Deep Analytics</h2>
              <p className="text-sm text-muted-foreground">
                Intraday, weekly, monthly and 5-year trends with mandi comparison — regional adjustment for {loc.district} applied.
              </p>
            </div>
            <select
              value={activeSlug}
              onChange={(e) => setActiveSlug(e.target.value)}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              {CROP_LIST.map((c) => (
                <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <DeepDive crop={active} mod={mod} district={loc.district} />
        </section>

        {/* All crops grid */}
        <section className="space-y-4">
          <h2 className="font-display text-3xl font-bold">All Crops · Live Simulation</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {CROP_LIST.map((c) => (
              <Reveal key={c.slug}>
                <CropLiveCard crop={c} mod={mod} onOpen={() => setActiveSlug(c.slug)} />
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


/* ---------------- Live ticker strip (marquee) ---------------- */
function LiveTickerStrip({ state }: { state: string }) {
  const { data, updated, loading, error } = useAgmarknetLive(state);
  const items = data.slice(0, 30);
  return (
    <div className="glass overflow-hidden rounded-2xl border border-border/60">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 animate-pulse text-primary" />
          Live · Agmarknet ({state}) · {items.length} commodities
        </span>
        {updated && (
          <span className="inline-flex items-center gap-1 normal-case tracking-normal">
            <Clock className="h-3 w-3" /> {new Date(updated).toLocaleTimeString()}
          </span>
        )}
      </div>
      {loading && <div className="p-4 text-sm text-muted-foreground">Loading live mandi prices…</div>}
      {error && <div className="p-4 text-sm text-destructive">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="p-4 text-sm text-muted-foreground">No arrivals reported for {state} today.</div>
      )}
      {items.length > 0 && (
        <>
          <div className="ticker-scroll flex gap-6 py-3">
            {[...items, ...items].map((c, i) => (
              <TickerPill key={c.commodity + i} item={c} />
            ))}
          </div>
          <style>{`
            .ticker-scroll { animation: mkt-scroll 90s linear infinite; width: max-content; }
            @keyframes mkt-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            .ticker-scroll:hover { animation-play-state: paused; }
          `}</style>
        </>
      )}
    </div>
  );
}

function TickerPill({ item }: { item: LiveCommodity }) {
  const up = item.delta >= 0;
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-border/50 bg-card/60 px-4 py-1.5 text-sm">
      <span className="font-semibold">{item.commodity}</span>
      <span className="font-display tabular-nums">₹{item.modal.toLocaleString()}</span>
      <span className={`inline-flex items-center gap-0.5 text-xs ${up ? "text-primary" : "text-destructive"}`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? "+" : ""}{item.delta} ({item.deltaPct.toFixed(1)}%)
      </span>
      <span className="text-xs text-muted-foreground">{item.markets} mandis</span>
    </div>
  );
}


/* ---------------- Movers ---------------- */
function MoverCard({
  title, tone, items, onPick,
}: {
  title: string; tone: "up" | "down";
  items: { crop: Crop; pct: number; price: number }[];
  onPick: (slug: string) => void;
}) {
  const Icon = tone === "up" ? TrendingUp : TrendingDown;
  return (
    <div className="card-elegant p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${tone === "up" ? "text-primary" : "text-destructive"}`} />
        <h3 className="font-display text-xl font-bold">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map(({ crop, pct, price }) => (
          <li key={crop.slug}>
            <button
              onClick={() => onPick(crop.slug)}
              className="flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left hover:border-border hover:bg-card/60"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{crop.emoji}</span>
                <span className="font-medium">{crop.name}</span>
              </span>
              <span className="flex items-center gap-3 text-sm">
                <span className="font-display tabular-nums">₹{price.toLocaleString()}</span>
                <span className={`tabular-nums ${pct >= 0 ? "text-primary" : "text-destructive"}`}>
                  {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Deep dive ---------------- */
function DeepDive({ crop, mod, district }: { crop: Crop; mod: number; district: string }) {
  const intraday = useMemo(() => intradayTrend(crop, mod), [crop, mod]);
  const monthly = useMemo(() => monthlyTrend(crop, mod), [crop, mod]);
  const yearly = useMemo(() => yearlyTrend(crop, mod), [crop, mod]);
  const mandis = useMemo(() => mandiComparison(crop, district, mod), [crop, district, mod]);
  const week = crop.marketPrice.trend.map((t) => ({ label: t.day, price: Math.round(t.price * mod) }));
  const { price: livePrice, delta, updatedAt } = useLiveTicker(crop.marketPrice.price * mod);
  const hlM = highLow(monthly);
  const hlY = highLow(yearly);
  const msp = crop.marketPrice.msp;
  const vsMsp = ((livePrice - msp) / msp) * 100;

  return (
    <div className="card-elegant overflow-hidden">
      {/* Header */}
      <div className="grid gap-6 border-b border-border/60 p-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{crop.emoji}</span>
            <div>
              <div className="font-display text-2xl font-bold">{crop.name}</div>
              <div className="text-xs text-muted-foreground">{crop.scientificName}</div>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <div className="font-display text-5xl font-black tabular-nums">₹{livePrice.toLocaleString()}</div>
            <span className={`mb-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              delta >= 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
            }`}>
              {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {delta >= 0 ? "+" : ""}{delta.toFixed(0)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{crop.marketPrice.unit}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(updatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
        <Stat label="MSP" value={`₹${msp.toLocaleString()}`} sub={`${vsMsp >= 0 ? "+" : ""}${vsMsp.toFixed(1)}% vs MSP`} tone={vsMsp >= 0 ? "up" : "down"} />
        <Stat label="Year High / Low" value={`₹${hlY.high.toLocaleString()}`} sub={`Low ₹${hlY.low.toLocaleString()}`} />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 p-6 md:grid-cols-2">
        <ChartCard title="Intraday · Today" icon={<Activity className="h-4 w-4" />}>
          <ResponsiveContainer>
            <AreaChart data={intraday}>
              <defs>
                <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Area type="monotone" dataKey="price" stroke="var(--primary)" fill="url(#gArea)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Trend" icon={<TrendingUp className="h-4 w-4" />}>
          <ResponsiveContainer>
            <LineChart data={week}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Monthly · ${hlM.low.toLocaleString()} – ${hlM.high.toLocaleString()}`} icon={<Activity className="h-4 w-4" />}>
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Bar dataKey="price" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="5-Year History" icon={<TrendingUp className="h-4 w-4" />}>
          <ResponsiveContainer>
            <AreaChart data={yearly}>
              <defs>
                <linearGradient id="gYear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent, var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--accent, var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Area type="monotone" dataKey="price" stroke="var(--primary)" fill="url(#gYear)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Mandi comparison */}
      <div className="border-t border-border/60 p-6">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h4 className="font-display text-lg font-bold">Nearby Mandi Comparison</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-2">Mandi</th>
                <th className="pb-2">Distance</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-right">vs Live</th>
              </tr>
            </thead>
            <tbody>
              {mandis.map((m) => {
                const diff = ((m.price - livePrice) / livePrice) * 100;
                return (
                  <tr key={m.mandi} className="border-t border-border/50">
                    <td className="py-2">{m.mandi}</td>
                    <td className="py-2 text-muted-foreground">{m.distanceKm} km</td>
                    <td className="py-2 text-right font-display tabular-nums">₹{m.price.toLocaleString()}</td>
                    <td className={`py-2 text-right tabular-nums ${diff >= 0 ? "text-primary" : "text-destructive"}`}>
                      {diff >= 0 ? "+" : ""}{diff.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</div>
      {sub && (
        <div className={`mt-1 text-xs ${tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : "text-muted-foreground"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {icon} {title}
      </div>
      <div className="h-56">{children}</div>
    </div>
  );
}

/* ---------------- Per-crop live card ---------------- */
function CropLiveCard({ crop, mod, onOpen }: { crop: Crop; mod: number; onOpen: () => void }) {
  const { price, delta, updatedAt } = useLiveTicker(crop.marketPrice.price * mod);
  const week = crop.marketPrice.trend.map((t) => ({ ...t, price: Math.round(t.price * mod) }));
  const first = week[0].price, last = week[week.length - 1].price;
  const wkPct = (((last - first) / first) * 100).toFixed(1);
  const up = delta >= 0;

  return (
    <button onClick={onOpen} className="card-elegant hover-lift w-full p-6 text-left">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{crop.emoji}</span>
            <h3 className="font-display text-xl font-bold">{crop.name}</h3>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="font-display text-3xl font-black tabular-nums">₹{price.toLocaleString()}</div>
            <span className={`text-xs ${up ? "text-primary" : "text-destructive"}`}>
              {up ? "+" : ""}{delta.toFixed(0)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{crop.marketPrice.unit} · MSP ₹{crop.marketPrice.msp.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
            Number(wkPct) >= 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
          }`}>
            {Number(wkPct) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Number(wkPct) >= 0 ? "+" : ""}{wkPct}% wk
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </div>
      <div className="mt-4 h-24">
        <ResponsiveContainer>
          <AreaChart data={week}>
            <defs>
              <linearGradient id={`ga-${crop.slug}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={CHART_TOOLTIP} />
            <Area type="monotone" dataKey="price" stroke="var(--primary)" fill={`url(#ga-${crop.slug})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </button>
  );
}
