import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WebCinematicBackground } from "@/components/WebCinematicBackground";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Gauge,
  LocateFixed,
  MapPin,
  Moon,
  RefreshCw,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Umbrella,
  Wind,
  Waves,
  Sprout,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { IMAGE_PRESETS } from "@/lib/smart-image";
import { HeroBanner } from "@/components/HeroBanner";
import { ManualLocationPicker, type ManualPlace } from "@/components/ManualLocationPicker";
import { Reveal } from "@/components/Reveal";
import { WeatherBackground } from "@/components/WeatherBackground";
import {
  codeToSky,
  fetchWeatherBundle,
  nowContext,
  reverseGeocode,
  weatherKind,
  windDirLabel,
  type WeatherBundle,
} from "@/lib/live-weather";
import {
  aqiCategory,
  buildAdvisories,
  uvCategory,
} from "@/lib/weather-advisory";
import heroImg from "@/assets/heroes/weather.jpg";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Live Weather Intelligence — Krish Sense" },
      {
        name: "description",
        content:
          "Real-time weather, hourly & 15-day forecast, air quality, soil metrics and AI-powered agricultural advisories for every Indian farming district.",
      },
    ],
  }),
  component: WeatherPage,
});

function fmtHour(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "numeric" });
}
function fmtDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}
function fmtTime(iso: string) {
  return iso ? new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "—";
}

function WeatherIcon({ code, isDay = true, className = "h-8 w-8" }: { code: number; isDay?: boolean; className?: string }) {
  if ([95, 96, 99].includes(code)) return <Zap className={`${className} text-amber-400`} aria-hidden />;
  if ([61, 63, 65, 80, 81, 82, 66, 67].includes(code))
    return <CloudRain className={`${className} text-sky-400`} aria-hidden />;
  if ([51, 53, 55, 56, 57].includes(code)) return <CloudRain className={`${className} text-sky-300`} aria-hidden />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudRain className={`${className} text-white`} aria-hidden />;
  if ([45, 48].includes(code)) return <Waves className={`${className} text-slate-300`} aria-hidden />;
  if ([2, 3].includes(code)) return <Umbrella className={`${className} text-slate-300`} aria-hidden />;
  if (code === 1) return isDay ? <Sun className={`${className} text-amber-300`} aria-hidden /> : <Moon className={`${className} text-slate-200`} aria-hidden />;
  return isDay ? <Sun className={`${className} text-amber-300`} aria-hidden /> : <Moon className={`${className} text-slate-200`} aria-hidden />;
}

/* ------------------------------- Gauges --------------------------------- */

