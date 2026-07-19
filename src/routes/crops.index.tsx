import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CROP_LIST, CROP_CATEGORIES, categoryOf, cropsForDistrict } from "@/data/crops";
import type { CropCategory } from "@/data/crops/types";
import { CropCard } from "@/components/CropCard";
import { Reveal } from "@/components/Reveal";
import { useLocation, STATES } from "@/lib/location-store";
import { useT } from "@/lib/i18n";
import { MapPin, Filter, X } from "lucide-react";

export const Route = createFileRoute("/crops/")({
  head: () => ({
    meta: [
      { title: "Crop Library — KrishiSense" },
      { name: "description", content: "The full crop encyclopaedia: filter by district, category, season, water, soil and profitability." },
    ],
  }),
  component: CropLibrary,
});

const SEASONS = ["All", "Kharif", "Rabi", "Perennial"] as const;
const WATER = ["All", "Low", "Medium", "High"] as const;
const SOIL_KEYS = ["All", "Alluvium", "Black cotton", "Red loam", "Sandy loam", "Laterite"] as const;
const DURATION = ["All", "≤90 d", "91–150 d", "150+ d"] as const;
const PROFIT = ["All", "≥30%", "≥45%", "≥60%"] as const;

function matchSoil(soilType: string, key: string): boolean {
  const s = soilType.toLowerCase();
  switch (key) {
    case "All": return true;
    case "Alluvium": return s.includes("alluv") || s.includes("delta") || s.includes("river");
    case "Black cotton": return s.includes("black");
    case "Red loam": return s.includes("red");
    case "Sandy loam": return s.includes("sandy") || s.includes("loam");
    case "Laterite": return s.includes("laterite");
    default: return true;
  }
}

function matchDuration(days: number | undefined, key: string): boolean {
  if (key === "All" || !days) return key === "All";
  if (key === "≤90 d") return days <= 90;
  if (key === "91–150 d") return days > 90 && days <= 150;
  return days > 150;
}

function matchProfit(pct: number, key: string): boolean {
  if (key === "All") return true;
  if (key === "≥30%") return pct >= 30;
  if (key === "≥45%") return pct >= 45;
  return pct >= 60;
}

