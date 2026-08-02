import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { HeroBanner } from "@/components/HeroBanner";
import { Reveal } from "@/components/Reveal";
import {
  FERTILIZERS_ALL,
  CATEGORIES,
  NUTRIENTS,
  METHODS,
  SOILS,
  heroAIFor,
  type FertilizerCategory,
  type Fertilizer,
} from "@/data/fertilizers";
import { getFertilizerSubsidyFeed } from "@/lib/fertilizer-live.functions";
import heroImg from "@/assets/heroes/fertilizer.jpg";
import {
  Beaker, Search, Sparkles, FlaskConical, Leaf, Layers, Wallet,
  Radio, Filter, Stethoscope, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/fertilizers/")({
  head: () => ({
    meta: [
      { title: "Fertilizer Knowledge Center — Krish Sense" },
      { name: "description", content: "Encyclopedia of 150+ fertilizers with AI hero visuals, live data.gov.in subsidy rates, deficiency diagnosis, advanced filters and per-crop dosage guidance." },
      { property: "og:title", content: "Fertilizer Knowledge Center — Krish Sense" },
      { property: "og:description", content: "150+ fertilizers · Live NBS/subsidy rates · Deficiency diagnosis · Category, crop, soil & nutrient filters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FertilizerHub,
});

type SortKey = "featured" | "priceAsc" | "priceDesc" | "nHigh" | "pHigh" | "kHigh" | "az";

const NUTRIENT_TAGS = ["N", "P", "K", "S", "Ca", "Mg", "Zn", "Fe", "B", "Cu", "Mn", "Mo"] as const;
type NutrientTag = (typeof NUTRIENT_TAGS)[number];

function hasNutrient(f: Fertilizer, tag: NutrientTag): boolean {
  if (tag === "N") return f.npk.n > 0;
  if (tag === "P") return f.npk.p > 0;
  if (tag === "K") return f.npk.k > 0;
  if (tag === "S" || tag === "Ca" || tag === "Mg") return !!f.secondary?.[tag] && (f.secondary[tag] ?? 0) > 0;
  return !!f.micro?.[tag] && (f.micro[tag] ?? 0) > 0;
}

// Deficiency → recommended tags map
const DEFICIENCY_MAP: Record<string, { tags: NutrientTag[]; title: string }> = {
  yellowLower: { tags: ["N"], title: "Yellowing older leaves — Nitrogen deficiency" },
  purpleStems: { tags: ["P"], title: "Purple stems / stunted growth — Phosphorus deficiency" },
  scorchedEdges: { tags: ["K"], title: "Leaf-edge scorch — Potassium deficiency" },
  interveinalYoung: { tags: ["Fe", "Mn", "Zn"], title: "Interveinal yellowing on young leaves — Fe / Mn / Zn" },
  hollowStem: { tags: ["B"], title: "Hollow stem, cracked fruit — Boron deficiency" },
  blossomEndRot: { tags: ["Ca"], title: "Blossom-end rot / tip burn — Calcium deficiency" },
  interveinalOld: { tags: ["Mg"], title: "Interveinal yellowing on older leaves — Magnesium deficiency" },
  poorNodulation: { tags: ["Mo"], title: "Poor nodulation in legumes — Molybdenum" },
  chlorosisWheat: { tags: ["S"], title: "Uniform pale-yellow in oilseeds/pulses — Sulphur" },
};

function FertilizerHub() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<FertilizerCategory | "All">("All");
  const [nutrient, setNutrient] = useState<NutrientTag | "All">("All");
  const [crop, setCrop] = useState<string>("");
  const [soil, setSoil] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [diag, setDiag] = useState<keyof typeof DEFICIENCY_MAP | null>(null);

  // Live subsidy feed
  const [subsidy, setSubsidy] = useState<Awaited<ReturnType<typeof getFertilizerSubsidyFeed>> | null>(null);
  useEffect(() => {
    let alive = true;
    getFertilizerSubsidyFeed().then((r) => { if (alive) setSubsidy(r); }).catch(() => {});
    const t = setInterval(() => {
      getFertilizerSubsidyFeed().then((r) => { if (alive) setSubsidy(r); }).catch(() => {});
    }, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  // Unique crops & soils for filter dropdowns
  const cropOptions = useMemo(() => {
    const s = new Set<string>();
    FERTILIZERS_ALL.forEach((f) => f.suitableCrops.forEach((c) => s.add(c)));
    return Array.from(s).sort();
  }, []);
  const soilOptions = useMemo(() => {
    const s = new Set<string>();
    FERTILIZERS_ALL.forEach((f) => f.suitableSoils.forEach((c) => s.add(c)));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const diagTags = diag ? DEFICIENCY_MAP[diag].tags : null;
    let list = FERTILIZERS_ALL.filter((f) => {
      if (cat !== "All" && f.category !== cat) return false;
      if (nutrient !== "All" && !hasNutrient(f, nutrient)) return false;
      if (crop && !f.suitableCrops.some((c) => c.toLowerCase().includes(crop.toLowerCase()))) return false;
      if (soil && !f.suitableSoils.some((c) => c.toLowerCase().includes(soil.toLowerCase()))) return false;
      if (diagTags && !diagTags.some((t) => hasNutrient(f, t))) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.generic.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        (f.brand ?? "").toLowerCase().includes(q) ||
        f.suitableCrops.some((c) => c.toLowerCase().includes(q)) ||
        f.manufacturers.some((m) => m.toLowerCase().includes(q))
      );
    });
    switch (sort) {
      case "priceAsc":  list = list.sort((a, b) => a.price.inr - b.price.inr); break;
      case "priceDesc": list = list.sort((a, b) => b.price.inr - a.price.inr); break;
      case "nHigh":     list = list.sort((a, b) => b.npk.n - a.npk.n); break;
      case "pHigh":     list = list.sort((a, b) => b.npk.p - a.npk.p); break;
      case "kHigh":     list = list.sort((a, b) => b.npk.k - a.npk.k); break;
      case "az":        list = list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }, [query, cat, nutrient, crop, soil, sort, diag]);

  const clearFilters = () => {
    setQuery(""); setCat("All"); setNutrient("All");
    setCrop(""); setSoil(""); setSort("featured"); setDiag(null);
  };

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="Encyclopedia · 150+ products"
        title="Fertilizer Knowledge Center"
        description="AI-visual encyclopedia of fertilizers — brand grades, water-solubles, chelated micros, biofertilizers, organic manures & nano formulations. Live data.gov.in subsidy rates and instant deficiency diagnosis."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 space-y-16">
        {/* Live subsidy strip */}
        <div className="card-elegant relative overflow-hidden p-5">
          <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inset-0 rounded-full ${subsidy?.source === "live" ? "bg-emerald-400" : "bg-amber-400"} animate-ping opacity-75`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${subsidy?.source === "live" ? "bg-emerald-500" : "bg-amber-500"}`} />
            </span>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Radio className="h-3.5 w-3.5" />
              {subsidy?.source === "live" ? "Live · data.gov.in NBS feed" : "Reference subsidy rates"}
            </div>
            <div className="ml-auto text-[10px] text-muted-foreground">
              {subsidy ? `Updated ${new Date(subsidy.fetchedAt).toLocaleTimeString()}` : "Loading…"}
            </div>
          </div>
          <div className="mt-4 overflow-hidden">
            <div className="flex animate-[marquee_45s_linear_infinite] gap-4 will-change-transform">
              {(subsidy?.rows ?? []).concat(subsidy?.rows ?? []).map((r, i) => (
                <div key={i} className="flex shrink-0 items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-2.5">
                  <Wallet className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.category}</div>
                    <div className="text-sm font-bold">{r.product}</div>
                  </div>
                  <div className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
                    ₹{r.ratePerTonne.toLocaleString("en-IN")}/T
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: FlaskConical, label: "Fertilizers", value: `${FERTILIZERS_ALL.length}+` },
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

        {/* Deficiency diagnosis */}
        <section className="card-elegant p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">Deficiency diagnosis</div>
              <h2 className="font-display text-2xl font-black tracking-tight">What does your crop look like?</h2>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {Object.entries(DEFICIENCY_MAP).map(([key, v]) => (
              <button
                key={key}
                onClick={() => setDiag(diag === key ? null : (key as keyof typeof DEFICIENCY_MAP))}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  diag === key
                    ? "border-primary bg-primary/20 text-foreground"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {v.title}
              </button>
            ))}
          </div>
          {diag && (
            <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <span className="font-semibold text-foreground">{DEFICIENCY_MAP[diag].title}</span>
              <span className="ml-2 text-muted-foreground">
                → showing {filtered.length} fertilizers rich in {DEFICIENCY_MAP[diag].tags.join(" / ")}.
              </span>
            </div>
          )}
        </section>

        {/* Search + calculator CTA */}
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="card-elegant p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Urea, DAP, Kristalon, Rhizobium, Nano DAP, Coromandel, Yara…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {(query || cat !== "All" || nutrient !== "All" || crop || soil || diag) && (
                <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                  Clear
                </button>
              )}
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

        {/* Crop-wise entry */}
        <Link
          to="/fertilizers/crop"
          className="card-elegant hover-lift mt-4 flex flex-wrap items-center gap-4 p-6"
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-primary text-3xl">
            🌾
          </div>
          <div className="min-w-[14rem] flex-1">
            <div className="font-display text-xl font-black">Browse fertilizers crop-wise</div>
            <div className="text-sm text-muted-foreground">
              Paddy, wheat, cotton, sugarcane, pulses, millets, oilseeds, vegetables, fruits,
              spices & plantation crops — with stage-wise nutrition schedules.
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary" />
        </Link>


        {/* Advanced filters row */}
        <div className="card-elegant p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Advanced filters
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Nutrient</label>
              <div className="flex flex-wrap gap-1.5">
                {(["All", ...NUTRIENT_TAGS] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNutrient(n as NutrientTag | "All")}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${
                      nutrient === n ? "border-primary bg-primary/20 text-foreground" : "border-border/60 text-muted-foreground"
                    }`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm outline-none"
              >
                <option value="">All crops</option>
                {cropOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Soil</label>
              <select
                value={soil}
                onChange={(e) => setSoil(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm outline-none"
              >
                <option value="">All soils</option>
                {soilOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm outline-none"
              >
                <option value="featured">Featured</option>
                <option value="az">A → Z</option>
                <option value="priceAsc">Price: Low → High</option>
                <option value="priceDesc">Price: High → Low</option>
                <option value="nHigh">Highest N</option>
                <option value="pHigh">Highest P</option>
                <option value="kHigh">Highest K</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fertilizer gallery */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">Gallery</div>
              <h2 className="mt-1 font-display text-3xl font-black tracking-tight">Fertilizer library</h2>
            </div>
            <div className="text-sm text-muted-foreground">{filtered.length} of {FERTILIZERS_ALL.length}</div>
          </div>

          {filtered.length === 0 ? (
            <div className="card-elegant p-12 text-center">
              <div className="text-lg font-semibold">No fertilizers match your filters.</div>
              <button onClick={clearFilters} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                Clear filters <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, 60).map((f, i) => (
                <Reveal key={f.slug} delay={i * 20}>
                  <Link
                    to="/fertilizers/$slug"
                    params={{ slug: f.slug }}
                    className="card-elegant hover-lift group block overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={heroAIFor(f)}
                        alt={f.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                            {f.category}
                          </span>
                          <span className="rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-semibold text-foreground backdrop-blur">
                            {f.form}
                          </span>
                        </div>
                      </div>
                      {f.brand && (
                        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur">
                          {f.brand}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="font-display text-xl font-bold">{f.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{f.generic}</div>
                      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold uppercase tracking-widest">
                        <div className="rounded-lg bg-emerald-500/15 py-1.5 text-emerald-300">N {f.npk.n}</div>
                        <div className="rounded-lg bg-orange-500/15 py-1.5 text-orange-300">P {f.npk.p}</div>
                        <div className="rounded-lg bg-violet-500/15 py-1.5 text-violet-300">K {f.npk.k}</div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>₹{f.price.inr.toLocaleString("en-IN")} / {f.price.unit}</span>
                        <span>{f.dosagePerAcreKg.min}–{f.dosagePerAcreKg.max} kg/ac</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
          {filtered.length > 60 && (
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Showing first 60 · refine filters above to see more of the {filtered.length} matches.
            </div>
          )}
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
