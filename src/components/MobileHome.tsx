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
   MOBILE HOME — K.G.F. "Charcoal & Gold" luxury bento.
   Palette: bg #111111, surface #1A1A1A/#222, gold #D4AF37,
   bright gold #F1C75B, bronze #A97142, profit #16C784.
   Typography: Orbitron display / Inter body.
   Rendered on <lg screens; desktop keeps its own layout.
   ============================================================ */
export function MobileHome() {
  const loc = useLocation();
  const trending = CROP_LIST.filter((c) => c.trending).slice(0, 8);

  return (
    <div
      className="ks-mobile-home relative min-h-screen w-full overflow-x-clip pb-24 lg:hidden"
      style={{
        background:
          "radial-gradient(1000px 600px at 50% -10%, rgba(212,175,55,0.18), transparent 60%), linear-gradient(180deg, #0d0d0d 0%, #161616 55%, #0f0f0f 100%)",
        color: "#F5F5F5",
        fontFamily: "'Inter', 'Manrope', system-ui, sans-serif",
      }}
    >
      {/* Ambient gold aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-80"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(241,199,91,0.22), transparent 70%)",
        }}
      />
      {/* Faint film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
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
   Shared luxury surface style
   ============================================================ */
const SURFACE: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(36,36,36,0.95) 0%, rgba(26,26,26,0.95) 100%)",
  border: "1px solid rgba(212,175,55,0.14)",
  boxShadow:
    "0 20px 50px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const DISPLAY_FONT = "'Orbitron', 'Rajdhani', system-ui, sans-serif";

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
            style={{ background: "#D4AF37", boxShadow: "0 0 10px #D4AF37" }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "rgba(241,199,91,0.7)", fontFamily: DISPLAY_FONT }}
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
          className="grid h-9 w-9 place-items-center rounded-xl active:scale-95"
          style={SURFACE}
        >
          <MapPin className="h-4 w-4" style={{ color: "#F1C75B" }} />
        </Link>
        <div
          className="rounded-md px-2 py-1 text-[10px] font-bold"
          style={{ ...SURFACE, color: "#F1C75B", fontFamily: DISPLAY_FONT }}
        >
          EN
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-xl active:scale-95"
          style={SURFACE}
        >
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
            style={{ background: "#D4AF37", boxShadow: "0 0 6px #D4AF37" }}
          />
          <Bell className="h-4 w-4" style={{ color: "#F1C75B" }} />
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
      className="relative col-span-2 overflow-hidden rounded-3xl p-6"
      style={SURFACE}
    >
      <div
        aria-hidden
        className="absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl"
        style={{ background: "rgba(241,199,91,0.28)" }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(241,199,91,0.6), transparent)",
        }}
      />
      <div
        className="mb-2 text-[10px] font-bold uppercase tracking-[0.32em]"
        style={{ color: "#A97142", fontFamily: DISPLAY_FONT }}
      >
        K · G · F  Edition
      </div>
      <h1
        className="mb-3 text-[42px] uppercase leading-[0.9] tracking-tighter"
        style={{
          fontFamily: DISPLAY_FONT,
          backgroundImage:
            "linear-gradient(135deg, #F1C75B 0%, #D4AF37 45%, #A97142 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        KRISH<br />SENSE
      </h1>
      <p
        className="mb-5 max-w-[220px] text-xs leading-relaxed"
        style={{ color: "rgba(245,245,245,0.65)" }}
      >
        Precision agricultural intelligence, forged for the modern Indian farmer.
      </p>
      <Link
        to="/crops"
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest active:scale-95"
        style={{
          background: "linear-gradient(135deg, #F1C75B 0%, #D4AF37 55%, #C89B3C 100%)",
          color: "#111111",
          boxShadow: "0 12px 30px -10px rgba(212,175,55,0.55)",
          fontFamily: DISPLAY_FONT,
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
    <div className="rounded-3xl p-5" style={SURFACE}>
      <div className="mb-4 flex items-start justify-between">
        <div
          className="grid h-10 w-10 place-items-center rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(241,199,91,0.35), transparent)",
            border: "1px solid rgba(212,175,55,0.25)",
          }}
        >
          <Sun className="h-5 w-5" style={{ color: "#F1C75B" }} />
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(212,175,55,0.7)", fontFamily: DISPLAY_FONT }}
        >
          Live
        </span>
      </div>
      <div
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: DISPLAY_FONT, color: "#F5F5F5" }}
      >
        {temp != null ? `${temp}°C` : "—"}
      </div>
      <div className="mt-0.5 truncate text-[11px]" style={{ color: "rgba(245,245,245,0.6)" }}>
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
  const color = positive ? "#16C784" : "#8B1E1E";

  return (
    <Link
      to="/market"
      className="block rounded-3xl p-5 transition active:scale-[0.98]"
      style={SURFACE}
    >
      <div
        className="mb-4 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: "rgba(212,175,55,0.7)", fontFamily: DISPLAY_FONT }}
      >
        Market Pulse
      </div>
      <div className="mb-1 truncate text-xs font-semibold" style={{ color: "#F5F5F5" }}>
        {loading ? "Loading…" : gainer?.commodity ?? "No data"}
      </div>
      <div className="flex items-end gap-2">
        <div
          className="text-xl font-bold tracking-tight"
          style={{ color, fontFamily: DISPLAY_FONT }}
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
          className="text-sm tracking-[0.2em]"
          style={{
            fontFamily: DISPLAY_FONT,
            backgroundImage:
              "linear-gradient(135deg, #F1C75B 0%, #D4AF37 60%, #A97142 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          TRENDING CROPS
        </h3>
        <Link
          to="/crops"
          className="text-[10px] font-bold tracking-widest"
          style={{ color: "#F1C75B", fontFamily: DISPLAY_FONT }}
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
            className="min-w-[132px] shrink-0 snap-start rounded-2xl p-3 transition active:scale-[0.97]"
            style={SURFACE}
          >
            <div
              className="mb-2 h-16 w-full overflow-hidden rounded-xl"
              style={{ background: "#0d0d0d", border: "1px solid rgba(212,175,55,0.12)" }}
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="block truncate text-xs font-bold" style={{ color: "#F5F5F5" }}>{c.name}</span>
            <span
              className="block truncate text-[10px]"
              style={{ color: "rgba(241,199,91,0.65)" }}
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
    { to: "/calculators", label: "Calculators", Icon: Calculator, color: "#F1C75B" },
    { to: "/fertilizers", label: "Fertilizers", Icon: FlaskConical, color: "#D4AF37" },
    { to: "/diseases", label: "Diseases", Icon: ShieldAlert, color: "#16C784" },
    { to: "/rotation", label: "Rotation", Icon: RefreshCw, color: "#A97142" },
  ];
  return (
    <div className="col-span-2 mt-2 grid grid-cols-2 gap-3">
      {items.map(({ to, label, Icon, color }) => (
        <Link
          key={to}
          to={to}
          className="flex items-center gap-3 rounded-2xl p-4 transition active:scale-[0.97]"
          style={SURFACE}
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
            style={{
              background: `${color}1F`,
              color,
              border: `1px solid ${color}33`,
            }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="truncate text-xs font-semibold" style={{ color: "#F5F5F5" }}>{label}</span>
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
      className="col-span-2 mt-2 flex items-center justify-between rounded-3xl p-5 transition active:scale-[0.98]"
      style={{
        ...SURFACE,
        background:
          "linear-gradient(90deg, rgba(36,36,36,0.95) 0%, rgba(50,42,26,0.95) 100%)",
      }}
    >
      <div className="min-w-0">
        <div
          className="mb-1 text-[10px] font-black uppercase tracking-widest"
          style={{ color: "#F1C75B", fontFamily: DISPLAY_FONT }}
        >
          Govt Portal
        </div>
        <div className="truncate text-sm font-bold" style={{ color: "#F5F5F5" }}>
          PM-Kisan New Scheme
        </div>
        <div className="text-[10px]" style={{ color: "rgba(245,245,245,0.6)" }}>
          Eligibility check active
        </div>
      </div>
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
        style={{
          background: "rgba(241,199,91,0.10)",
          border: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <ChevronRight className="h-5 w-5" style={{ color: "#F1C75B" }} />
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
      className="col-span-2 mt-2 overflow-hidden rounded-3xl p-5 transition active:scale-[0.98]"
      style={SURFACE}
    >
      <div className="flex items-end justify-between">
        <div className="min-w-0">
          <div
            className="mb-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(212,175,55,0.7)", fontFamily: DISPLAY_FONT }}
          >
            Season Analytics
          </div>
          <div
            className="flex items-center gap-2 text-lg font-bold"
            style={{ color: "#F5F5F5", fontFamily: DISPLAY_FONT }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: "#F1C75B" }} />
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
                background:
                  "linear-gradient(180deg, #F1C75B 0%, #D4AF37 60%, #A97142 100%)",
                opacity: 0.35 + (i / bars.length) * 0.65,
              }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