function CropLibrary() {
  const t = useT();
  const loc = useLocation();
  const allDistricts = useMemo(() => ["All", ...Object.values(STATES).flat()], []);
  const [season, setSeason] = useState<string>("All");
  const [water, setWater] = useState<string>("All");
  const [district, setDistrict] = useState<string>(loc.district || "All");
  const [category, setCategory] = useState<CropCategory | "All">("All");
  const [soil, setSoil] = useState<string>("All");
  const [duration, setDuration] = useState<string>("All");
  const [profit, setProfit] = useState<string>("All");
  const [tag, setTag] = useState<string>("All");
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const c of CROP_LIST) (c.tags ?? []).forEach((t) => s.add(t));
    return ["All", ...Array.from(s).sort()];
  }, []);

  const localCrops = useMemo(() => cropsForDistrict(loc.district), [loc.district]);

  const filtered = useMemo(() => {
    return CROP_LIST.filter((c) => {
      if (season !== "All") {
        if (season === "Perennial") {
          if (!(c.slug === "banana" || c.slug === "mango" || c.slug === "sugarcane")) return false;
        } else if (!c.season.toLowerCase().includes(season.toLowerCase())) return false;
      }
      if (water !== "All" && c.waterNeed !== water) return false;
      if (district !== "All" && !c.suitableDistricts.some((d) => d.toLowerCase() === district.toLowerCase())) return false;
      if (category !== "All" && categoryOf(c) !== category) return false;
      if (!matchSoil(c.soilType, soil)) return false;
      if (!matchDuration(c.durationDays, duration)) return false;
      if (!matchProfit(c.profitPct, profit)) return false;
      if (tag !== "All" && !(c.tags ?? []).includes(tag)) return false;
      if (q && !`${c.name} ${c.scientificName} ${c.description ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [season, water, district, category, soil, duration, profit, tag, q]);

  const activeCount = [season, water, category, soil, duration, profit, tag]
    .filter((v) => v !== "All").length + (district !== "All" ? 1 : 0);

  const reset = () => {
    setSeason("All"); setWater("All"); setDistrict("All"); setCategory("All");
    setSoil("All"); setDuration("All"); setProfit("All"); setTag("All"); setQ("");
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("lib.eyebrow")}</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">{t("lib.title")}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("lib.sub")}</p>
      </Reveal>

      {localCrops.length > 0 && district === "All" && (
        <Reveal>
          <div className="mt-10 rounded-3xl border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <MapPin className="h-4 w-4" /> {t("lib.recommended")} {loc.district}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {localCrops.length} {t("lib.recSub")}
            </p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {localCrops.slice(0, 4).map((c, i) => (
                <CropCard key={c.slug} crop={c} index={i} />
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("lib.searchPh")}
          aria-label={t("lib.searchPh")}
          className="flex-1 min-w-[240px] rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm hover:border-primary"
        >
          <Filter className="h-4 w-4" /> {t("lib.filters")}
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">{activeCount}</span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={reset} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" /> {t("lib.reset")}
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-3xl border border-white/10 bg-black/70 p-4 shadow-2xl backdrop-blur-xl md:grid-cols-2 lg:grid-cols-3">
          <Select label={t("filter.district")} value={district} onChange={setDistrict} options={allDistricts} tKey={(v) => (v === "All" ? t("opt.All") : v)} />
          <Select label={t("filter.category")} value={category} onChange={(v) => setCategory(v as any)} options={["All", ...CROP_CATEGORIES]} tKey={(v) => (v === "All" ? t("opt.All") : v)} />
          <Select label={t("filter.season")} value={season} onChange={setSeason} options={SEASONS as unknown as string[]} tKey={(v) => t(`opt.${v}`) || v} />
          <Select label={t("filter.water")} value={water} onChange={setWater} options={WATER as unknown as string[]} tKey={(v) => t(`opt.${v}`) || v} />
          <Select label={t("filter.soil")} value={soil} onChange={setSoil} options={SOIL_KEYS as unknown as string[]} tKey={(v) => {
            const key = v === "Black cotton" ? "opt.BlackCotton" : v === "Red loam" ? "opt.RedLoam" : v === "Sandy loam" ? "opt.SandyLoam" : `opt.${v}`;
            return t(key) || v;
          }} />
          <Select label={t("filter.duration")} value={duration} onChange={setDuration} options={DURATION as unknown as string[]} tKey={(v) => {
            const key = v === "All" ? "opt.All" : v === "≤90 d" ? "opt.dur.short" : v === "91–150 d" ? "opt.dur.med" : "opt.dur.long";
            return t(key) || v;
          }} />
          <Select label={t("filter.profit")} value={profit} onChange={setProfit} options={PROFIT as unknown as string[]} tKey={(v) => {
            const key = v === "All" ? "opt.All" : v === "≥30%" ? "opt.profit.30" : v === "≥45%" ? "opt.profit.45" : "opt.profit.60";
            return t(key) || v;
          }} />
          <Select label={t("filter.tag")} value={tag} onChange={setTag} options={allTags} tKey={(v) => (v === "All" ? t("opt.All") : v)} />
        </div>
      )}

      <div className="mt-8 text-xs text-muted-foreground">{filtered.length} {t("lib.count")} {CROP_LIST.length} {t("lib.crops")}</div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((c, i) => (
          <CropCard key={c.slug} crop={c} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center text-muted-foreground">{t("lib.noMatch")}</div>
        )}
      </div>
    </div>
  );
}

function Select({
  label, value, onChange, options, tKey,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  tKey?: (v: string) => string;
}) {
  const active = value !== "All";
  const fmt = tKey ?? ((v: string) => v);
  return (
    <label
      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
        active
          ? "border-primary/60 bg-primary/15 shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
          : "border-white/10 bg-black/60 hover:border-white/25"
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`flex-1 bg-transparent text-sm outline-none ${active ? "font-semibold text-primary" : "text-white"}`}
      >
        {options.map((o) => (
          <option key={o} value={o}>{fmt(o)}</option>
        ))}
      </select>
    </label>
  );
}
