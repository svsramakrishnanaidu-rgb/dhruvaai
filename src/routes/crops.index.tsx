import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CROP_LIST } from "@/data/crops";
import { CropCard } from "@/components/CropCard";
import { Reveal } from "@/components/Reveal";
import { useLocation, STATES } from "@/lib/location-store";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/crops/")({
  head: () => ({
    meta: [
      { title: "Crop Library — KrishiSense" },
      { name: "description", content: "Filterable library of crops with season, soil, water need and profit — filter by your district." },
    ],
  }),
  component: CropLibrary,
});

const SEASONS = ["All", "Kharif", "Rabi"];
const WATER = ["All", "Low", "Medium", "High"] as const;

function CropLibrary() {
  const loc = useLocation();
  const allDistricts = useMemo(
    () => ["All", ...Object.values(STATES).flat()],
    [],
  );
  const [season, setSeason] = useState("All");
  const [water, setWater] = useState<(typeof WATER)[number]>("All");
  const [district, setDistrict] = useState<string>(loc.district || "All");
  const [q, setQ] = useState("");

  const localCrops = useMemo(
    () => CROP_LIST.filter((c) => c.suitableDistricts.some((d) => d.toLowerCase() === loc.district.toLowerCase())),
    [loc.district],
  );

  const filtered = useMemo(() => {
    return CROP_LIST.filter((c) => {
      if (season !== "All" && !c.season.includes(season)) return false;
      if (water !== "All" && c.waterNeed !== water) return false;
      if (district !== "All" && !c.suitableDistricts.some((d) => d.toLowerCase() === district.toLowerCase())) return false;
      if (q && !`${c.name} ${c.scientificName}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [season, water, district, q]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Library</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">Crop Library</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Every crop is a fully isolated dossier — data, images, diseases and rotations never cross over.</p>
      </Reveal>

      {localCrops.length > 0 && district === loc.district && (
        <Reveal>
          <div className="mt-10 rounded-3xl border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <MapPin className="h-4 w-4" /> Recommended for {loc.district}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {localCrops.length} crops thrive in your district's soil & climate.
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
          placeholder="Search crop…"
          className="flex-1 min-w-[200px] rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm outline-none focus:border-primary"
          aria-label="District filter"
        >
          {allDistricts.map((d) => (
            <option key={d} value={d}>{d === "All" ? "All districts" : d}</option>
          ))}
        </select>
        <ChipGroup label="Season" value={season} onChange={setSeason} options={SEASONS} />
        <ChipGroup label="Water" value={water} onChange={(v) => setWater(v as any)} options={WATER as unknown as string[]} />
      </div>

      <div className="mt-8 text-xs text-muted-foreground">{filtered.length} crops</div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((c, i) => (
          <CropCard key={c.slug} crop={c} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center text-muted-foreground">No crops match those filters.</div>
        )}
      </div>
    </div>
  );
}

function ChipGroup({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/40 p-1">
      <span className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            value === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
