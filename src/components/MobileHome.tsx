import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell, Sun, ArrowRight, ChevronRight, Calculator, FlaskConical,
  ShieldAlert, RefreshCw, TrendingUp, MapPin,
} from "lucide-react";
import { CROP_LIST } from "@/data/crops";
import { useLocation } from "@/lib/location-store";

import {
  cachedLiveWeather,
  fetchLiveWeather,
  codeToSky,
  type LiveWeather,
} from "@/lib/live-weather";
import { useAgmarknetLive } from "@/lib/agmarknet-live";

/* ============================================================
   MOBILE HOME — Uses the same K.G.F. design system tokens
   (card-elegant, glass, text-gradient, btn-gold) and Orbitron
   display / Inter body fonts as the desktop site. No hardcoded
   hex values; everything flows from src/styles.css.
   ============================================================ */
export function MobileHome() {
  const loc = useLocation();
  const trending = CROP_LIST.filter((c) => c.trending).slice(0, 8);

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-background pb-24 text-foreground lg:hidden">
      <Header loc={loc} />

      <div className="relative z-10 px-4">
        <div className="grid grid-cols-2 gap-3">
          <HeroTile />
          <WeatherTile district={loc.district} />
          <MarketPulseTile />
          <TrendingRail
            items={trending.map((c) => {
              const trend = c.marketPrice?.trend ?? [];
              const first = trend[0]?.price ?? c.marketPrice?.price ?? 0;
              const last = trend[trend.length - 1]?.price ?? c.marketPrice?.price ?? 0;
              const momentum = first > 0 ? ((last - first) / first) * 100 : 0;
              const regionCount = c.suitableDistricts?.length ?? 0;
              return {
                slug: c.slug,
                name: c.name,
                image: c.image,
                season: c.season,
                price: c.marketPrice?.price ?? 0,
                unit: c.marketPrice?.unit ?? "qtl",
                yieldText: c.yield,
                waterNeed: c.waterNeed,
                momentum,
                regionClass:
                  regionCount >= 8 ? "Core Zone" : regionCount >= 4 ? "Tier-1" : "Niche",
              };
            })}
          />

          <QuickActions />
          <SchemesTile />
          <AnalyticsTile profileYield={0.92} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HEADER
   ============================================================ */
function Header({ loc }: { loc: { state: string; district: string } }) {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 pb-2 pt-6">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.24em] text-accent/80">
            Live Location
          </span>
        </div>
        <span className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {loc.state} · {loc.district}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/districts"
          aria-label="Change district"
          className="card-elegant grid h-9 w-9 place-items-center rounded-xl active:scale-95"
        >
          <MapPin className="h-4 w-4 text-accent" />
        </Link>
        <div className="card-elegant font-display px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
          EN
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="card-elegant relative grid h-9 w-9 place-items-center rounded-xl active:scale-95"
        >
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
          <Bell className="h-4 w-4 text-accent" />
        </button>
      </div>
    </header>
  );
}

/* ============================================================
   HERO TILE
   ============================================================ */
function HeroTile() {
  return (
    <div className="card-elegant relative col-span-2 overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, var(--accent) 35%, transparent)" }}
      />
      <h1 className="font-display mb-3 text-[42px] uppercase leading-[0.9] tracking-tighter">
        <span className="text-white">KRISH</span><br /><span className="text-gradient">SENSE</span>
      </h1>
      <p className="mb-5 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
        Precision agricultural intelligence, forged for the modern Indian farmer.
      </p>
      <Link
        to="/crops"
        className="btn-gold font-display inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] uppercase tracking-widest active:scale-95"
      >
        Explore Crops
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

/* ============================================================
   WEATHER TILE — live Open-Meteo
   ============================================================ */
