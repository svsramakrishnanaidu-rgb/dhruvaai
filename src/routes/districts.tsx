import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { STATES, locationStore, useLocation } from "@/lib/location-store";
import { Reveal } from "@/components/Reveal";
import { MapPin, Check } from "lucide-react";

export const Route = createFileRoute("/districts")({
  head: () => ({
    meta: [
      { title: "Districts — KrishiSense" },
      { name: "description", content: "Set your state and district to personalize crops, weather and prices." },
    ],
  }),
  component: Districts,
});

function Districts() {
  const loc = useLocation();
  const [state, setState] = useState(loc.state);
  const districts = STATES[state] ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Location</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">Your District</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Choose your state and district — every module reacts instantly, no reload.</p>
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
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((d, i) => {
            const active = loc.district === d && loc.state === state;
            return (
              <Reveal key={d} delay={i * 30}>
                <button
                  onClick={() => locationStore.set({ state, district: d })}
                  className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition ${
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
      </div>
    </div>
  );
}
