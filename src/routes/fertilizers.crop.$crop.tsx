import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { FertMiniCard } from "@/components/FertMiniCard";
import {
  FERT_CROPS_BY_SLUG,
  fertilizersForFertCrop,
  unsuitableForFertCrop,
  shelvesFor,
  scheduleFor,
  combosFor,
  cropHeroImage,
  avoidImage,
  type FertCrop,
} from "@/data/fertilizer-crops";
import {
  ArrowLeft, Sparkles, CalendarRange, Ban, Calculator, Layers, Leaf,
} from "lucide-react";

export const Route = createFileRoute("/fertilizers/crop/$crop")({
  head: ({ params }) => {
    const c = FERT_CROPS_BY_SLUG[params.crop];
    if (!c) return { meta: [{ title: "Crop not found — Krish Sense" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${c.name} fertilizer guide — stage-wise nutrition · Krish Sense` },
        { name: "description", content: `Recommended fertilizers for ${c.name}: stage-wise schedule from sowing to harvest, best-selling and government-subsidised products, organic, bio and micronutrient options, and AI-suggested combinations.` },
        { property: "og:title", content: `${c.name} fertilizer guide · Krish Sense` },
        { property: "og:description", content: `Complete crop nutrition plan for ${c.name} — ${c.npkPerAcre.n}-${c.npkPerAcre.p}-${c.npkPerAcre.k} kg/acre, stage-wise products and dosage.` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    const c = FERT_CROPS_BY_SLUG[params.crop];
    if (!c) throw notFound();
    return c;
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-black">Crop not found</h1>
      <Link to="/fertilizers/crop" className="mt-4 inline-block text-primary underline">
        Browse all crops
      </Link>
    </div>
  ),
  component: CropFertilizerPage,
});

function CropFertilizerPage() {
  const crop = Route.useLoaderData() as FertCrop;
  const [acres, setAcres] = useState(1);

  const matched = useMemo(() => fertilizersForFertCrop(crop), [crop]);
  const shelves = useMemo(() => shelvesFor(crop), [crop]);
  const schedule = useMemo(() => scheduleFor(crop), [crop]);
  const combos = useMemo(() => combosFor(crop), [crop]);
  const avoid = useMemo(() => unsuitableForFertCrop(crop), [crop]);

  const need = crop.npkPerAcre;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
      <Link to="/fertilizers/crop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All crops
      </Link>

      {/* Hero */}
      <Reveal>
        <div className="card-elegant mt-5 overflow-hidden">
          <div className="relative h-56 w-full overflow-hidden md:h-72">
            <img
              src={cropHeroImage(crop)}
              alt={`${crop.name} crop field with fertilizer application`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-start gap-6">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 text-5xl">
              {crop.emoji}
            </div>
            <div className="min-w-[16rem] flex-1">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">
                {crop.group} crop · Fertilizer plan
              </div>
              <h1 className="mt-1 font-display text-4xl font-black tracking-tight md:text-5xl">{crop.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{crop.season}</p>
              <p className="mt-3 max-w-2xl text-sm">{crop.note}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([["N", need.n], ["P₂O₅", need.p], ["K₂O", need.k]] as const).map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-border/60 px-4 py-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k}</div>
                  <div className="font-display text-2xl font-black text-primary">{v}</div>
                  <div className="text-[10px] text-muted-foreground">kg/acre</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-border/60 px-3 py-1">
              <Layers className="mr-1 inline h-3.5 w-3.5 text-primary" />
              {matched.length} matched products
            </span>
            <Link to="/fertilizer" className="rounded-full bg-primary px-4 py-1.5 font-semibold text-primary-foreground">
              <Calculator className="mr-1 inline h-3.5 w-3.5" /> Dosage calculator
            </Link>
          </div>
          </div>
        </div>
      </Reveal>

      {/* Land-size nutrient requirement */}
      <Reveal>
        <section className="card-elegant mt-8 p-6">
          <h2 className="font-display text-2xl font-black">Total nutrient requirement</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground" htmlFor="acres">Land size (acres)</label>
            <input
              id="acres"
              type="number"
              min={0.25}
              step={0.25}
              value={acres}
              onChange={(e) => setAcres(Math.max(0, Number(e.target.value) || 0))}
              className="w-28 rounded-xl border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Nitrogen (N)", v: need.n * acres },
              { label: "Phosphorus (P₂O₅)", v: need.p * acres },
              { label: "Potassium (K₂O)", v: need.k * acres },
              { label: "Urea equivalent", v: (need.n * acres) / 0.46 },
            ].map((r) => (
              <div key={r.label} className="rounded-2xl border border-border/60 p-4">
                <div className="text-xs text-muted-foreground">{r.label}</div>
                <div className="font-display text-xl font-black">{r.v.toFixed(1)} kg</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Indicative general recommendation. Always adjust to your soil-test report and local extension advisory.
          </p>
        </section>
      </Reveal>

      {/* Stage-wise schedule */}
      <Reveal>
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-display text-3xl font-black">
            <CalendarRange className="h-6 w-6 text-primary" /> Crop nutrition schedule
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sowing to harvest, stage by stage — with the right product for each window.
          </p>

          <ol className="mt-6 space-y-4">
            {schedule.map((s, i) => (
              <li key={s.stage} className="card-elegant relative overflow-hidden md:flex">
                <img
                  src={s.image}
                  alt={`${crop.name} at ${s.stage}`}
                  loading="lazy"
                  className="h-40 w-full object-cover md:h-auto md:w-56 md:shrink-0"
                />
                <div className="relative flex-1 p-5 md:pl-16">
                <span className="absolute left-4 top-5 hidden h-8 w-8 place-items-center rounded-full bg-primary font-display text-sm font-black text-primary-foreground md:grid">
                  {i + 1}
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-xl font-bold">{s.stage}</h3>
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">{s.window}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{s.nutrients}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.goal}</p>
                {s.picks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.picks.map((f) => (
                      <Link
                        key={f.slug}
                        to="/fertilizers/$slug"
                        params={{ slug: f.slug }}
                        className="rounded-xl border border-border/60 px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
                      >
                        {f.name}
                        <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                          {f.npk.n}-{f.npk.p}-{f.npk.k}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* AI combinations */}
      <Reveal>
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-display text-3xl font-black">
            <Sparkles className="h-6 w-6 text-primary" /> AI-recommended combinations
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {combos.map((c) => (
              <div key={c.title} className="card-elegant overflow-hidden">
                <img
                  src={c.image}
                  alt={`${c.title} for ${crop.name}`}
                  loading="lazy"
                  className="h-40 w-full object-cover"
                />
                <div className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-bold">{c.title}</h3>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">{c.when}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.items.map((f) => (
                    <Link
                      key={f.slug}
                      to="/fertilizers/$slug"
                      params={{ slug: f.slug }}
                      className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      {f.name}
                    </Link>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{c.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Shelves */}
      {shelves.map((shelf) => (
        <Reveal key={shelf.key}>
          <section className="mt-12">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-black md:text-3xl">{shelf.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{shelf.subtitle}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{shelf.items.length} products</span>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl">
              <img
                src={shelf.image}
                alt={`${shelf.title} for ${crop.name}`}
                loading="lazy"
                className="h-32 w-full object-cover md:h-40"
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {shelf.items.map((f) => (
                <FertMiniCard key={f.slug} f={f} />
              ))}
            </div>
          </section>
        </Reveal>
      ))}

      {/* Not recommended */}
      {avoid.length > 0 && (
        <Reveal>
          <section className="card-elegant mt-12 overflow-hidden border-destructive/40">
            <img
              src={avoidImage(crop)}
              alt={`Fertilizers to avoid on ${crop.name}`}
              loading="lazy"
              className="h-36 w-full object-cover md:h-44"
            />
            <div className="p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl font-black text-destructive">
              <Ban className="h-5 w-5" /> Not recommended for {crop.name}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {avoid.map((f) => (
                <li key={f.slug}>
                  <Link to="/fertilizers/$slug" params={{ slug: f.slug }} className="font-semibold underline">
                    {f.name}
                  </Link>
                  <span className="text-muted-foreground"> — flagged unsuitable: {(f.unsuitableCrops ?? []).join(", ")}</span>
                </li>
              ))}
            </ul>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/fertilizers/crop" className="card-elegant hover-lift px-5 py-3 text-sm font-semibold">
            <Leaf className="mr-2 inline h-4 w-4 text-primary" /> Browse another crop
          </Link>
          <Link to="/fertilizers" className="card-elegant hover-lift px-5 py-3 text-sm font-semibold">
            Full fertilizer library
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