function WeatherTile({ district }: { district: string }) {
  const [wx, setWx] = useState<LiveWeather | null>(() => cachedLiveWeather(district));
  useEffect(() => {
    let alive = true;
    setWx(cachedLiveWeather(district));
    fetchLiveWeather(district).then((r) => alive && r && setWx(r));
    const id = setInterval(() => {
      fetchLiveWeather(district).then((r) => alive && r && setWx(r));
    }, 5 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [district]);

  const temp = wx?.tempC != null ? Math.round(wx.tempC) : null;
  const sky = wx ? codeToSky(wx.weatherCode) : "—";

  return (
    <div className="card-elegant p-5">
      <div className="mb-4 flex items-start justify-between">
        <div
          className="grid h-10 w-10 place-items-center rounded-full gold-border"
          style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 35%, transparent), transparent)" }}
        >
          <Sun className="h-5 w-5 text-accent" />
        </div>
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-accent/70">
          Live
        </span>
      </div>
      <div className="font-display text-2xl font-bold tracking-tight text-foreground">
        {temp != null ? `${temp}°C` : "—"}
      </div>
      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {sky} · {district}
      </div>
    </div>
  );
}

/* ============================================================
   MARKET PULSE TILE — top gainer from Agmarknet
   ============================================================ */
function MarketPulseTile() {
  const { data, loading } = useAgmarknetLive({ refreshMs: 5 * 60 * 1000, limit: 1500 });
  const gainer = [...data]
    .filter((c) => Number.isFinite(c.deltaPct))
    .sort((a, b) => b.deltaPct - a.deltaPct)[0];

  const pct = gainer?.deltaPct ?? 0;
  const positive = pct >= 0;
  const colorVar = positive ? "var(--leaf)" : "var(--destructive)";

  return (
    <Link to="/market" className="card-elegant block p-5 transition active:scale-[0.98]">
      <div className="font-display mb-4 text-[10px] font-bold uppercase tracking-widest text-accent/70">
        Market Pulse
      </div>
      <div className="mb-1 truncate text-xs font-semibold text-foreground">
        {loading ? "Loading…" : gainer?.commodity ?? "No data"}
      </div>
      <div className="flex items-end gap-2">
        <div
          className="font-display text-xl font-bold tracking-tight"
          style={{ color: colorVar }}
        >
          {positive ? "+" : ""}
          {pct.toFixed(1)}%
        </div>
        <Sparkline
          colorVar={colorVar}
          points={gainer?.weekly?.map((p) => p.avg) ?? [1, 1.2, 1.1, 1.5, 1.4, 1.8, 2]}
        />
      </div>
    </Link>
  );
}

function Sparkline({ points, colorVar }: { points: number[]; colorVar: string }) {
  if (!points.length) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  return (
    <div className="flex h-6 w-14 items-end gap-[2px] pb-1">
      {points.slice(-5).map((v, i, arr) => {
        const h = ((v - min) / span) * 100;
        const isLast = i === arr.length - 1;
        return (
          <span
            key={i}
            className="w-1 rounded-sm"
            style={{
              height: `${Math.max(15, h)}%`,
              background: colorVar,
              opacity: isLast ? 1 : 0.25 + (i / arr.length) * 0.5,
            }}
          />
        );
      })}
    </div>
  );
}

/* ============================================================
   TRENDING CROPS RAIL
   ============================================================ */
type TrendingItem = {
  slug: string;
  name: string;
  image: string;
  season: string;
  price: number;
  unit: string;
  yieldText: string;
  waterNeed: "Low" | "Medium" | "High";
  momentum: number;
  regionClass: string;
};

