import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { STATES, locationStore, useLocation } from "@/lib/location-store";
import { AP_DISTRICTS, AP_REGIONS } from "@/data/ap-districts";
import { Reveal } from "@/components/Reveal";
import { MapPin, Check, Sprout } from "lucide-react";

export const Route = createFileRoute("/districts/")({
  head: () => ({
    meta: [
      { title: "Districts — Krish Sense" },
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
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Location</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">District Explorer</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          All 26 Andhra Pradesh districts, each with its own crop gallery. Click any district card to open a full,
          filterable dossier of every crop cultivated there.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="card-elegant p-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">State</div>
          <div className="mt-2 space-y-1">
            {Object.keys(STATES).map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                  state === s ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                {s}
                {state === s && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>

          {isAP && (
            <>
              <div className="mt-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Region</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(["All", ...AP_REGIONS] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      region === r ? "bg-primary text-primary-foreground" : "border border-border/60 text-muted-foreground hover:text-foreground"
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
                    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 transition ${
                      active ? "border-primary bg-primary/10" : "border-border/60 bg-card/40 hover:border-primary/50 hover-lift"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{d.name}</span>
                      </div>
                      <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {d.region}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">HQ · {d.headquarters}</div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {d.crops.slice(0, 5).map((slug) => (
                        <span key={slug} className="rounded-full bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          {slug}
                        </span>
                      ))}
                      {d.crops.length > 5 && (
                        <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                          +{d.crops.length - 5}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto pt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                      <Sprout className="h-3.5 w-3.5" /> Open crop gallery →
                    </div>
                    {active && (
                      <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
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
