import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CROP_LIST } from "@/data/crops";
import { CropCard } from "@/components/CropCard";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/crops/")({
  head: () => ({
    meta: [
      { title: "Crop Library — KrishiSense" },
      { name: "description", content: "Filterable library of crops with season, soil, water need and profit at a glance." },
    ],
  }),
  component: CropLibrary,
});

const SEASONS = ["All", "Kharif", "Rabi"];
const WATER = ["All", "Low", "Medium", "High"] as const;

function CropLibrary() {
  const [season, setSeason] = useState("All");
  const [water, setWater] = useState<(typeof WATER)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return CROP_LIST.filter((c) => {
      if (season !== "All" && !c.season.includes(season)) return false;
      if (water !== "All" && c.waterNeed !== water) return false;
      if (q && !`${c.name} ${c.scientificName}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [season, water, q]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Library</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">Crop Library</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Every crop is a fully isolated dossier — data, images, diseases and rotations never cross over.</p>
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search crop…"
          className="flex-1 min-w-[200px] rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <ChipGroup label="Season" value={season} onChange={setSeason} options={SEASONS} />
        <ChipGroup label="Water" value={water} onChange={(v) => setWater(v as any)} options={WATER as unknown as string[]} />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
