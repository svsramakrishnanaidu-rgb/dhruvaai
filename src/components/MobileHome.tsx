import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

import { Link } from "@tanstack/react-router";
import {
  Bell, Sun, ArrowRight, ChevronRight, Calculator,
  ShieldAlert, RefreshCw, TrendingUp, MapPin, Music2, Languages,
} from "lucide-react";
import { CROP_LIST } from "@/data/crops";
import { useLocation } from "@/lib/location-store";
import { haptic } from "@/lib/haptics";
import videoAsset from "@/assets/background_video.mp4.asset.json";



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

  // Hoisted + memoised: this filter/map over the whole crop list previously ran
  // on every parent render and re-created 8 fresh object identities, forcing the
  // entire trending rail (images included) to reconcile each time.
  const trendingItems = useMemo<TrendingItem[]>(
    () =>
      CROP_LIST.filter((c) => c.trending)
        .slice(0, 8)
        .map((c) => {
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
        }),
    [],
  );

  return (
    <div className="relative min-h-screen w-full overflow-x-clip pb-24 text-foreground lg:hidden">
      {/* Background Video - Fixed and Stationary */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover scale-[1.02]"
          poster="/placeholder.svg"
          style={{ 
            imageRendering: 'crisp-edges',
            filter: 'contrast(1.1) brightness(0.9)' 
          }}
        >
          <source src={videoAsset.url} type="video/mp4" />
        </video>
        {/* Cinematic gradient overlay for maximum readability and 16K feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 backdrop-blur-[1px]" />
      </div>


      <Header loc={loc} />

      <div className="relative z-10 px-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <HeroTile />
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <WeatherTile district={loc.district} />
            <MarketPulseTile />
          </div>
          
          <TrendingRail items={trendingItems} />

          <div className="col-span-2 grid grid-cols-2 gap-4 mt-2">
            <QuickActions />
            <SchemesTile />
            <AnalyticsTile profileYield={0.92} />
          </div>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   HEADER
   ============================================================ */
function Header({ loc }: { loc: { state: string; district: string } }) {
  const { lang } = useI18n();
  const badge = lang.toUpperCase();

  return (
    <header className="relative z-10 flex items-center justify-between px-6 pb-2 pt-8">

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
      <div className="neo-glass flex shrink-0 items-center gap-0.5 rounded-2xl p-1.5 px-2">

        <HeaderIcon to="/districts" label="Change district" icon={<MapPin className="h-[15px] w-[15px]" />} />
        <HeaderDivider />
        <HeaderIcon to="/music" label="Music studio" icon={<Music2 className="h-[15px] w-[15px]" />} />
        <HeaderDivider />
        <HeaderIcon label="Language" icon={<Languages className="h-[15px] w-[15px]" />} badge={"'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            For the code present, I get the error below.\n\nPlease think step-by-step in order to resolve it.\n```\nThe app returned 500 while handling GET /_serverFn/eyJmaWxlIjoiL3NyYy9saWIvYWdtYXJrbmV0LmZ1bmN0aW9ucy50cz90c3Mtc2VydmVyZm4tc3BsaXQiLCJleHBvcnQiOiJmZXRjaEFnbWFya25ldF9jcmVhdGVTZXJ2ZXJGbl9oYW5kbGVyIn0?payload=%7B%22t%22%3A%7B%22t%22%3A10%2C%22i%22%3A0%2C%22p%22%3A%7B%22k%22%3A%5B%22data%22%5D%2C%22v%22%3A%5B%7B%22t%22%3A10%2C%22i%22%3A1%2C%22p%22%3A%7B%22k%22%3A%5B%22state%22%2C%22limit%22%5D%2C%22v%22%3A%5B%7B%22t%22%3A2%2C%22s%22%3A1%7D%2C%7B%22t%22%3A0%2C%22s%22%3A1500%7D%5D%7D%2C%22o%22%3A0%7D%5D%7D%2C%22o%22%3A0%7D%2C%22f%22%3A63%2C%22m%22%3A%5B%5D%7D. The error was handled by a route or error boundary, so no stack was captured — check the failing loader/route code and the dev server output.\n\n{\n  \"timestamp\": 1786892546270,\n  \"error_type\": \"RUNTIME_ERROR\",\n  \"filename\": \"Unknown file\",\n  \"lineno\": 0,\n  \"colno\": 0,\n  \"stack\": \"Unavailable\",\n  \"has_blank_screen\": true\n}\n```"} />
        <HeaderDivider />
        <HeaderIcon label="Notifications" icon={<Bell className="h-[15px] w-[15px]" />} dot />
      </div>
    </header>
  );
}

function HeaderDivider() {
  return (
    <span
      aria-hidden
      className="h-5 w-px"
      style={{ background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--accent) 45%, transparent), transparent)" }}
    />
  );
}

function HeaderIcon({
  to, label, icon, dot, badge,
}: {
  to?: string; label: string; icon: React.ReactNode; dot?: boolean; badge?: string;
}) {
  const content = (
    <>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl text-accent transition-colors group-active:text-primary">
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100"
          style={{ background: "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%)" }}
        />
        {icon}
        {dot && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
        )}
        {badge && (
          <span className="font-display absolute -bottom-0.5 right-0.5 rounded-[4px] bg-background/80 px-1 text-[7px] font-bold leading-none tracking-widest text-accent">
            {badge}
          </span>
        )}
      </span>
    </>
  );
  const cls = "group relative grid place-items-center rounded-xl active:scale-90 transition-transform";
  return to ? (
    <Link to={to} aria-label={label} className={cls} onPointerDown={() => haptic("tap")}>{content}</Link>
  ) : (
    <button type="button" aria-label={label} className={cls} onPointerDown={() => haptic("tap")}>{content}</button>
  );
}


/* ============================================================
   HERO TILE
   ============================================================ */
function HeroTile() {
  return (
    <div className="neo-glass-card relative col-span-2 overflow-hidden px-7 py-8">
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
        className="btn-gold font-display inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-[12px] uppercase tracking-widest active:scale-95"
      >
        Explore Crops
        <ArrowRight className="h-4 w-4" />
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
    <div className="neo-glass-card p-5 px-6">
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
  const price =
    (gainer as { modalPrice?: number } | undefined)?.modalPrice ??
    gainer?.weekly?.[gainer.weekly.length - 1]?.avg ??
    0;
  const points =
    gainer?.weekly?.map((p) => p.avg) ?? [1, 1.2, 1.1, 1.5, 1.4, 1.8, 2];
  const path = buildSparkPath(points);
  const changeColor = positive ? "var(--leaf)" : "var(--destructive)";

  return (
    <Link
      to="/market"
      className="group relative block aspect-square overflow-hidden neo-glass-card shadow-2xl transition-all duration-300 hover:border-accent/50 active:scale-[0.98]"
    >

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--accent) 6%, transparent), transparent 60%, #000)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-3">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80">
            Market Pulse
          </span>
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: changeColor, boxShadow: `0 0 8px ${changeColor}` }}
          />
        </div>

        <div>
          <h3
            className="font-display truncate text-[18px] font-bold uppercase leading-none tracking-wider text-foreground"
            title={gainer?.commodity ?? ""}
          >
            {loading ? "Loading" : gainer?.commodity ?? "No data"}
          </h3>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-[13px] font-medium tabular-nums text-foreground/90">
              {price ? `₹${Math.round(price).toLocaleString("en-IN")}` : "—"}
            </span>
            <span
              className="text-[11px] font-bold tabular-nums"
              style={{ color: changeColor }}
            >
              {positive ? "+" : ""}
              {pct.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <svg className="h-12 w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mpLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
              <linearGradient id="mpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${path} L100,40 L0,40 Z`} fill="url(#mpFill)" />
            <path
              d={path}
              fill="none"
              stroke="url(#mpLine)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_4px_color-mix(in_oklab,var(--accent)_50%,transparent)]"
            />
          </svg>
        </div>
      </div>

      <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-accent/60" />
      <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-accent/60" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/4 opacity-0 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--accent) 14%, transparent), transparent)",
          animation: "mp-scan 2.2s linear infinite",
        }}
      />
      <style>{`@keyframes mp-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(500%); } }`}</style>
    </Link>
  );
}

