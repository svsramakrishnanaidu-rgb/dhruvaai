import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import {
  FERT_CROPS,
  FERT_CROP_GROUPS,
  fertilizersForFertCrop,
  type CropGroup,
} from "@/data/fertilizer-crops";
import { ArrowLeft, Search, Sprout, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/fertilizers/crop/")({
  head: () => ({
    meta: [
      { title: "Crop-wise Fertilizer Guide — Krish Sense" },
      { name: "description", content: "Browse fertilizers crop-wise for every major Indian crop — paddy, wheat, cotton, sugarcane, pulses, millets, oilseeds, vegetables, fruits, spices and plantation crops." },
      { property: "og:title", content: "Crop-wise Fertilizer Guide — Krish Sense" },
      { property: "og:description", content: "Pick your crop and get stage-wise nutrition, best-selling, organic, bio and micronutrient recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CropWiseHub,
});

function CropWiseHub() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<CropGroup | "All">("All");

  const counts = useMemo(
    () => Object.fromEntries(FERT_CROPS.map((c) => [c.slug, fertilizersForFertCrop(c).length])),
    [],
  );

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return FERT_CROPS.filter(
      (c) =>
        (group === "All" || c.group === group) &&
        (!s || c.name.toLowerCase().includes(s) || c.aliases.some((a) => a.includes(s))),
    );
  }, [q, group]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
      <Link to="/fertilizers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Fertilizer Knowledge Center
      </Link>

      <Reveal>
        <h1 className="mt-5 font-display text-4xl font-black tracking-tight md:text-6xl">
          Fertilizers, organised <span className="text-primary">crop-wise</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Select your crop to see the exact products, stage-wise schedule and combinations
          recommended for it — from basal dose to post-harvest soil recovery.
        </p>
      </Reveal>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="card-elegant flex flex-1 items-center gap-3 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search crop — paddy, cotton, tomato, cardamom…"
            className="w-full bg-transparent text-sm outline-none"
            aria-label="Search crop"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["All", ...FERT_CROP_GROUPS] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g as CropGroup | "All")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              group === g
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {g === "All" ? "All crops" : `${g} crops`}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((c) => (
          <Link
            key={c.slug}
            to="/fertilizers/crop/$crop"
            params={{ crop: c.slug }}
            className="card-elegant hover-lift group p-5"
          >
            <div className="text-3xl">{c.emoji}</div>
            <div className="mt-3 font-display text-lg font-bold leading-tight">{c.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.season}</div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1">
                <Sprout className="h-3 w-3 text-primary" /> {counts[c.slug]} products
              </span>
              <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {list.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">No crop matches “{q}”.</p>
      )}
    </div>
  );
}
