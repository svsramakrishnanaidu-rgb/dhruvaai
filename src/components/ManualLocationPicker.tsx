import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, MapPin, Search, X } from "lucide-react";

/** A manually picked place (optional alternative to live GPS). */
export type ManualPlace = {
  name: string;
  lat: number;
  lon: number;
  state: string;
  district?: string;
  village?: string;
};

type GeoHit = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  country_code?: string;
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

/** Free geocoding search (Open-Meteo) restricted to India. */
async function searchIndia(query: string): Promise<GeoHit[]> {
  if (query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim(),
      )}&count=25&language=en&format=json&countryCode=IN`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: GeoHit[] };
    return (json.results ?? []).filter((r) => (r.country_code ?? "IN") === "IN");
  } catch {
    return [];
  }
}

function norm(s?: string) {
  return (s ?? "").toLowerCase().replace(/\s+district$/, "").trim();
}

/** Debounced geo search hook. */
function useGeoSearch(query: string, enabled: boolean) {
  const [hits, setHits] = useState<GeoHit[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!enabled || query.trim().length < 2) {
      setHits([]);
      setBusy(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    const id = window.setTimeout(async () => {
      const r = await searchIndia(query);
      if (!cancelled) {
        setHits(r);
        setBusy(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [query, enabled]);
  return { hits, busy };
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-web-gold">
          {label}
        </label>
        {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-web-leaf/10 bg-web-bg-midnight/40 px-3 py-2.5 text-xs font-bold text-web-mist outline-none placeholder:text-web-sage/50 focus:border-web-emerald/50 transition-all";

/**
 * Optional State → District → Village selector.
 * GPS stays the default source; this is a manual override for users who
 * cannot (or don't want to) share live location.
 */
export function ManualLocationPicker({
  active,
  onSelect,
  onClear,
  defaultOpen = false,
  variant = "default",
}: {
  active: ManualPlace | null;
  onSelect: (p: ManualPlace) => void;
  onClear: () => void;
  defaultOpen?: boolean;
  variant?: "default" | "atlas";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [state, setState] = useState(active?.state ?? "");
  const [districtQ, setDistrictQ] = useState(active?.district ?? "");
  const [district, setDistrict] = useState<GeoHit | null>(null);
  const [villageQ, setVillageQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const { hits: dHits, busy: dBusy } = useGeoSearch(districtQ, !!state && !district);
  const { hits: vHits, busy: vBusy } = useGeoSearch(villageQ, !!state);

  const districtResults = useMemo(
    () => dHits.filter((h) => !state || norm(h.admin1) === norm(state)).slice(0, 12),
    [dHits, state],
  );

  const villageResults = useMemo(
    () =>
      vHits
        .filter((h) => !state || norm(h.admin1) === norm(state))
        .filter((h) => !district || norm(h.admin2) === norm(district.name) || norm(h.admin2) === norm(district.admin2))
        .slice(0, 12),
    [vHits, state, district],
  );

  const pickDistrict = (h: GeoHit) => {
    setDistrict(h);
    setDistrictQ(h.name);
    onSelect({
      name: [h.name, h.admin1].filter(Boolean).join(", "),
      lat: h.latitude,
      lon: h.longitude,
      state: h.admin1 ?? state,
      district: h.name,
    });
  };

  const pickVillage = (h: GeoHit) => {
    setVillageQ(h.name);
    onSelect({
      name: [h.name, h.admin2 ?? district?.name, h.admin1].filter(Boolean).join(", "),
      lat: h.latitude,
      lon: h.longitude,
      state: h.admin1 ?? state,
      district: h.admin2 ?? district?.name,
      village: h.name,
    });
  };

  const reset = () => {
    setState("");
    setDistrict(null);
    setDistrictQ("");
    setVillageQ("");
    onClear();
  };

  return (
    <div ref={rootRef} className={`${variant === 'atlas' ? 'bg-transparent' : 'web-glass border-web-leaf/10 mx-auto mt-3 max-w-5xl'} rounded-3xl font-[Plus Jakarta Sans]`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`tap flex w-full items-center gap-3 rounded-3xl ${variant === 'atlas' ? 'px-0' : 'px-4 py-3'} text-left`}
        aria-expanded={open}
      >
        <MapPin className="h-4 w-4 shrink-0 text-web-gold" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black text-web-mist uppercase tracking-tight">
            {active ? active.name : "Choose location manually"}
          </div>
          <div className="text-[10px] font-bold text-web-sage uppercase tracking-widest">
            {active ? "Manual override active · GPS paused" : "Optional · State / District / Village"}
          </div>
        </div>
        {active && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                reset();
              }
            }}
            className="tap inline-flex items-center gap-1 rounded-full bg-web-emerald/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-web-gold hover:bg-web-emerald/30 transition-all"
          >
            <X className="h-3 w-3" /> Use GPS
          </span>
        )}
        <ChevronDown className={`h-4 w-4 text-web-sage transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid gap-4 border-t border-web-leaf/10 p-4 md:grid-cols-3 bg-web-bg-midnight/20">
          {/* STATE */}
          <Field label="State">
            <div className="relative">
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setDistrict(null);
                  setDistrictQ("");
                  setVillageQ("");
                }}
                className={`${inputCls} appearance-none pr-8`}
              >
                <option value="">Select state…</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </Field>

          {/* DISTRICT */}
          <Field label="District" hint="type to search">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={districtQ}
                disabled={!state}
                placeholder={state ? "e.g. Guntur" : "Pick a state first"}
                onChange={(e) => {
                  setDistrictQ(e.target.value);
                  setDistrict(null);
                }}
                className={`${inputCls} pl-9 disabled:opacity-50`}
              />
              {dBusy && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
            </div>
            {!district && districtResults.length > 0 && (
              <ul className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-web-leaf/10 bg-web-bg-midnight/95 p-1 backdrop-blur-xl">
                {districtResults.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => pickDistrict(h)}
                      className="tap w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary/70"
                    >
                      <span className="font-medium">{h.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {[h.admin2, h.admin1].filter(Boolean).join(" · ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          {/* VILLAGE */}
          <Field label="Village / Mandal" hint="optional">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={villageQ}
                disabled={!state}
                placeholder={state ? "e.g. Tenali" : "Pick a state first"}
                onChange={(e) => setVillageQ(e.target.value)}
                className={`${inputCls} pl-9 disabled:opacity-50`}
              />
              {vBusy && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
            </div>
            {villageResults.length > 0 && (
              <ul className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-border/50 bg-background/95 p-1">
                {villageResults.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => pickVillage(h)}
                      className="tap w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary/70"
                    >
                      <span className="font-medium">{h.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {[h.admin2, h.admin1].filter(Boolean).join(" · ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Field>
        </div>
      )}
    </div>
  );
}
