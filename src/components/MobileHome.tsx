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
   MOBILE HOME — "Cinematic Pro" bento dashboard.
   Locked palette: bg #0B0B0F, surface #1A1A22, primary #DC2626,
   accent #F59E0B, text #F5F5F7. Typography: Archivo Black / Hind.
   Rendered on <lg screens; desktop keeps the existing Home layout.
   ============================================================ */
export function MobileHome() {
  const loc = useLocation();
  const p = profileFor(loc.district);
  const trending = CROP_LIST.filter((c) => c.trending).slice(0, 8);

  return (
    <div
      className="ks-mobile-home relative min-h-screen w-full overflow-x-clip pb-24 lg:hidden"
      style={{
        background: "#0B0B0F",
        color: "#F5F5F7",
        fontFamily: "'Hind', system-ui, sans-serif",
      }}
    >
      {/* Ambient glow behind hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px] opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(220,38,38,0.22), transparent 70%)",
        }}
      />

      <Header loc={loc} />

      <div className="relative z-10 px-4">
        <div className="grid grid-cols-2 gap-3">
          <HeroTile />
          <WeatherTile district={loc.district} />
          <MarketPulseTile />

          <TrendingRail
            items={trending.map((c) => ({
              slug: c.slug,
              name: c.name,
              image: c.image,
              tag: c.season,
            }))}
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
   HEADER — live location + language + notifications
   ============================================================ */
function Header({ loc }: { loc: { state: string; district: string } }) {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 pb-2 pt-6">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 animate-pulse rounded-full"
            style={{ background: "#DC2626" }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "rgba(245,245,247,0.55)" }}
          >
            Live Location
          </span>
        </div>
        <span className="mt-0.5 truncate text-sm font-semibold">
          {loc.state} · {loc.district}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/districts"
          aria-label="Change district"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-[#1A1A22] active:scale-95"
        >
          <MapPin className="h-4 w-4" />
        </Link>
        <div className="rounded-md border border-white/10 bg-[#1A1A22] px-2 py-1 text-[10px] font-bold">
          EN
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-[#1A1A22] active:scale-95"
        >
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
            style={{ background: "#DC2626" }}
          />
          <Bell className="h-4 w-4 opacity-80" />
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
    <div
      className="relative col-span-2 overflow-hidden rounded-3xl border border-white/5 p-6"
      style={{ background: "#1A1A22" }}
    >
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl"
        style={{ background: "rgba(220,38,38,0.22)" }}
      />
      <h1
        className="mb-3 text-[42px] uppercase leading-[0.9] tracking-tighter"
        style={{ fontFamily: "'Archivo Black', system-ui, sans-serif" }}
      >
        KRISH<br />
        <span style={{ color: "#DC2626" }}>SENSE</span>
      </h1>
      <p
        className="mb-5 max-w-[210px] text-xs leading-relaxed"
        style={{ color: "rgba(245,245,247,0.6)" }}
      >
        Precision agricultural intelligence for the modern Indian farmer.
      </p>
      <Link
        to="/crops"
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg active:scale-95"
        style={{
          background: "#DC2626",
          boxShadow: "0 10px 30px -10px rgba(220,38,38,0.5)",
        }}
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
    <div
      className="rounded-3xl border border-white/5 p-5"
      style={{ background: "#1A1A22" }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="grid h-10 w-10 place-items-center rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.35), transparent)",
          }}
        >
          <Sun className="h-5 w-5" style={{ color: "#F59E0B" }} />
        </div>
        <span
          className="text-[10px] font-bold uppercase"
          style={{ color: "rgba(245,245,247,0.4)" }}
        >
          Live
        </span>
      </div>
      <div className="text-2xl font-bold tracking-tight">
        {temp != null ? `${temp}°C` : "—"}
      </div>
      <div className="mt-0.5 truncate text-[11px]" style={{ color: "rgba(245,245,247,0.6)" }}>
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
  const color = positive ? "#10b981" : "#DC2626";

  return (
    <Link
      to="/market"
      className="block rounded-3xl border border-white/5 p-5 transition active:scale-[0.98]"
      style={{ background: "#1A1A22" }}
    >
      <div
        className="mb-4 text-[10px] font-bold uppercase"
        style={{ color: "rgba(245,245,247,0.4)" }}
      >
        Market Pulse
      </div>
      <div className="mb-1 truncate text-xs font-semibold">
        {loading ? "Loading…" : gainer?.commodity ?? "No data"}
      </div>
      <div className="flex items-end gap-2">
        <div
          className="text-xl font-bold tracking-tight"
          style={{ color }}
        >
          {positive ? "+" : ""}
          {pct.toFixed(1)}%
        </div>
        <Sparkline color={color} points={gainer?.weekly?.map((p) => p.avg) ?? [1, 1.2, 1.1, 1.5, 1.4, 1.8, 2]} />
      </div>
    </Link>
  );
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
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
              background: color,
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
        <h3
          className="text-sm tracking-tight"
          style={{ fontFamily: "'Archivo Black', system-ui, sans-serif" }}
        >
          TRENDING CROPS
        </h3>
        <Link
          to="/crops"
          className="text-[10px] font-bold"
          style={{ color: "#DC2626" }}
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
            className="min-w-[132px] shrink-0 snap-start rounded-2xl border border-white/5 p-3 transition active:scale-[0.97]"
            style={{ background: "#1A1A22" }}
          >
            <div className="mb-2 h-16 w-full overflow-hidden rounded-xl bg-black/40">
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="block truncate text-xs font-bold">{c.name}</span>
            <span
              className="block truncate text-[10px]"
              style={{ color: "rgba(245,245,247,0.5)" }}
            >
              {c.tag}
            </span>
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
    color: string;
  }[] = [
    { to: "/calculators", label: "Calculators", Icon: Calculator, color: "#DC2626" },
    { to: "/fertilizers", label: "Fertilizers", Icon: FlaskConical, color: "#F59E0B" },
    { to: "/diseases", label: "Diseases", Icon: ShieldAlert, color: "#10b981" },
    { to: "/rotation", label: "Rotation", Icon: RefreshCw, color: "#3b82f6" },
  ];
  return (
    <div className="col-span-2 mt-2 grid grid-cols-2 gap-3">
      {items.map(({ to, label, Icon, color }) => (
        <Link
          key={to}
          to={to}
          className="flex items-center gap-3 rounded-2xl border border-white/5 p-4 transition active:scale-[0.97]"
          style={{ background: "#1A1A22" }}
        >
          <div
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            style={{ background: `${color}1A`, color }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="truncate text-xs font-semibold">{label}</span>
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
      className="col-span-2 mt-2 flex items-center justify-between rounded-3xl border border-white/10 p-5 transition active:scale-[0.98]"
      style={{
        background: "linear-gradient(90deg, #1A1A22 0%, #252530 100%)",
      }}
    >
      <div className="min-w-0">
        <div
          className="mb-1 text-[10px] font-black uppercase tracking-widest"
          style={{ color: "#F59E0B" }}
        >
          Govt Portal
        </div>
        <div className="truncate text-sm font-bold">PM-Kisan New Scheme</div>
        <div className="text-[10px]" style={{ color: "rgba(245,245,247,0.6)" }}>
          Eligibility check active
        </div>
      </div>
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <ChevronRight className="h-5 w-5 opacity-70" />
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
      className="col-span-2 mt-2 overflow-hidden rounded-3xl border border-white/5 p-5 transition active:scale-[0.98]"
      style={{ background: "#1A1A22" }}
    >
      <div className="flex items-end justify-between">
        <div className="min-w-0">
          <div
            className="mb-1 text-[10px] font-bold uppercase"
            style={{ color: "rgba(245,245,247,0.4)" }}
          >
            Season Analytics
          </div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <TrendingUp className="h-4 w-4" style={{ color: "#DC2626" }} />
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
                background: "#DC2626",
                opacity: 0.2 + (i / bars.length) * 0.8,
              }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
