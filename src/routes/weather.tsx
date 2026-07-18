import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from "react";
import { useLocation } from "@/lib/location-store";
import { profileFor } from "@/lib/district-profiles";
import { Reveal } from "@/components/Reveal";
import { Cloud, Droplets, Wind, Sunrise, Sunset, Thermometer } from "lucide-react";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather — KrishiSense" },
      { name: "description", content: "District-aware weather forecast and season alerts for farm planning." },
    ],
  }),
  component: Weather,
});

// Deterministic pseudo-random from district name so the 7-day forecast is stable
// per district and changes instantly when the district changes.
function seededForecast(district: string, baseTemp: number, baseRainMm: number) {
  let seed = 0;
  for (const c of district) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    temp: Math.round(baseTemp - 2 + rand() * 6),
    rain: Math.max(0, Math.round((baseRainMm / 40) * (rand() * 2 - 0.3))),
  }));
}

function Weather() {
  const loc = useLocation();
  const p = profileFor(loc.district);
  const forecast = useMemo(() => seededForecast(loc.district, p.tempC, p.rainfallYtdMm), [loc.district, p.tempC, p.rainfallYtdMm]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Live · {p.state}</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">Weather · {loc.district}</h1>
        <p className="mt-3 text-muted-foreground">{p.climate} · {p.season}. Season alerts and 7-day outlook to plan irrigation and sprays.</p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Stat icon={<Thermometer />} label="Temperature" value={`${p.tempC}°C`} tag={`feels ${p.tempC + 2}°`} />
        <Stat icon={<Cloud />} label="Sky" value={p.sky} />
        <Stat icon={<Droplets />} label="Humidity" value={`${p.humidity}%`} />
        <Stat icon={<Wind />} label="Wind" value={`${p.windKmh} km/h`} />
        <Stat icon={<Sunrise />} label="Sunrise" value={p.sunrise} />
        <Stat icon={<Sunset />} label="Sunset" value={p.sunset} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Rainfall YTD" value={`${p.rainfallYtdMm} mm`} tag={`${p.rainfallDeltaPct >= 0 ? "+" : ""}${p.rainfallDeltaPct}% vs avg`} />
        <MetricCard label="Soil" value={p.soil} tag={`pH ${p.soilPh}`} />
        <MetricCard label="Season" value={p.season} tag="Local calendar" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card-elegant p-6">
          <h2 className="font-display text-2xl font-bold">Temperature — 7 day</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--sunrise)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--sunrise)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area dataKey="temp" stroke="var(--sunrise)" strokeWidth={3} fill="url(#tg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-elegant p-6">
          <h2 className="font-display text-2xl font-bold">Rainfall (mm)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--sky)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--sky)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area dataKey="rain" stroke="var(--sky)" strokeWidth={3} fill="url(#rg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-accent/40 bg-accent/10 p-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-accent">Season alert · {loc.district}</div>
        <p className="mt-2 text-sm">{p.seasonAlert}</p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tag }: { icon: React.ReactNode; label: string; value: string; tag?: string }) {
  return (
    <div className="glass hover-lift rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">{icon}</div>
        {tag && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{tag}</span>}
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold">{value}</div>
    </div>
  );
}

function MetricCard({ label, value, tag }: { label: string; value: string; tag: string }) {
  return (
    <div className="card-elegant p-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-primary">{tag}</div>
    </div>
  );
}