function ArcGauge({
  value,
  min = 0,
  max = 100,
  label,
  color = "var(--web-gold)",
  unit = "",
}: {
  value: number;
  min?: number;
  max?: number;
  label: string;
  color?: string;
  unit?: string;
}) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const R = 46, C = 2 * Math.PI * R;
  const dash = C * 0.75; // 270°
  const filled = dash * pct;
  return (
    <div className="web-glass relative flex flex-col items-center p-6 border-web-leaf/10">
      <svg viewBox="0 0 120 120" className="h-32 w-32">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"
          strokeDasharray={`${dash} ${C}`} transform="rotate(135 60 60)" strokeLinecap="round" />
        <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${C}`} transform="rotate(135 60 60)" strokeLinecap="round"
          style={{ transition: "stroke-dasharray 700ms ease" }} />
        <text x="60" y="62" textAnchor="middle" className="fill-web-mist" style={{ font: "900 22px Unbounded" }}>
          {Math.round(value)}
        </text>
        <text x="60" y="80" textAnchor="middle" className="fill-web-sage" style={{ font: "700 10px Plus Jakarta Sans" }}>
          {unit}
        </text>
      </svg>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-web-sage font-[Plus Jakarta Sans]">{label}</div>
    </div>
  );
}

function WindCompass({ deg, kph, gust }: { deg: number; kph: number; gust: number }) {
  return (
    <div className="web-glass hover-lift relative overflow-hidden rounded-3xl p-5 border-web-leaf/10 font-[Plus Jakarta Sans]">
      <div className="flex items-center gap-2 text-sm font-bold text-web-mist">
        <Compass className="h-4 w-4 text-web-gold" /> Wind
      </div>
      <div className="mt-3 flex items-center justify-center">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 160 160" className="h-full w-full">
            <circle cx="80" cy="80" r="70" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
            {["N", "E", "S", "W"].map((d, i) => (
              <text key={d} x={80 + Math.sin((i * Math.PI) / 2) * 60}
                y={80 - Math.cos((i * Math.PI) / 2) * 60 + 4}
                textAnchor="middle" className="fill-muted-foreground" style={{ font: "600 11px system-ui" }}>
                {d}
              </text>
            ))}
            <g transform={`rotate(${deg} 80 80)`} style={{ transition: "transform 700ms ease" }}>
              <polygon points="80,20 88,80 80,72 72,80" fill="hsl(var(--primary))" />
              <polygon points="80,140 88,80 80,88 72,80" fill="rgba(255,255,255,0.5)" />
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-2xl font-black">{kph}</div>
            <div className="text-[10px] uppercase text-muted-foreground">km/h · {windDirLabel(deg)}</div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center text-xs text-muted-foreground">Gusts {gust} km/h</div>
    </div>
  );
}

/* ------------------------------ Sun bar --------------------------------- */

function SunPath({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const now = Date.now();
  const s = sunrise ? new Date(sunrise).getTime() : 0;
  const e = sunset ? new Date(sunset).getTime() : 0;
  const pct = s && e && e > s ? Math.max(0, Math.min(1, (now - s) / (e - s))) : 0.5;
  const x = 20 + pct * 260;
  const y = 90 - Math.sin(pct * Math.PI) * 60;
  return (
    <div className="web-glass rounded-3xl p-5 border-web-leaf/10 font-[Plus Jakarta Sans]">
      <div className="flex items-center gap-2 text-sm font-bold text-web-mist">
        <Sun className="h-4 w-4 text-web-gold" /> Sun path
      </div>
      <svg viewBox="0 0 300 110" className="mt-2 h-24 w-full">
        <path d="M 20 90 Q 150 -30 280 90" fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 4" strokeWidth="2" />
        <line x1="20" y1="90" x2="280" y2="90" stroke="rgba(255,255,255,0.15)" />
        <circle cx={x} cy={y} r="7" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 10px #f59e0b)" }} />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Sunrise className="h-3 w-3" /> {fmtTime(sunrise)}</div>
        <div className="flex items-center gap-1"><Sunset className="h-3 w-3" /> {fmtTime(sunset)}</div>
      </div>
    </div>
  );
}

/* ----------------------------- AQI panel -------------------------------- */

function AqiPanel({ air }: { air: NonNullable<WeatherBundle["air"]> }) {
  const cat = aqiCategory(air.aqi);
  return (
    <div className="web-glass hover-lift rounded-3xl p-5 border-web-leaf/10 font-[Plus Jakarta Sans]">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-web-mist">Air Quality</div>
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest" style={{ background: `${cat.color}22`, color: cat.color }}>
          {cat.label}
        </span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <div className="font-[Unbounded] text-5xl font-black" style={{ color: cat.color }}>{air.aqi}</div>
        <div className="mb-2 text-xs font-bold text-web-sage">European AQI</div>
      </div>
      <p className="mt-1 text-xs text-web-sage font-[Instrument Sans]">{cat.tone}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        {[
          ["PM2.5", `${air.pm2_5.toFixed(1)} µg`],
          ["PM10", `${air.pm10.toFixed(1)} µg`],
          ["O₃", `${air.o3.toFixed(0)} µg`],
          ["NO₂", `${air.no2.toFixed(0)} µg`],
          ["SO₂", `${air.so2.toFixed(0)} µg`],
          ["CO", `${air.co.toFixed(0)} µg`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-secondary/50 p-2">
            <div className="font-semibold">{v}</div>
            <div className="text-[10px] text-muted-foreground">{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Live GPS status bar ------------------------- */

/** Great-circle distance in metres — used to ignore GPS jitter. */
function distanceM(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function GpsBar({
  place,
  accuracy,
  fixedAt,
  fetchedAt,
  busy,
  onRefresh,
}: {
  place: string;
  accuracy: number;
  fixedAt: number;
  fetchedAt: number | null;
  busy: boolean;
  onRefresh: () => void;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 15000);
    return () => window.clearInterval(id);
  }, []);
  const ago = (t: number) => {
    const s = Math.max(0, Math.round((Date.now() - t) / 1000));
    return s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
  };
  return (
    <div className="glass mx-auto mt-6 flex max-w-5xl flex-wrap items-center gap-3 rounded-3xl p-4">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <MapPin className="h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-bold leading-tight">{place}</div>
          <div className="text-xs text-muted-foreground">
            Live GPS · ±{Math.round(accuracy)}m · fix {ago(fixedAt)}
            {fetchedAt ? ` · data ${ago(fetchedAt)}` : ""}
          </div>
        </div>
      </div>
      <button
        onClick={onRefresh}
        disabled={busy}
        className="tap inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
        {busy ? "Updating…" : "Refresh"}
      </button>
    </div>
  );
}


/* --------------------------- Advisory badge ----------------------------- */

const LEVEL_STYLE: Record<string, string> = {
  good: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  watch: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  warn: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

/* --------------------------------- Page --------------------------------- */

type GpsState =
  | { phase: "locating" }
  | { phase: "ready"; lat: number; lon: number; accuracy: number; at: number }
  | { phase: "blocked"; kind: "denied" | "unavailable" | "insecure" | "timeout"; message: string };

const GPS_MESSAGES: Record<string, string> = {
  denied: "Location permission is blocked. Allow location for this site in your browser settings, then tap Retry.",
  unavailable: "Location services appear to be turned off on your device. Turn on GPS / Location, then tap Retry.",
  insecure: "Live location needs a secure (https) connection.",
  timeout: "GPS didn't respond in time. Move to an open area and tap Retry.",
};

function WeatherPage() {
  const ctx = useMemo(() => nowContext(), []);
  const [tick, setTick] = useState(0);
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [gps, setGps] = useState<GpsState>({ phase: "locating" });
  const [place, setPlace] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  // Optional manual override (State / District / Village). Null = live GPS.
  const [manual, setManual] = useState<ManualPlace | null>(null);

  /* ---- 1. Live GPS acquisition (no static fallback, ever) ---- */
  const acquire = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGps({ phase: "blocked", kind: "unavailable", message: GPS_MESSAGES.unavailable });
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setGps({ phase: "blocked", kind: "insecure", message: GPS_MESSAGES.insecure });
      return;
    }
    setGps({ phase: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGps({ phase: "ready", lat: latitude, lon: longitude, accuracy: accuracy ?? 0, at: Date.now() });
      },
      (err) => {
        const kind = err.code === 1 ? "denied" : err.code === 2 ? "unavailable" : "timeout";
        setGps({ phase: "blocked", kind, message: GPS_MESSAGES[kind] });
      },
      // maximumAge: 0 — never accept a cached fix, the position must be live.
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => { acquire(); }, [acquire]);

  /* ---- 2. Keep the fix live: watch the device while the tab is visible ---- */
  useEffect(() => {
    if (gps.phase !== "ready" || typeof navigator === "undefined" || !navigator.geolocation) return;
    const start = () => {
      if (watchId.current !== null) return;
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setGps((prev) => {
            if (prev.phase === "ready") {
              const moved = distanceM(prev.lat, prev.lon, latitude, longitude);
              if (moved < 250) return prev; // ignore GPS jitter
            }
            return { phase: "ready", lat: latitude, lon: longitude, accuracy: accuracy ?? 0, at: Date.now() };
          });
        },
        () => { /* keep the last live fix; the interval refresh will retry */ },
        { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 },
      );
    };
    const stop = () => {
      if (watchId.current !== null) {
        try { navigator.geolocation.clearWatch(watchId.current); } catch { /* noop */ }
        watchId.current = null;
      }
    };
    const onVis = () => (document.visibilityState === "visible" ? start() : stop());
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); stop(); };
  }, [gps.phase]);

  /* ---- 3. Coordinates in use: manual override wins, else the live fix ---- */
  const coords: { lat: number; lon: number } | null = manual
    ? { lat: manual.lat, lon: manual.lon }
    : gps.phase === "ready"
      ? { lat: gps.lat, lon: gps.lon }
      : null;
  const coordKey = coords ? `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}` : "";

  /* Reverse-geocode the live coordinates → city / district name (never coords) */
  useEffect(() => {
    if (manual || !coords) return;
    let cancelled = false;
    reverseGeocode(coords.lat, coords.lon).then((n) => !cancelled && n && setPlace(n));
    return () => { cancelled = true; };
  }, [manual, coordKey]);

  const placeLabel = manual ? manual.name : (place ?? "Locating your area…");


  /* ---- 4. Fetch weather for the active coordinates — cache bypassed ---- */
  useEffect(() => {
    if (!coords) { setBundle(null); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const b = await fetchWeatherBundle(placeLabel, [coords.lat, coords.lon], { fresh: true });
      if (!cancelled) { setBundle(b); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [coordKey, placeLabel, tick]);


  /* ---- 5. Auto-refresh every 60s while visible; re-acquire GPS too ---- */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setTick((t) => t + 1);
    }, 60 * 1000);
    const onVis = () => { if (document.visibilityState === "visible") setTick((t) => t + 1); };
    document.addEventListener("visibilitychange", onVis);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const refreshNow = () => {
    if (gps.phase === "ready") setTick((t) => t + 1);
    else acquire();
  };

  const kind = bundle
    ? weatherKind(bundle.current.weatherCode, bundle.current.isDay)
    : "clear-day";

  const advisories = bundle ? buildAdvisories(bundle) : [];

  const weatherImage = useMemo(() => {
    if (!bundle) return null;
    const cond = codeToSky(bundle.current.weatherCode);
    return IMAGE_PRESETS.weather(cond);
  }, [bundle]);
  const uv = bundle ? uvCategory(bundle.current.uv) : null;

  // Chart data
  const hourly = bundle?.hourly ?? [];
  const daily = bundle?.daily ?? [];
  const hourlyChart = hourly.map((h) => ({
    t: fmtHour(h.time),
    temp: h.tempC,
    feels: h.feelsLikeC,
    rain: h.precipMm,
    prob: h.precipProb,
  }));
  const dailyChart = daily.map((d) => ({
    d: fmtDay(d.date),
    min: d.tMinC,
    max: d.tMaxC,
    rain: d.precipMm,
  }));
  const historyChart = (bundle?.history ?? []).map((d) => ({
    d: fmtDay(d.date),
    min: d.tMinC,
    max: d.tMaxC,
    rain: d.precipMm,
  }));

  /* ---- GPS gate: no live fix and no manual pick → no weather at all ---- */
  if (!manual && gps.phase !== "ready") {
    return (
      <div>
        <HeroBanner
          image={heroImg}
          eyebrow={`Live · ${ctx.season} · ${ctx.weekday}`}
          title="Weather Intelligence Dashboard"
          description="This dashboard streams only live conditions for your exact GPS position — nothing cached, nothing estimated."
        />
        <section className="mx-auto mt-8 max-w-5xl px-6 pb-24">
          <div className="glass rounded-3xl p-8 text-center">
            <LocateFixed
              className={`mx-auto h-10 w-10 text-primary ${gps.phase === "locating" ? "animate-pulse" : ""}`}
            />
            <h2 className="mt-4 font-display text-2xl font-bold">
              {gps.phase === "locating" ? "Acquiring live GPS fix…" : "Location access required"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {gps.phase === "locating"
                ? "Allow location access when your device asks. Weather is fetched only for your real-time position."
                : gps.message}
            </p>
            {gps.phase === "blocked" && (
              <button
                onClick={acquire}
                className="tap mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
              >
                <RefreshCw className="h-4 w-4" /> Retry live location
              </button>
            )}
            <p className="mt-6 text-xs text-muted-foreground">
              Or pick your place manually below — live weather is then fetched for that exact village / district.
            </p>
          </div>
          <ManualLocationPicker
            active={manual}
            onSelect={setManual}
            onClear={() => setManual(null)}
            defaultOpen
          />
        </section>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-web-bg-midnight font-[Plus Jakarta Sans]">
      <div className="hidden lg:block">
        <WebCinematicBackground />
      </div>
      <HeroBanner
        image={heroImg}
        eyebrow={`Live · ${ctx.season} · ${ctx.weekday}`}
        title="Weather Intelligence Dashboard"
        description="Real-time conditions, hourly & 15-day forecast, air quality, soil metrics and AI-powered agricultural advisories — hyperlocal to your farm."
      />

      {manual ? (
        <div className="web-glass border-web-leaf/10 mx-auto mt-6 flex max-w-5xl flex-wrap items-center gap-3 rounded-[2rem] p-4">
          <MapPin className="h-5 w-5 shrink-0 text-web-gold" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-[Unbounded] text-lg font-black leading-tight text-web-mist uppercase">{placeLabel}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-web-sage">
              Manual location · live weather for this place
            </div>

          </div>
          <button
            onClick={() => setTick((t) => t + 1)}
            disabled={loading}
            className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-web-emerald/20 border border-web-emerald/30 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-web-emerald hover:bg-web-emerald/30 disabled:opacity-60 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Updating…" : "Refresh"}
          </button>
        </div>
      ) : (
        <GpsBar
          place={placeLabel}
          accuracy={gps.phase === "ready" ? gps.accuracy : 0}
          fixedAt={gps.phase === "ready" ? gps.at : Date.now()}
          fetchedAt={bundle?.fetchedAt ?? null}
          busy={loading}
          onRefresh={refreshNow}
        />
      )}

      <div className="px-6">
        <ManualLocationPicker active={manual} onSelect={setManual} onClear={() => setManual(null)} />
      </div>



      {/* HERO CONDITION CARD */}
      <section className="mx-auto mt-6 max-w-7xl px-6">
        <div className="web-glass relative overflow-hidden rounded-[3rem] border-web-leaf/10 shadow-2xl">
          {weatherImage && (
            <div className="absolute inset-0 z-0">
              <img 
                src={weatherImage} 
                alt="Live weather condition" 
                className="h-full w-full object-cover opacity-60 mix-blend-soft-light transition-opacity duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-web-bg-midnight via-web-bg-midnight/60 to-transparent" />
            </div>
          )}
          <WeatherBackground kind={kind} />
          <div className="relative z-10 grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:p-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/85">
                <MapPin className="h-4 w-4" /> {placeLabel}
              </div>
              <div className="mt-2 flex items-start gap-4">
                <div>
                  <div className="font-display text-6xl font-black leading-none text-white drop-shadow md:text-8xl">
                    {bundle?.current.tempC ?? "—"}<span className="text-4xl md:text-5xl">°C</span>
                  </div>
                  <div className="mt-2 text-lg font-medium text-white/90 drop-shadow">
                    {bundle ? codeToSky(bundle.current.weatherCode) : "Loading…"} · Feels like {bundle?.current.feelsLikeC ?? "—"}°
                  </div>
                  <div className="mt-1 text-sm text-white/80">
                    H {daily[0]?.tMaxC ?? "—"}° · L {daily[0]?.tMinC ?? "—"}°
                    {bundle && (
                      <> · Last updated {new Date(bundle.fetchedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</>
                    )}
                  </div>
                </div>
                {bundle && (
                  <WeatherIcon code={bundle.current.weatherCode} isDay={bundle.current.isDay} className="h-24 w-24 drop-shadow-xl" />
                )}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 font-[Plus Jakarta Sans]">
                <MiniStat icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${bundle?.current.humidity ?? "—"}%`} />
                <MiniStat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${bundle?.current.windKph ?? "—"} km/h`} />
                <MiniStat icon={<Gauge className="h-4 w-4" />} label="Pressure" value={`${bundle?.current.pressureHpa ?? "—"} hPa`} />
                <MiniStat icon={<Eye className="h-4 w-4" />} label="Visibility" value={`${bundle?.current.visibilityKm ?? "—"} km`} />
                <MiniStat icon={<Thermometer className="h-4 w-4" />} label="Dew point" value={`${bundle?.current.dewPointC ?? "—"}°`} />
                <MiniStat icon={<CloudRain className="h-4 w-4" />} label="Precip" value={`${bundle?.current.precipMm ?? 0} mm`} />
                <MiniStat icon={<Umbrella className="h-4 w-4" />} label="Cloud" value={`${bundle?.current.cloudPct ?? "—"}%`} />
                <MiniStat icon={<Sun className="h-4 w-4" />} label="UV" value={`${bundle ? bundle.current.uv.toFixed(1) : "—"} ${uv ? `· ${uv.label}` : ""}`} />
              </div>
            </div>
            <div className="grid content-start gap-4">
              <div className="web-glass rounded-3xl p-5 border-web-leaf/10 font-[Plus Jakarta Sans]">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-web-mist">AI Summary</div>
                  <button
                    onClick={() => setTick((t) => t + 1)}
                    className="tap inline-flex items-center gap-1 rounded-full bg-web-emerald/20 px-3 py-1 text-xs font-bold text-web-gold hover:bg-web-emerald/30 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Refresh
                  </button>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-web-sage font-[Instrument Sans]">
                  {bundle
                    ? aiSummary(bundle, ctx.season)
                    : "Fetching your hyperlocal forecast…"}
                </p>
              </div>
              {bundle && (
                <SunPath sunrise={daily[0]?.sunrise ?? ""} sunset={daily[0]?.sunset ?? ""} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GAUGES */}
      {bundle && (
        <section className="mx-auto mt-8 max-w-7xl px-6">
          <div className="grid gap-4 md:grid-cols-4 font-[Plus Jakarta Sans]">
            <div className="web-glass hover-lift rounded-3xl p-5 border-web-leaf/10">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-web-mist">
                <Thermometer className="h-4 w-4 text-rose-400" /> Temperature
              </div>
              <div className="flex justify-center">
                <ArcGauge value={bundle.current.tempC} min={-5} max={50} unit="°C" label="Now" color="#f97316" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Min {daily[0]?.tMinC ?? "—"}°</span>
                <span>Max {daily[0]?.tMaxC ?? "—"}°</span>
              </div>
            </div>
            <div className="glass hover-lift rounded-3xl p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Droplets className="h-4 w-4 text-sky-400" /> Humidity
              </div>
              <div className="flex justify-center">
                <ArcGauge value={bundle.current.humidity} unit="%" label="Rel. humidity" color="#38bdf8" />
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                Dew point {bundle.current.dewPointC}°C
              </div>
            </div>
            <WindCompass deg={bundle.current.windDir} kph={bundle.current.windKph} gust={bundle.current.gustKph} />
            <div className="glass hover-lift rounded-3xl p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Sun className="h-4 w-4 text-amber-300" /> UV Index
              </div>
              <div className="flex justify-center">
                <ArcGauge value={bundle.current.uv} min={0} max={12} unit="UV" label={uv?.label ?? ""} color={uv?.color ?? "#eab308"} />
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                Peak today {daily[0]?.uvMax ?? "—"}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HOURLY FORECAST */}
      {bundle && (
        <section className="mx-auto mt-10 max-w-7xl px-6">
          <Reveal>
            <h2 className="mb-3 font-display text-2xl font-bold">
              Next 24 hours <span className="text-muted-foreground text-sm font-normal">· hourly detail</span>
            </h2>
          </Reveal>
          <div className="glass rounded-3xl p-4">
            <div className="mb-3 overflow-x-auto">
              <div className="flex min-w-max gap-2">
                {hourly.map((h) => (
                  <div key={h.time} className="min-w-[70px] rounded-xl bg-secondary/40 p-2 text-center">
                    <div className="text-[10px] text-muted-foreground">{fmtHour(h.time)}</div>
                    <div className="my-1 flex justify-center">
                      <WeatherIcon code={h.weatherCode} className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-bold">{h.tempC}°</div>
                    <div className="text-[10px] text-sky-300">{h.precipProb}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-56 rounded-2xl bg-secondary/20 p-2">
                <ResponsiveContainer>
                  <AreaChart data={hourlyChart}>
                    <defs>
                      <linearGradient id="tempG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="°" />
                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Area type="monotone" dataKey="temp" stroke="#f97316" fill="url(#tempG)" name="Temp" />
                    <Line type="monotone" dataKey="feels" stroke="#fbbf24" dot={false} name="Feels like" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-56 rounded-2xl bg-secondary/20 p-2">
                <ResponsiveContainer>
                  <BarChart data={hourlyChart}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="rain" fill="#38bdf8" name="Rain (mm)" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="prob" stroke="#c084fc" name="Prob %" dot={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AGRI ADVISORIES */}
      {advisories.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-6">
          <Reveal>
            <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-bold">
              <Sprout className="h-6 w-6 text-primary" /> Agricultural advisories
              <span className="text-sm font-normal text-muted-foreground">· AI + rule-based</span>
            </h2>
          </Reveal>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {advisories.map((a) => (
              <div key={a.id} className={`rounded-2xl border p-4 backdrop-blur-md ${LEVEL_STYLE[a.level]}`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{a.icon}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold">{a.title}</div>
                    <p className="mt-1 text-xs opacity-90">{a.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 15-DAY FORECAST */}
      {bundle && daily.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-6">
          <Reveal>
            <h2 className="mb-3 font-display text-2xl font-bold">
              15-day outlook <span className="text-muted-foreground text-sm font-normal">· min / max / rain</span>
            </h2>
          </Reveal>
          <div className="glass rounded-3xl p-4">
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8">
              {daily.slice(0, 8).map((d) => (
                <div key={d.date} className="hover-lift rounded-2xl bg-secondary/40 p-3 text-center">
                  <div className="text-[11px] text-muted-foreground">{fmtDay(d.date)}</div>
                  <div className="my-2 flex justify-center">
                    <WeatherIcon code={d.weatherCode} className="h-8 w-8" />
                  </div>
                  <div className="text-sm font-bold">
                    <span className="text-rose-300">{d.tMaxC}°</span>
                    <span className="mx-1 text-muted-foreground">/</span>
                    <span className="text-sky-300">{d.tMinC}°</span>
                  </div>
                  <div className="mt-1 text-[10px] text-sky-300">💧 {d.precipMm.toFixed(0)}mm · {d.precipProb}%</div>
                </div>
              ))}
            </div>
            <div className="h-64 rounded-2xl bg-secondary/20 p-2">
              <ResponsiveContainer>
                <AreaChart data={dailyChart}>
                  <defs>
                    <linearGradient id="maxG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="minG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 10 }} unit="°" />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} unit="mm" />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Area yAxisId="l" type="monotone" dataKey="max" stroke="#ef4444" fill="url(#maxG)" name="Max °C" />
                  <Area yAxisId="l" type="monotone" dataKey="min" stroke="#38bdf8" fill="url(#minG)" name="Min °C" />
                  <Bar yAxisId="r" dataKey="rain" fill="#c084fc" name="Rain mm" radius={[3, 3, 0, 0]} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {daily.length > 8 && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                {daily.slice(8, 15).map((d) => (
                  <div key={d.date} className="rounded-xl bg-secondary/30 p-3 text-center text-xs">
                    <div className="text-muted-foreground">{fmtDay(d.date)}</div>
                    <div className="my-1 flex justify-center">
                      <WeatherIcon code={d.weatherCode} className="h-6 w-6" />
                    </div>
                    <div className="font-semibold">
                      <span className="text-rose-300">{d.tMaxC}°</span> / <span className="text-sky-300">{d.tMinC}°</span>
                    </div>
                    <div className="text-[10px] text-sky-300 mt-1">{d.precipMm.toFixed(0)}mm</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* AIR & SOIL */}
      {bundle && (
        <section className="mx-auto mt-10 max-w-7xl px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {bundle.air && <AqiPanel air={bundle.air} />}
            {bundle.soil && (
              <div className="glass hover-lift rounded-3xl p-5 md:col-span-2">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Sprout className="h-4 w-4 text-emerald-400" /> Soil & Farm Metrics
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricTile label="Soil temperature" value={`${bundle.soil.soilTempC.toFixed(1)}°C`} sub="6 cm depth" />
                  <MetricTile
                    label="Soil moisture"
                    value={`${(bundle.soil.soilMoisture * 100).toFixed(0)}%`}
                    sub={bundle.soil.soilMoisture < 0.18 ? "Low — irrigate soon" : bundle.soil.soilMoisture > 0.35 ? "Wet — hold irrigation" : "Adequate"}
                  />
                  <MetricTile
                    label="Evapotranspiration"
                    value={`${bundle.soil.evapotranspirationMm.toFixed(2)} mm/h`}
                    sub="FAO reference ET₀"
                  />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4 text-xs">
                  <MetricTile label="Heat index" value={heatIndex(bundle.current.tempC, bundle.current.humidity) + "°"} sub="Perceived temp" />
                  <MetricTile label="Frost risk" value={bundle.daily.slice(0, 3).some((d) => d.tMinC <= 4) ? "Yes" : "No"} sub="Next 3 days" />
                  <MetricTile label="Fog probability" value={[45, 48].includes(bundle.current.weatherCode) ? "Active" : "Low"} sub="Now" />
                  <MetricTile
                    label="Storm risk"
                    value={bundle.hourly.some((h) => [95, 96, 99].includes(h.weatherCode)) ? "Elevated" : "Low"}
                    sub="Next 24h"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* HISTORY */}
      {historyChart.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-6">
          <Reveal>
            <h2 className="mb-3 font-display text-2xl font-bold">
              Past 7 days <span className="text-muted-foreground text-sm font-normal">· climate history</span>
            </h2>
          </Reveal>
          <div className="glass h-64 rounded-3xl p-4">
            <ResponsiveContainer>
              <LineChart data={historyChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} unit="°" />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} unit="mm" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Line yAxisId="l" type="monotone" dataKey="max" stroke="#ef4444" name="Max °C" />
                <Line yAxisId="l" type="monotone" dataKey="min" stroke="#38bdf8" name="Min °C" />
                <Bar yAxisId="r" dataKey="rain" fill="#c084fc" name="Rain mm" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* LIVE SOURCE FOOTER */}
      <section className="mx-auto mt-12 max-w-7xl px-6 pb-16">
        <p className="text-center text-xs text-muted-foreground">
          Weather © Open-Meteo · Air quality © CAMS · Streamed live for your current
          location{placeLabel && place ? ` — ${placeLabel}` : ""} ·
          Auto-refresh every 60s · No cached or estimated values.

        </p>
      </section>


      {loading && !bundle && (
        <div className="fixed inset-x-0 bottom-6 mx-auto w-max rounded-full bg-primary/90 px-4 py-2 text-xs font-medium text-primary-foreground shadow-lg">
          Loading live forecast…
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Small helpers ----------------------------- */

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/80">
        {icon} {label}
      </div>
      <div className="mt-1 text-lg font-bold text-white drop-shadow">{value}</div>
    </div>
  );
}

function MetricTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-secondary/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function heatIndex(tC: number, rh: number) {
  // NWS heat index approximation, °C
  const T = (tC * 9) / 5 + 32;
  const HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * rh -
    0.22475541 * T * rh -
    6.83783e-3 * T * T -
    5.481717e-2 * rh * rh +
    1.22874e-3 * T * T * rh +
    8.5282e-4 * T * rh * rh -
    1.99e-6 * T * T * rh * rh;
  const c = ((HI - 32) * 5) / 9;
  return Math.round(Math.max(tC, c));
}

function aiSummary(b: WeatherBundle, season: string): string {
  const rain24 = b.hourly.reduce((s, h) => s + h.precipMm, 0);
  const prob = b.hourly.reduce((m, h) => Math.max(m, h.precipProb), 0);
  const windMax = b.hourly.reduce((m, h) => Math.max(m, h.windKph), 0);
  const skyTxt = codeToSky(b.current.weatherCode);
  const parts: string[] = [];
  parts.push(
    `${skyTxt} at ${b.current.tempC}°C, feels ${b.current.feelsLikeC}°C — ${season} conditions.`,
  );
  if (rain24 >= 1) {
    parts.push(`Expect about ${rain24.toFixed(1)} mm rain in the next 24h (peak probability ${prob}%).`);
  } else {
    parts.push(`Little to no rain in the next 24h; humidity ${b.current.humidity}%.`);
  }
  if (windMax >= 25) parts.push(`Winds gusting to ${windMax} km/h — expect drift during spraying.`);
  if (b.current.uv >= 8) parts.push(`UV very high (${b.current.uv.toFixed(1)}) — schedule field work before 10 AM or after 4 PM.`);
  if (b.soil && b.soil.soilMoisture < 0.2) parts.push(`Root-zone moisture low; consider a light irrigation.`);
  if (b.daily[0] && b.daily[0].tMaxC >= 38) parts.push(`Heat stress likely — provide shade and cool water for livestock.`);
  return parts.join(" ");
}
