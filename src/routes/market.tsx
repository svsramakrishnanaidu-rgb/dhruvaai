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
import { TrendingUp, TrendingDown, Activity, MapPin, Clock, Flame, Droplets, Sprout, IndianRupee } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/heroes/market.jpg";
import {
  useLiveTicker, monthlyTrend, yearlyTrend, intradayTrend,
  mandiComparison, highLow,
} from "@/lib/live-market";
import { LiveMarketBoard } from "@/components/LiveMarketBoard";
import { MarketInsightsPanel } from "@/components/MarketInsightsPanel";
import { MarketCommandCenter } from "@/components/MarketCommandCenter";



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
        {/* Enterprise command center: status · KPIs · alerts · leaderboard · AI signals */}
        <MarketCommandCenter />

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

        {/* Trending Crops — full data */}
        <TrendingCropsSection mod={mod} onOpen={(s) => setActiveSlug(s)} />

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

/* ---------------- Trending Crops (full data) ---------------- */
function TrendingCropsSection({ mod, onOpen }: { mod: number; onOpen: (slug: string) => void }) {
  const trending = useMemo(
    () => CROP_LIST.filter((c) => c.trending).sort((a, b) => b.profitPct - a.profitPct),
    []
  );
  if (!trending.length) return null;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <Flame className="h-3 w-3" /> Trending Now · {trending.length} crops
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold">Trending Crops · Full Market Data</h2>
          <p className="text-sm text-muted-foreground">
            Live mandi price, MSP spread, weekly momentum, profitability and agronomy — for every trending crop.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {trending.map((c) => (
          <Reveal key={c.slug}>
            <TrendingCropCard crop={c} mod={mod} onOpen={() => onOpen(c.slug)} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TrendingCropCard({ crop, mod, onOpen }: { crop: Crop; mod: number; onOpen: () => void }) {
  const { price, delta, updatedAt } = useLiveTicker(crop.marketPrice.price * mod);
  const week = crop.marketPrice.trend.map((t) => ({ ...t, price: Math.round(t.price * mod) }));
  const first = week[0].price, last = week[week.length - 1].price;
  const wkPct = ((last - first) / first) * 100;
  const msp = crop.marketPrice.msp;
  const vsMsp = ((price - msp) / msp) * 100;
  const up = delta >= 0;

  return (
    <div className="card-elegant hover-lift overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <img src={crop.image} alt={crop.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          <Flame className="h-3 w-3" /> Trending
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-1 text-[10px] font-semibold backdrop-blur">
          +{crop.profitPct}% profit
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{crop.emoji}</span>
              <h3 className="font-display text-xl font-bold drop-shadow">{crop.name}</h3>
            </div>
            <div className="text-[11px] italic text-muted-foreground">{crop.scientificName}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <div className="font-display text-3xl font-black tabular-nums">₹{price.toLocaleString()}</div>
              <span className={`text-xs ${up ? "text-primary" : "text-destructive"}`}>{up ? "+" : ""}{delta.toFixed(0)}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">{crop.marketPrice.unit}</div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              wkPct >= 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
            }`}>
              {wkPct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {wkPct >= 0 ? "+" : ""}{wkPct.toFixed(1)}% wk
            </span>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>
        </div>

        <div className="h-20 -mx-1">
          <ResponsiveContainer>
            <AreaChart data={week}>
              <defs>
                <linearGradient id={`tg-${crop.slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Area type="monotone" dataKey="price" stroke="var(--primary)" fill={`url(#tg-${crop.slug})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <MiniStat icon={<IndianRupee className="h-3 w-3" />} label="MSP" value={`₹${msp.toLocaleString()}`} sub={`${vsMsp >= 0 ? "+" : ""}${vsMsp.toFixed(1)}% vs MSP`} tone={vsMsp >= 0 ? "up" : "down"} />
          <MiniStat icon={<Sprout className="h-3 w-3" />} label="Yield" value={crop.yield} />
          <MiniStat icon={<Droplets className="h-3 w-3" />} label="Water" value={crop.waterNeed} />
          <MiniStat icon={<Activity className="h-3 w-3" />} label="Season" value={crop.season} />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-card/40 p-3 text-[11px]">
          <div><span className="text-muted-foreground">Soil</span><div className="font-semibold">{crop.soilType}</div></div>
          <div><span className="text-muted-foreground">Climate</span><div className="font-semibold">{crop.climate}</div></div>
          <div><span className="text-muted-foreground">Temp</span><div className="font-semibold">{crop.temperature}</div></div>
          <div><span className="text-muted-foreground">Rainfall</span><div className="font-semibold">{crop.rainfall}</div></div>
        </div>

        {crop.suitableDistricts?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {crop.suitableDistricts.slice(0, 4).map((d) => (
              <span key={d} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[10px]">
                <MapPin className="h-2.5 w-2.5" /> {d}
              </span>
            ))}
            {crop.suitableDistricts.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{crop.suitableDistricts.length - 4} more</span>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onOpen} className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
            Deep analytics
          </button>
          <Link
            to="/crops/$slug"
            params={{ slug: crop.slug }}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-center text-xs font-semibold transition hover:bg-muted"
          >
            Full crop guide →
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub?: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-0.5 font-display text-sm font-bold tabular-nums">{value}</div>
      {sub && (
        <div className={`text-[10px] ${tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : "text-muted-foreground"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}
