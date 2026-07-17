import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useLocation } from "@/lib/location-store";
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

const forecast = [
  { day: "Mon", temp: 28, rain: 4 },
  { day: "Tue", temp: 30, rain: 0 },
  { day: "Wed", temp: 29, rain: 12 },
  { day: "Thu", temp: 27, rain: 22 },
  { day: "Fri", temp: 26, rain: 8 },
  { day: "Sat", temp: 28, rain: 0 },
  { day: "Sun", temp: 30, rain: 0 },
];

function Weather() {
  const loc = useLocation();
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Live</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">Weather · {loc.district}</h1>
        <p className="mt-3 text-muted-foreground">Season alerts and 7-day outlook to plan irrigation and sprays.</p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Stat icon={<Thermometer />} label="Temperature" value="28°C" tag="feels 30°" wide />
        <Stat icon={<Cloud />} label="Sky" value="Partly cloudy" />
        <Stat icon={<Droplets />} label="Humidity" value="72%" />
        <Stat icon={<Wind />} label="Wind" value="12 km/h SW" />
        <Stat icon={<Sunrise />} label="Sunrise" value="06:12" />
        <Stat icon={<Sunset />} label="Sunset" value="18:34" />
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
        <div className="text-xs font-semibold uppercase tracking-widest text-accent">Season alert</div>
        <p className="mt-2 text-sm">Monsoon active. Expect intermittent rain Wed–Fri. Delay urea top-dress by 3 days to prevent leaching.</p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tag, wide }: { icon: React.ReactNode; label: string; value: string; tag?: string; wide?: boolean }) {
  return (
    <div className={`glass hover-lift rounded-2xl p-5 ${wide ? "lg:col-span-1" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">{icon}</div>
        {tag && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{tag}</span>}
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-semibold">{value}</div>
    </div>
  );
}
