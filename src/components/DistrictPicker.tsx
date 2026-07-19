"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, Check } from "lucide-react";
import { STATES, locationStore, useLocation } from "@/lib/location-store";
import { useT } from "@/lib/i18n";

/**
 * Global district picker rendered in the navbar. Setting a district updates
 * the shared `locationStore`, which every downstream module (Weather, Market,
 * Fertilizer, Rotation, Schemes, Diseases, Home, Analytics) subscribes to via
 * `useLocation()` / `useSyncExternalStore` — so the whole app reacts instantly.
 */
export function DistrictPicker() {
  const loc = useLocation();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(loc.state);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setState(loc.state), [loc.state]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const districts = STATES[state] ?? [];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-medium hover:border-primary/60"
        aria-label={t("aria.changeDistrict")}
        aria-expanded={open}
      >
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span className="max-w-[140px] truncate">{loc.district}</span>
        <span className="hidden text-muted-foreground sm:inline">· {loc.state}</span>
        <ChevronDown className="h-3 w-3 opacity-70" />
      </button>

      {open && (
        <div
          className="glass absolute right-0 top-full z-50 mt-2 w-[min(92vw,520px)] overflow-hidden rounded-2xl p-3 shadow-2xl"
          style={{ animation: "scale-in .2s var(--ease-out-expo) both" }}
        >
          <div className="grid grid-cols-[160px_1fr] gap-2">
            <div className="max-h-[320px] overflow-y-auto pr-1">
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">State</div>
              {Object.keys(STATES).map((s) => (
                <button
                  key={s}
                  onClick={() => setState(s)}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition ${
                    state === s ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span className="truncate text-left">{s}</span>
                  {state === s && <Check className="h-3 w-3 text-primary" />}
                </button>
              ))}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">District</div>
              <div className="grid grid-cols-2 gap-1">
                {districts.map((d) => {
                  const active = loc.state === state && loc.district === d;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        locationStore.set({ state, district: d });
                        setOpen(false);
                      }}
                      className={`truncate rounded-lg px-2 py-1.5 text-left text-xs transition ${
                        active
                          ? "bg-primary/20 text-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
