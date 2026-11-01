import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { STATES, locationStore, useLocation } from "@/lib/location-store";
import { AP_DISTRICTS, AP_REGIONS } from "@/data/ap-districts";
import { Reveal } from "@/components/Reveal";
import { MapPin, Check, Sprout } from "lucide-react";

export const Route = createFileRoute("/districts/")({
  head: () => ({
    meta: [
      { title: "Districts — DHRUVA" },
      { name: "description", content: "Browse crops district-by-district across Andhra Pradesh. Every module reacts instantly to your selection." },
    ],
  }),
  component: Districts,
});

function Districts() {
  const loc = useLocation();
  const [state, setState] = useState(loc.state);
  const [region, setRegion] = useState<"All" | "Coastal" | "Rayalaseema" | "Uttarandhra">("All");

  const isAP = state === "Andhra Pradesh";
  const apFiltered = useMemo(
    () => (region === "All" ? AP_DISTRICTS : AP_DISTRICTS.filter((d) => d.region === region)),
    [region],
  );
  const districts = STATES[state] ?? [];

  return (
    <div className="relative min-h-screen bg-web-bg-midnight font-[Plus Jakarta Sans] mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-web-emerald">Location</span>
        <h1 className="mt-2 font-[Unbounded] text-5xl font-black tracking-tight text-web-mist md:text-7xl">District Explorer</h1>
        <p className="mt-4 max-w-2xl text-[11px] font-bold uppercase tracking-widest text-web-sage leading-relaxed opacity-80">
          All 26 Andhra Pradesh districts, each with its own crop gallery. Click any district card to open a full,
          filterable dossier of every crop cultivated there.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="web-glass p-6 border-web-leaf/10 h-fit sticky top-24">
          <div className="text-[10px] font-black uppercase tracking-widest text-web-gold">State Selector</div>
          <div className="mt-4 space-y-1">
            {Object.keys(STATES).map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  state === s ? "bg-web-emerald/20 text-web-mist" : "text-web-sage hover:bg-web-emerald/10 hover:text-web-gold"
                }`}
              >
                {s}
                {state === s && <Check className="h-3.5 w-3.5 text-web-gold" />}
              </button>
            ))}
          </div>

          {isAP && (
            <>
              <div className="mt-8 text-[10px] font-black uppercase tracking-widest text-web-gold">Region Filter</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(["All", ...AP_REGIONS] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      region === r ? "bg-web-emerald text-web-mist shadow-lg shadow-web-emerald/20" : "border border-web-leaf/20 bg-web-bg-midnight/40 text-web-sage hover:bg-web-emerald/10 hover:text-web-gold"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {isAP ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apFiltered.map((d, i) => {
              const active = loc.district === d.name && loc.state === "Andhra Pradesh";
              return (
                <Reveal key={d.slug} delay={i * 25}>
                  <Link
                    to="/districts/$slug"
                    params={{ slug: d.slug }}
                    onClick={() => locationStore.set({ state: "Andhra Pradesh", district: d.name })}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border p-6 transition-all duration-500 ${
                      active ? "border-web-emerald bg-web-emerald/10" : "web-glass border-web-leaf/10 hover:border-web-emerald/30 hover:-translate-y-2 hover:shadow-2xl"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-web-gold" />
                        <span className="font-[Unbounded] font-black text-web-mist uppercase tracking-tight">{d.name}</span>
                      </div>
                      <span className="rounded-full border border-web-leaf/20 bg-web-bg-midnight/40 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-web-emerald">
                        {d.region}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-web-sage opacity-70">HQ · {d.headquarters}</div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {d.crops.slice(0, 5).map((slug) => (
                        <span key={slug} className="rounded-full border border-web-leaf/20 bg-web-bg-midnight/60 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-web-sage">
                          {slug}
                        </span>
                      ))}
                      {d.crops.length > 5 && (
                        <span className="rounded-full bg-web-emerald/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-web-emerald">
                          +{d.crops.length - 5}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto pt-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-web-gold group-hover:gap-2.5 transition-all">
                      <Sprout className="h-4 w-4" /> Open crop gallery →
                    </div>
                    {active && (
                        <span className="absolute right-4 top-4 rounded-full bg-web-gold px-3 py-1 text-[9px] font-black uppercase tracking-widest text-web-bg-midnight shadow-lg shadow-web-gold/20">
                          Active
                        </span>
                    )}
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {districts.map((d, i) => {
              const active = loc.district === d && loc.state === state;
              return (
                <Reveal key={d} delay={i * 25}>
                  <button
                    onClick={() => locationStore.set({ state, district: d })}
                    className={`relative w-full overflow-hidden rounded-2xl border p-5 text-left transition ${
                      active ? "border-primary bg-primary/10" : "border-border/60 bg-card/40 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{d}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{state}</div>
                    {active && (
                      <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Active
                      </span>
                    )}
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