function buildSparkPath(points: number[]): string {
  if (!points.length) return "M0,20 L100,20";
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = 100 / Math.max(1, points.length - 1);
  return points
    .map((v, i) => {
      const x = i * step;
      const y = 38 - ((v - min) / span) * 34;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
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

/**
 * Animated percentage counter.
 *
 * Perf note: the previous version called setState on every animation frame, so
 * eight visible cards produced ~480 React renders per second — the main cause
 * of jank while the trending rail was on screen. This version writes straight
 * to the DOM node via a ref, so the animation costs zero reconciliation, and it
 * short-circuits entirely under `prefers-reduced-motion`.
 */
function LiveMomentum({ value, positive, durationMs = 900 }: { value: number; positive: boolean; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  const format = (v: number) => `${positive && v >= 0 ? "+" : ""}${v.toFixed(1)}%`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = prev.current;
    const delta = value - start;
    prev.current = value;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || Math.abs(delta) < 0.05) {
      el.textContent = format(value);
      return;
    }

    const t0 = performance.now();
    let raf = 0;
    let lastText = "";
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const text = format(start + delta * eased);
      // Only touch the DOM when the rendered string actually changes.
      if (text !== lastText) { lastText = text; el.textContent = text; }
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, positive, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(value)}
    </span>
  );
}


function TrendingRail({ items }: { items: TrendingItem[] }) {
  const { data: live } = useAgmarknetLive({ refreshMs: 60 * 1000, limit: 1500 });
  // Memoised: rebuilding a 1500-entry Map on every render (including every
  // scroll-triggered re-render) was pure wasted CPU on mid-range Androids.
  const liveMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const row of live) {
      if (Number.isFinite(row.deltaPct)) {
        const key = row.commodity.toLowerCase().trim();
        if (!m.has(key)) m.set(key, row.deltaPct);
      }
    }
    return m;
  }, [live]);

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
              className={`group relative w-[280px] shrink-0 snap-start overflow-hidden neo-glass-card transition active:scale-[0.98] ${
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
                  decoding="async"
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
                    <h4 className="font-display truncate text-2xl font-black uppercase leading-none tracking-tight text-foreground">
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
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="h-[2px] w-10 bg-accent/40 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-accent animate-[shimmer_2s_infinite]" />
        </div>
        <div className="flex gap-2">
          <div className="h-2 w-2 rotate-45 bg-accent shadow-[0_0_8px_var(--accent)]" />
          <div className="h-2 w-2 rotate-45 border border-accent/40 bg-white/10" />
          <div className="h-2 w-2 rotate-45 border border-accent/40 bg-white/10" />
        </div>
        <div className="h-[2px] w-10 bg-accent/20 rounded-full" />
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
          className="neo-glass-card flex items-center gap-3 p-4 transition active:scale-[0.97]"
          onPointerDown={() => haptic("select")}

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
      className="neo-glass-card col-span-2 mt-2 flex items-center justify-between p-5 transition active:scale-[0.98]"
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
      className="neo-glass-card col-span-2 mt-2 overflow-hidden p-5 transition active:scale-[0.98]"
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
