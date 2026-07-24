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
function TrendingRail({
  items,
}: {
  items: { slug: string; name: string; image: string; tag: string }[];
}) {
  return (
    <div className="col-span-2 mt-2">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-gradient text-sm tracking-[0.2em]">
          TRENDING CROPS
        </h3>
        <Link
          to="/crops"
          className="font-display text-[10px] font-bold tracking-widest text-accent"
        >
          VIEW ALL
        </Link>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((c) => (
          <Link
            key={c.slug}
            to="/crops/$slug"
            params={{ slug: c.slug }}
            className="card-elegant min-w-[132px] shrink-0 snap-start p-3 transition active:scale-[0.97]"
          >
            <div className="mb-2 h-16 w-full overflow-hidden rounded-xl bg-background gold-border">
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="block truncate text-xs font-bold text-foreground">
              {c.name}
            </span>
            <span className="block truncate text-[10px] text-accent/70">{c.tag}</span>
          </Link>
        ))}
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
