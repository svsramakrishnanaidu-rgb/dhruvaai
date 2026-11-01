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
      { title: "Crop Library — DHRUVA" },
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
    <div className="relative min-h-screen bg-web-bg-midnight font-[Plus Jakarta Sans] mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-web-emerald">{t("lib.eyebrow")}</span>
        <h1 className="mt-2 font-[Unbounded] text-5xl font-black tracking-tight text-web-mist md:text-7xl">{t("lib.title")}</h1>
        <p className="mt-4 max-w-2xl text-[11px] font-bold uppercase tracking-widest text-web-sage leading-relaxed opacity-80">{t("lib.sub")}</p>
      </Reveal>

      {localCrops.length > 0 && district === "All" && (
        <Reveal>
          <div className="mt-10 rounded-[3rem] border border-web-emerald/30 bg-web-emerald/5 p-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-web-emerald">
              <MapPin className="h-4 w-4 text-web-gold" /> {t("lib.recommended")} {loc.district}
            </div>
            <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-web-sage">
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
        <div className="relative flex-1 min-w-[280px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("lib.searchPh")}
            aria-label={t("lib.searchPh")}
            className="w-full rounded-2xl border border-web-leaf/10 bg-web-bg-midnight/40 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-web-mist outline-none focus:border-web-emerald transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="inline-flex items-center gap-2 rounded-2xl border border-web-leaf/10 bg-web-bg-midnight/40 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-web-sage hover:border-web-emerald/30 hover:text-web-gold transition-all"
        >
          <Filter className="h-4 w-4" /> {t("lib.filters")}
          {activeCount > 0 && (
            <span className="rounded-full bg-web-emerald px-2 py-0.5 text-[9px] font-black text-web-mist shadow-lg shadow-web-emerald/20">{activeCount}</span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-web-sage hover:text-web-gold transition-colors">
            <X className="h-4 w-4" /> {t("lib.reset")}
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-[2rem] border border-web-leaf/10 bg-web-bg-midnight/90 p-6 shadow-2xl backdrop-blur-2xl md:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-8 text-[9px] font-black uppercase tracking-[0.2em] text-web-sage opacity-60">{filtered.length} {t("lib.count")} {CROP_LIST.length} {t("lib.crops")}</div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((c, i) => (
          <CropCard key={c.slug} crop={c} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center text-[11px] font-black uppercase tracking-widest text-web-sage">{t("lib.noMatch")}</div>
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
      className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-[10px] transition-all duration-300 ${
        active
          ? "border-web-emerald/60 bg-web-emerald/15 shadow-[0_0_24px_rgba(16,185,129,0.1)]"
          : "border-web-leaf/10 bg-web-bg-midnight/60 hover:border-web-leaf/30"
      }`}
    >
      <span className="text-[9px] font-black uppercase tracking-widest text-web-gold/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`flex-1 bg-transparent text-[10px] font-black uppercase tracking-widest outline-none ${active ? "text-web-emerald" : "text-web-mist"}`}
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-web-bg-midnight">{fmt(o)}</option>
        ))}
      </select>
    </label>
  );
}
