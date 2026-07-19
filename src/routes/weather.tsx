import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { HeroBanner } from "@/components/HeroBanner";
import { Reveal } from "@/components/Reveal";
import { useLocation } from "@/lib/location-store";
import { fetchLiveWeather, nowContext, type LiveWeather } from "@/lib/live-weather";
import { Cloud, CloudRain, Droplets, Sun, Thermometer, Wind, RefreshCw, MapPin } from "lucide-react";
import heroImg from "@/assets/heroes/weather.jpg";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Live Weather — KrishiSense" },
      { name: "description", content: "Live agricultural weather across major Indian farming districts, auto-refreshed from Open-Meteo." },
    ],
  }),
  component: WeatherPage,
});

const REGIONS: { label: string; districts: string[] }[] = [
  { label: "Andhra & Telangana", districts: ["Guntur", "Krishna", "Visakhapatnam", "Anantapur", "Kurnool", "Hyderabad", "Warangal", "Nizamabad"] },
  { label: "North India", districts: ["Ludhiana", "Amritsar", "Karnal", "Hisar", "Meerut", "Lucknow", "Varanasi", "Jaipur"] },
  { label: "West India", districts: ["Pune", "Nashik", "Nagpur", "Ahmedabad", "Rajkot", "Bhopal", "Indore", "Jodhpur"] },
  { label: "South & East", districts: ["Bengaluru", "Mysuru", "Coimbatore", "Madurai", "Chennai", "Kochi", "Kolkata", "Patna"] },
];

function skyIcon(code: number) {
  if (code === 0 || code === 1) return Sun;
  if ([2, 3, 45, 48].includes(code)) return Cloud;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return CloudRain;
  return Cloud;
}

function WeatherCard({ w, primary = false }: { w: LiveWeather; primary?: boolean }) {
  const Icon = skyIcon(w.weatherCode);
  return (
    <div
      className={`glass hover-lift relative overflow-hidden rounded-3xl p-5 ${
        primary ? "ring-1 ring-primary/40" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" aria-hidden />
          <span className="font-medium text-foreground">{w.district}</span>
        </div>
        <Icon className="h-8 w-8 text-primary" aria-hidden />
      </div>
      <div className="mt-3 flex items-end gap-2">
        <div className="font-display text-5xl font-black tracking-tight">{w.tempC}°</div>
        <div className="mb-2 text-sm text-muted-foreground">{w.sky}</div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl bg-secondary/50 p-2">
          <Droplets className="mx-auto mb-1 h-4 w-4 text-primary" aria-hidden />
          <div className="text-center font-semibold">{w.humidity}%</div>
          <div className="text-center text-[10px] text-muted-foreground">Humidity</div>
        </div>
        <div className="rounded-xl bg-secondary/50 p-2">
          <Wind className="mx-auto mb-1 h-4 w-4 text-primary" aria-hidden />
          <div className="text-center font-semibold">{w.windKph}</div>
          <div className="text-center text-[10px] text-muted-foreground">km/h</div>
        </div>
        <div className="rounded-xl bg-secondary/50 p-2">
          <CloudRain className="mx-auto mb-1 h-4 w-4 text-primary" aria-hidden />
          <div className="text-center font-semibold">{w.precipMm}</div>
          <div className="text-center text-[10px] text-muted-foreground">mm</div>
        </div>
      </div>
    </div>
  );
}

function useLiveWeather(districts: string[], tick: number) {
  const [map, setMap] = useState<Record<string, LiveWeather | null>>({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        districts.map(async (d) => [d, await fetchLiveWeather(d)] as const),
      );
      if (!cancelled) {
        const next: Record<string, LiveWeather | null> = {};
        for (const [d, w] of entries) next[d] = w;
        setMap(next);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [districts.join("|"), tick]);
  return map;
}

function WeatherPage() {
  const loc = useLocation();
  const ctx = useMemo(() => nowContext(), []);
  const [tick, setTick] = useState(0);

  // Refresh all cards every 5 minutes.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const primary = useLiveWeather([loc.district], tick)[loc.district];
  const all = useLiveWeather(
    Array.from(new Set(REGIONS.flatMap((r) => r.districts))),
    tick,
  );

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow={`Live · ${ctx.season} · ${ctx.weekday}`}
        title="Live Weather Report"
        description={`Auto-refreshed conditions from Open-Meteo across major Indian farming districts. Your district: ${loc.district}.`}
      />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Reveal>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Your district</h2>
              <p className="text-sm text-muted-foreground">
                Change your location from the top bar to update this card and everything on the site.
              </p>
            </div>
            <button
              onClick={() => setTick((t) => t + 1)}
              className="tap inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-4 py-2 text-sm font-medium hover:bg-secondary"
              aria-label="Refresh weather"
            >
              <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
            </button>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {primary ? (
            <div className="lg:col-span-3">
              <WeatherCard w={primary} primary />
            </div>
          ) : (
            <SkeletonCard />
          )}
        </div>

        {REGIONS.map((region) => (
          <div key={region.label} className="mt-12">
            <Reveal>
              <h3 className="mb-4 font-display text-xl font-bold">
                <span className="text-gradient">{region.label}</span>
              </h3>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {region.districts.map((d) =>
                all[d] ? <WeatherCard key={d} w={all[d]!} /> : <SkeletonCard key={d} label={d} />,
              )}
            </div>
          </div>
        ))}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Data © Open-Meteo. Cached 15 min per district, page auto-refreshes every 5 min.
        </p>
      </section>
    </div>
  );
}

function SkeletonCard({ label }: { label?: string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" aria-hidden />
          <span>{label ?? "Loading…"}</span>
        </div>
        <Thermometer className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <div className="mt-4 h-12 w-24 animate-pulse rounded bg-secondary/60" />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary/60" />
        ))}
      </div>
    </div>
  );
}
