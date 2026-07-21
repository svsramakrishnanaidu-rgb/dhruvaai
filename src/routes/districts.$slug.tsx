import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AP_DISTRICT_BY_SLUG, cropsInAPDistrict, type APDistrict } from "@/data/ap-districts";
import { CropCard } from "@/components/CropCard";
import { Reveal } from "@/components/Reveal";
import { locationStore, useLocation } from "@/lib/location-store";
import { categoryOf, CROP_CATEGORIES } from "@/data/crops";
import type { CropCategory } from "@/data/crops/types";
import { useMemo, useState, useEffect } from "react";
import { MapPin, Layers, Sun, Droplets, ArrowLeft, Sprout } from "lucide-react";

export const Route = createFileRoute("/districts/$slug")({
  loader: ({ params }) => {
    const district = AP_DISTRICT_BY_SLUG[params.slug];
    if (!district) throw notFound();
    return { district } as { district: APDistrict };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.district;
    return {
      meta: [
        { title: d ? `${d.name} — Crop Gallery | Krish Sense` : "District — Krish Sense" },
        { name: "description", content: d ? `Every crop cultivated across ${d.name} (${d.region} AP): season, category and cultivation dossiers.` : "" },
      ],
    };
  },
  component: DistrictPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-black">District not indexed yet</h1>
      <p className="mt-3 text-muted-foreground">Head back to the districts list to pick another.</p>
      <Link to="/districts" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Back to districts</Link>
    </div>
  ),
});

const SEASONS = ["All", "Kharif", "Rabi", "Perennial"] as const;

function DistrictPage() {
  const { district } = Route.useLoaderData();
  const allCrops = useMemo(() => cropsInAPDistrict(district.name), [district.name]);
  const loc = useLocation();

  const [season, setSeason] = useState<(typeof SEASONS)[number]>("All");
  const [category, setCategory] = useState<CropCategory | "All">("All");
  const [q, setQ] = useState("");

  // Keep global district in sync so weather/market/schemes react on visit.
  useEffect(() => {
    if (loc.district !== district.name || loc.state !== "Andhra Pradesh") {
      locationStore.set({ state: "Andhra Pradesh", district: district.name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district.name]);

  const filtered = useMemo(() => {
    return allCrops.filter((c) => {
      if (season !== "All" && !c.season.toLowerCase().includes(season.toLowerCase())) {
        if (!(season === "Perennial" && (c.slug === "banana" || c.slug === "mango" || c.slug === "sugarcane"))) return false;
      }
      if (category !== "All" && categoryOf(c) !== category) return false;
      if (q && !`${c.name} ${c.scientificName} ${c.description ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [allCrops, season, category, q]);

  const categoriesInDistrict = useMemo(() => {
    const set = new Set<CropCategory>();
    for (const c of allCrops) set.add(categoryOf(c));
    return CROP_CATEGORIES.filter((c) => set.has(c));
  }, [allCrops]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/districts" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All districts
      </Link>

      <Reveal>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{district.region} · Andhra Pradesh</span>
            <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">
              {district.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              HQ: {district.headquarters}. {allCrops.length} crops indexed for this district.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Layers className="h-4 w-4" />} label="Soil" value={district.soil} />
        <Stat icon={<Sun className="h-4 w-4" />} label="Climate" value={district.climate} />
        <Stat icon={<Sprout className="h-4 w-4" />} label="Crops indexed" value={`${allCrops.length}`} />
      </div>

      {/* Filters */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search crops in ${district.name}…`}
          className="flex-1 min-w-[220px] rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <Chips label="Season" value={season} onChange={(v) => setSeason(v as any)} options={SEASONS as unknown as string[]} />
        <Chips
          label="Category"
          value={category}
          onChange={(v) => setCategory(v as CropCategory | "All")}
          options={["All", ...categoriesInDistrict]}
        />
      </div>

      <div className="mt-6 text-xs text-muted-foreground">{filtered.length} of {allCrops.length} crops</div>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((c, i) => (
          <CropCard key={c.slug} crop={c} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No crops match those filters in {district.name}.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-elegant p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span className="text-primary">{icon}</span> {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function Chips({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-full border border-border/60 bg-card/40 p-1">
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