function useCountUp(target: number, durationMs = 900) {
  const [val, setVal] = useState(target);
  useEffect(() => {
    const start = val;
    const delta = target - start;
    if (Math.abs(delta) < 0.01) {
      setVal(target);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(start + delta * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return val;
}

function TrendingRail({ items }: { items: TrendingItem[] }) {
  const { data: live } = useAgmarknetLive({ refreshMs: 60 * 1000, limit: 1500 });
  const liveMap = new Map<string, number>();
  for (const row of live) {
    if (Number.isFinite(row.deltaPct)) {
      const key = row.commodity.toLowerCase().trim();
      if (!liveMap.has(key)) liveMap.set(key, row.deltaPct);
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const waterTone: Record<TrendingItem["waterNeed"], { dot: string; label: string }> = {
    Low: { dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]", label: "Low Water" },
    Medium: { dot: "bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]", label: "Moderate Water" },
    High: { dot: "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]", label: "High Water Needs" },
  };


  return (
    <div className="col-span-2 mt-2">
      {/* Section header — Cinematic dossier */}
      <div className="mb-5 flex items-end justify-between px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rotate-45 bg-accent"
              style={{ boxShadow: "0 0 8px var(--accent)" }}
            />
            <span className="font-display text-[10px] font-medium uppercase tracking-[0.2em] text-accent/60">
              Market Intelligence
            </span>
          </div>
          <h3 className="font-display text-2xl font-black uppercase tracking-tighter text-accent">
            Trending Crops
          </h3>
        </div>
        <Link
          to="/crops"
          className="font-display border-b border-accent/40 pb-1 text-[10px] font-bold uppercase tracking-widest text-accent"
        >
          View All
        </Link>
      </div>

      {/* Scrollable rail */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((c, idx) => {
          const liveMomentum = liveMap.get(c.name.toLowerCase().trim());
          const momentum = liveMomentum ?? c.momentum;
          const isLive = liveMomentum !== undefined;
          const positive = momentum >= 0;
          const stable = Math.abs(momentum) < 3;
          const badgeBg = stable ? "bg-foreground text-background" : "bg-accent text-background";
          const arrowColor = stable
            ? "border-t-foreground"
            : "border-t-accent";
          const water = waterTone[c.waterNeed];

          return (
            <Link
              key={c.slug}
              to="/crops/$slug"
              params={{ slug: c.slug }}
              className={`group relative w-[280px] shrink-0 snap-start overflow-hidden border border-accent/30 bg-card transition active:scale-[0.98] ${
                idx > 0 ? "opacity-90" : ""
              }`}
            >
              {/* Grain overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
                }}
              />

              {/* Image area */}
              <div className="relative h-44 overflow-hidden bg-background">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale brightness-[0.55] transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                {/* Momentum badge */}
                <div className="absolute left-3 top-3 flex items-center">
                  <div
                    className={`font-display flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-tighter ${badgeBg}`}
                  >
                    {isLive && (
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                        style={{ boxShadow: "0 0 6px currentColor" }}
                      />
                    )}
                    <LiveMomentum value={momentum} positive={positive} />
                    {stable ? "Stable" : isLive ? "Live" : "Momentum"}
                  </div>
                  <div
                    className={`h-0 w-0 border-r-[12px] border-t-[18px] border-r-transparent ${arrowColor}`}
                  />
                </div>


                {/* Water status */}
                <div className="absolute bottom-3 right-3">
                  <div className="flex items-center gap-1.5 border border-accent/20 bg-background/60 px-2 py-1 backdrop-blur-md">
                    <div className={`h-1.5 w-1.5 rounded-full ${water.dot}`} />
                    <span className="font-display text-[9px] font-bold uppercase tracking-tighter text-foreground/80">
                      {water.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div className="relative space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="font-display truncate text-xl font-bold uppercase leading-none tracking-tight text-foreground">
                      {c.name}
                    </h4>
                    <p className="font-display text-[10px] font-medium uppercase tracking-[0.2em] text-accent/60">
                      {c.season}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-lg font-black leading-none tracking-tighter text-accent">
                      ₹{fmt(c.price)}
                    </p>
                    <p className="font-display text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      per {c.unit}
                    </p>
                  </div>
                </div>

                {/* Data grid */}
                <div className="grid grid-cols-2 gap-px border border-accent/20 bg-accent/20">
                  <div className="bg-card p-3">
                    <p className="font-display mb-1 text-[8px] uppercase tracking-widest text-muted-foreground">
                      Projected Yield
                    </p>
                    <p className="truncate text-sm font-bold text-foreground/90">
                      {c.yieldText}
                    </p>
                  </div>
                  <div className="bg-card p-3">
                    <p className="font-display mb-1 text-[8px] uppercase tracking-widest text-muted-foreground">
                      Region Class
                    </p>
                    <p className="font-display truncate text-sm font-bold uppercase text-foreground/90">
                      {c.regionClass}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3">
        <div className="h-px w-8 bg-accent" />
        <div className="flex gap-1.5">
          <div className="h-1.5 w-1.5 rotate-45 bg-accent" />
          <div className="h-1.5 w-1.5 rotate-45 border border-accent/40 bg-accent/20" />
          <div className="h-1.5 w-1.5 rotate-45 border border-accent/40 bg-accent/20" />
        </div>
        <div className="h-px w-8 bg-accent/30" />
      </div>
    </div>
  );
}


/* ============================================================
   QUICK ACTIONS 2×2
   ============================================================ */
function QuickActions() {
  const items: {
    to: string;
    label: string;
    Icon: typeof Calculator;
    tone: "accent" | "primary" | "leaf" | "bronze";
  }[] = [
    { to: "/calculators", label: "Calculators", Icon: Calculator, tone: "accent" },
    { to: "/fertilizers", label: "Fertilizers", Icon: FlaskConical, tone: "primary" },
    { to: "/diseases", label: "Diseases", Icon: ShieldAlert, tone: "leaf" },
    { to: "/rotation", label: "Rotation", Icon: RefreshCw, tone: "bronze" },
  ];
  const toneVar: Record<typeof items[number]["tone"], string> = {
    accent: "var(--accent)",
    primary: "var(--primary)",
    leaf: "var(--leaf)",
    bronze: "var(--loam)",
  };
  return (
    <div className="col-span-2 mt-2 grid grid-cols-2 gap-3">
      {items.map(({ to, label, Icon, tone }) => (
        <Link
          key={to}
          to={to}
          className="card-elegant flex items-center gap-3 p-4 transition active:scale-[0.97]"
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
            style={{
              background: `color-mix(in oklab, ${toneVar[tone]} 15%, transparent)`,
              color: toneVar[tone],
              border: `1px solid color-mix(in oklab, ${toneVar[tone]} 30%, transparent)`,
            }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="truncate text-xs font-semibold text-foreground">{label}</span>
        </Link>
      ))}
    </div>
  );
}

/* ============================================================
   GOVT SCHEMES HIGHLIGHT
   ============================================================ */
function SchemesTile() {
  return (
    <Link
      to="/schemes"
      className="card-elegant col-span-2 mt-2 flex items-center justify-between p-5 transition active:scale-[0.98]"
    >
      <div className="min-w-0">
        <div className="font-display mb-1 text-[10px] font-black uppercase tracking-widest text-accent">
          Govt Portal
        </div>
        <div className="truncate text-sm font-bold text-foreground">
          PM-Kisan New Scheme
        </div>
        <div className="text-[10px] text-muted-foreground">
          Eligibility check active
        </div>
      </div>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full gold-border bg-accent/10">
        <ChevronRight className="h-5 w-5 text-accent" />
      </div>
    </Link>
  );
}

/* ============================================================
   ANALYTICS TEASER
   ============================================================ */
function AnalyticsTile({ profileYield }: { profileYield: number }) {
  const pct = Math.round(profileYield * 100);
  const bars = [25, 45, 65, 55, 90];
  return (
    <Link
      to="/analytics"
      className="card-elegant col-span-2 mt-2 overflow-hidden p-5 transition active:scale-[0.98]"
    >
      <div className="flex items-end justify-between">
        <div className="min-w-0">
          <div className="font-display mb-1 text-[10px] font-bold uppercase tracking-widest text-accent/70">
            Season Analytics
          </div>
          <div className="font-display flex items-center gap-2 text-lg font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-accent" />
            Efficiency: {pct}%
          </div>
        </div>
        <div className="flex h-12 items-end gap-1">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full"
              style={{
                height: `${h}%`,
                background: "var(--gradient-gold)",
                opacity: 0.35 + (i / bars.length) * 0.65,
              }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
