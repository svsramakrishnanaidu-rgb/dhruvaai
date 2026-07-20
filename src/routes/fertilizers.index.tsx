import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HeroBanner } from "@/components/HeroBanner";
import { Reveal } from "@/components/Reveal";
import {
  FERTILIZERS,
  CATEGORIES,
  NUTRIENTS,
  METHODS,
  SOILS,
  type FertilizerCategory,
} from "@/data/fertilizers";
import heroImg from "@/assets/heroes/fertilizer.jpg";
import { Beaker, Search, Sparkles, FlaskConical, Leaf, Layers } from "lucide-react";

export const Route = createFileRoute("/fertilizers/")({
  head: () => ({
    meta: [
      { title: "Fertilizer Knowledge Center — KrishiSense" },
      { name: "description", content: "Image-first encyclopedia of 60+ fertilizers with product galleries, nutrient guides, application methods, deficiency visuals, soil compatibility and dosage calculators." },
      { property: "og:title", content: "Fertilizer Knowledge Center — KrishiSense" },
      { property: "og:description", content: "Explore fertilizers by category, nutrient, crop, soil and application method — visual, interactive, farmer-friendly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FertilizerHub,
});

function FertilizerHub() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<FertilizerCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FERTILIZERS.filter((f) => {
      if (cat !== "All" && f.category !== cat) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.generic.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.suitableCrops.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [query, cat]);

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="Encyclopedia"
        title="Fertilizer Knowledge Center"
        description="An image-first library of fertilizers, nutrients, soils and application methods — with dosage calculators and AI-ready dossiers for every crop."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 space-y-16">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: FlaskConical, label: "Fertilizers", value: `${FERTILIZERS.length}+` },
            { icon: Leaf, label: "Nutrients", value: `${NUTRIENTS.length}` },
            { icon: Layers, label: "Categories", value: `${CATEGORIES.length}` },
            { icon: Sparkles, label: "Methods", value: `${METHODS.length}` },
          ].map((s) => (
            <div key={s.label} className="card-elegant p-5 text-center">
              <s.icon className="mx-auto h-5 w-5 text-primary" />
              <div className="mt-2 font-display text-3xl font-black">{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + calculator CTA */}
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="card-elegant p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Urea, DAP, MOP, Zinc, Rhizobium, Nano Urea…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["All", ...CATEGORIES] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c as FertilizerCategory | "All")}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    cat === c
                      ? "border-primary bg-primary/20 text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/fertilizer"
            className="card-elegant hover-lift flex items-center gap-4 p-5"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Beaker className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">Dosage Calculator</div>
              <div className="text-sm text-muted-foreground">Get per-acre Urea, DAP, Potash, Zinc & Gypsum for every crop.</div>
            </div>
          </Link>
        </div>

        {/* Fertilizer gallery */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">Gallery</div>
              <h2 className="mt-1 font-display text-3xl font-black tracking-tight">Fertilizer library</h2>
            </div>
            <div className="text-sm text-muted-foreground">{filtered.length} results</div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f, i) => (
              <Reveal key={f.slug} delay={i * 30}>
                <Link
                  to="/fertilizers/$slug"
                  params={{ slug: f.slug }}
                  className="card-elegant hover-lift group block overflow-hidden"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={f.images.hero}
                      alt={f.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                          {f.category}
                        </span>
                        <span className="rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-semibold text-foreground backdrop-blur">
                          {f.form}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="font-display text-xl font-bold">{f.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{f.generic}</div>
                    <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold uppercase tracking-widest">
                      <div className="rounded-lg bg-emerald-500/15 py-1.5 text-emerald-300">N {f.npk.n}</div>
                      <div className="rounded-lg bg-orange-500/15 py-1.5 text-orange-300">P {f.npk.p}</div>
                      <div className="rounded-lg bg-violet-500/15 py-1.5 text-violet-300">K {f.npk.k}</div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>₹{f.price.inr} / {f.price.unit}</span>
                      <span>{f.dosagePerAcreKg.min}–{f.dosagePerAcreKg.max} kg/ac</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Nutrient encyclopedia */}
        <section>
          <div className="mb-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">Nutrients</div>
            <h2 className="mt-1 font-display text-3xl font-black tracking-tight">Deficiency atlas</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Healthy vs. deficient leaf comparisons for every essential plant nutrient — visual identification, symptoms, and corrective sources.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {NUTRIENTS.map((n, i) => (
              <Reveal key={n.key} delay={i * 30}>
                <div className="card-elegant hover-lift overflow-hidden">
                  <div className="grid grid-cols-2">
                    <div className="relative aspect-square overflow-hidden">
                      <img src={n.images.healthy} alt={`Healthy ${n.name}`} loading="lazy" className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">Healthy</span>
                    </div>
                    <div className="relative aspect-square overflow-hidden">
                      <img src={n.images.deficient} alt={`${n.name} deficiency`} loading="lazy" className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">Deficient</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-display text-xl font-bold">{n.name}</div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">{n.role} • {n.symbol}</div>
                      </div>
                      <div
                        className="grid h-10 w-10 place-items-center rounded-2xl text-sm font-black text-white"
                        style={{ background: n.color }}
                      >
                        {n.symbol}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{n.deficiencySymptoms}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {n.sources.map((s) => (
                        <span key={s} className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Application methods */}
        <section>
          <div className="mb-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">How to apply</div>
            <h2 className="mt-1 font-display text-3xl font-black tracking-tight">Application methods</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {METHODS.map((m, i) => (
              <Reveal key={m.key} delay={i * 25}>
                <div className="card-elegant hover-lift overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={m.image} alt={m.key} loading="lazy" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 font-display text-lg font-bold text-white">{m.key}</div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                    <ol className="mt-3 space-y-1.5 text-xs">
                      {m.steps.map((s, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">{idx + 1}</span>
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Soil compatibility */}
        <section>
          <div className="mb-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">Soil compatibility</div>
            <h2 className="mt-1 font-display text-3xl font-black tracking-tight">Match fertilizer to your soil</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOILS.map((s, i) => (
              <Reveal key={s.name} delay={i * 25}>
                <div className="card-elegant hover-lift overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={s.image} alt={s.name} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-display text-base font-bold">{s.name}</div>
                      <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">pH {s.ph}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{s.fertilizerHint}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
