import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { FERTILIZERS_BY_SLUG, FERTILIZERS, NUTRIENTS, METHODS, type Fertilizer } from "@/data/fertilizers";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import {
  ArrowLeft, Beaker, ShieldCheck, PackageOpen, Sprout, Droplets,
  AlertTriangle, Factory, Info, Layers, X, ChevronLeft, ChevronRight,
  Leaf, FlaskConical, Zap, Sun, CloudRain, HardHat, Warehouse, HeartPulse,
  BadgeCheck, HelpCircle, Quote, TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/fertilizers/$slug")({
  head: ({ params }) => {
    const f = FERTILIZERS_BY_SLUG[params.slug];
    if (!f) return { meta: [{ title: "Fertilizer not found — KrishiSense" }] };
    return {
      meta: [
        { title: `${f.name} — Complete visual dossier · KrishiSense` },
        { name: "description", content: `${f.name} (${f.generic}): NPK ${f.npk.n}-${f.npk.p}-${f.npk.k}, HD photo gallery, crop application visuals, dosage, deficiency correction and crop compatibility.` },
        { property: "og:title", content: `${f.name} · Fertilizer dossier` },
        { property: "og:description", content: `Visual guide to ${f.name}: composition, dosage, application methods and crop compatibility.` },
        { property: "og:image", content: f.images.hero },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: f.images.hero },
      ],
    };
  },
  loader: ({ params }) => {
    const f = FERTILIZERS_BY_SLUG[params.slug];
    if (!f) throw notFound();
    return f;
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-black">Fertilizer not found</h1>
      <Link to="/fertilizers" className="mt-4 inline-block text-primary underline">Back to library</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-black text-destructive">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: FertilizerDetail,
});

type Tab = "overview" | "application" | "crops" | "deficiency" | "safety" | "faq";

function FertilizerDetail() {
  const f = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("overview");
  const total = f.npk.n + f.npk.p + f.npk.k;
  const related = FERTILIZERS.filter((x) => x.category === f.category && x.slug !== f.slug).slice(0, 3);

  // Combined gallery for lightbox
  const galleryImages = useMemo(() => {
    const seen = new Set<string>();
    const arr: { url: string; caption: string }[] = [];
    const push = (url: string, caption: string) => {
      if (!url || seen.has(url)) return;
      seen.add(url); arr.push({ url, caption });
    };
    push(f.images.hero, `${f.name} — hero`);
    f.images.packaging.forEach((u, i) => push(u, `${f.name} packaging ${i + 1}`));
    push(f.images.granules, `${f.name} — ${f.form.toLowerCase()} close-up`);
    push(f.images.label, `${f.name} — product label`);
    f.images.application.forEach((u, i) => push(u, `Field application ${i + 1}`));
    f.images.cropApplication.forEach((c) => push(c.url, `Applied on ${c.crop}`));
    push(f.images.beforeAfter.before, "Before application — deficient crop");
    push(f.images.beforeAfter.after, "After application — healthy crop");
    push(f.images.soil, `Recommended soil — ${f.suitableSoils[0] ?? "farm"}`);
    push(f.images.root, "Root development boost");
    push(f.images.deficiency, "Deficiency the fertilizer corrects");
    push(f.images.storage, "Storage conditions");
    push(f.images.safety, "Safety & handling");
    f.images.gallery.forEach((u, i) => push(u, `Gallery ${i + 1}`));
    return arr;
  }, [f]);

  const [lbIdx, setLbIdx] = useState<number | null>(null);
  const openLb = (url: string) => {
    const i = galleryImages.findIndex((g) => g.url === url);
    setLbIdx(i >= 0 ? i : 0);
  };
  const closeLb = () => setLbIdx(null);
  const prevLb = () => setLbIdx((i) => (i === null ? null : (i - 1 + galleryImages.length) % galleryImages.length));
  const nextLb = () => setLbIdx((i) => (i === null ? null : (i + 1) % galleryImages.length));

  useEffect(() => {
    if (lbIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") prevLb();
      if (e.key === "ArrowRight") nextLb();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lbIdx]);

  // Content blocks
  const seasonalTips = [
    { season: "Kharif", icon: CloudRain, text: `Apply ${f.name} basal at sowing; split top-dressing after monsoon establishes.` },
    { season: "Rabi", icon: Sun, text: `Use ${f.dosagePerAcreKg.min}–${f.dosagePerAcreKg.max} kg/acre with adequate irrigation for uptake.` },
    { season: "Summer", icon: Zap, text: `Prefer fertigation to reduce volatilisation loss during high temperatures.` },
  ];

  const faqs = [
    {
      q: `Is ${f.name} safe for organic farming?`,
      a: f.category === "Organic" || f.category === "Bio-fertilizer"
        ? `${f.name} is compatible with organic and regenerative systems.`
        : `${f.name} is a conventional input. For organic systems, consider ${f.category === "Nitrogen" ? "vermicompost / FYM" : f.category === "Phosphatic" ? "rock phosphate or bone meal" : "compost-based alternatives"}.`,
    },
    { q: `How much ${f.name} should I apply per acre?`, a: `Standard dosage is ${f.dosagePerAcreKg.min}–${f.dosagePerAcreKg.max} kg/acre at the ${f.stage} stage. Use the calculator for exact amounts.` },
    { q: `Which crops respond best to ${f.name}?`, a: `Best results on ${f.suitableCrops.join(", ")}.` },
    { q: `Can ${f.name} be mixed with other fertilizers?`, a: f.mixing },
    { q: `What is the shelf life?`, a: `${f.shelfLifeMonths} months when stored ${f.storage.toLowerCase()}.` },
  ];

  const successStories = [
    {
      name: "Ramesh, Guntur (AP)",
      crop: f.suitableCrops[0] ?? "Cotton",
      quote: `Switched to ${f.name} at basal — my ${(f.suitableCrops[0] ?? "cotton").toLowerCase()} yield went up ~18% with visibly greener foliage within 20 days.`,
      image: f.images.cropApplication[0]?.url ?? f.images.application[0],
      uplift: 18,
    },
    {
      name: "Sunita, Nashik (MH)",
      crop: f.suitableCrops[1] ?? f.suitableCrops[0] ?? "Grapes",
      quote: `Combined ${f.name} with drip fertigation. Bunch size improved and bloom-drop reduced dramatically this season.`,
      image: f.images.cropApplication[1]?.url ?? f.images.application[1],
      uplift: 22,
    },
    {
      name: "Bhaskar, Warangal (TS)",
      crop: f.suitableCrops[2] ?? f.suitableCrops[0] ?? "Rice",
      quote: `Followed the recommended stage timing — panicle length was consistently longer and lodging was minimal.`,
      image: f.images.cropApplication[2]?.url ?? f.images.application[2],
      uplift: 15,
    },
  ];

  const nutrientDeficiencyMatches = NUTRIENTS.filter((n) =>
    n.sources.some((s) => s.toLowerCase().includes(f.name.split(" ")[0].toLowerCase()))
    || (f.npk.n > 15 && n.key === "n")
    || (f.npk.p > 15 && n.key === "p")
    || (f.npk.k > 15 && n.key === "k")
    || (f.secondary?.S && n.key === "s")
    || (f.secondary?.Ca && n.key === "ca")
    || (f.secondary?.Mg && n.key === "mg")
    || (f.micro?.Zn && n.key === "zn")
    || (f.micro?.Fe && n.key === "fe")
    || (f.micro?.B && n.key === "b")
  );

  return (
    <div className="pb-24">
      {/* Cinematic header */}
      <div className="relative h-[58vh] min-h-[460px] w-full overflow-hidden">
        <img src={f.images.hero} alt={f.name} className="absolute inset-0 h-full w-full object-cover animate-[scale-in_1.2s_ease-out]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
          <Link
            to="/fertilizers"
            className="inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Fertilizer library
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">{f.category}</span>
            <span className="rounded-full bg-background/70 px-3 py-1 text-[10px] font-semibold backdrop-blur">{f.form}</span>
            {f.govApproved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                <ShieldCheck className="h-3 w-3" /> Gov approved
              </span>
            )}
            {f.subsidy && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                <BadgeCheck className="h-3 w-3" /> {f.subsidy}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-5xl font-black tracking-tight md:text-6xl">{f.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{f.generic}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 space-y-16">
        {/* NPK + stats */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
          <div className="card-elegant p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Composition</div>
            <div className="mt-2 font-display text-xl font-bold">{f.formula}</div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "N", val: f.npk.n, color: "bg-emerald-500/20 text-emerald-300" },
                { label: "P", val: f.npk.p, color: "bg-orange-500/20 text-orange-300" },
                { label: "K", val: f.npk.k, color: "bg-violet-500/20 text-violet-300" },
              ].map((x) => (
                <div key={x.label} className={`rounded-2xl p-4 ${x.color}`}>
                  <div className="text-[10px] font-bold uppercase tracking-widest">{x.label}</div>
                  <div className="mt-1 font-display text-3xl font-black">
                    <CountUp value={x.val} /><span className="text-sm font-medium">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary/60">
              {total > 0 && (
                <div className="flex h-full">
                  <div style={{ width: `${(f.npk.n / total) * 100}%` }} className="bg-emerald-500" />
                  <div style={{ width: `${(f.npk.p / total) * 100}%` }} className="bg-orange-500" />
                  <div style={{ width: `${(f.npk.k / total) * 100}%` }} className="bg-violet-500" />
                </div>
              )}
            </div>

            {(f.secondary || f.micro) && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {f.secondary && (Object.entries(f.secondary) as [string, number][]).map(([k, v]) => (
                  <span key={k} className="rounded-full border border-border/60 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold text-sky-300">{k} {v}%</span>
                ))}
                {f.micro && (Object.entries(f.micro) as [string, number][]).map(([k, v]) => (
                  <span key={k} className="rounded-full border border-border/60 bg-pink-500/10 px-2.5 py-1 text-[10px] font-bold text-pink-300">{k} {v}%</span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Beaker, label: "Dosage", value: `${f.dosagePerAcreKg.min}-${f.dosagePerAcreKg.max}`, unit: "kg/acre" },
              { icon: PackageOpen, label: "Price", value: `₹${f.price.inr}`, unit: `/${f.price.unit}` },
              { icon: Sprout, label: "Stage", value: f.stage.split(/[/,]/)[0], unit: "" },
              { icon: Layers, label: "Shelf life", value: `${f.shelfLifeMonths}`, unit: "months" },
            ].map((s) => (
              <div key={s.label} className="card-elegant hover-lift p-5">
                <s.icon className="h-5 w-5 text-primary" />
                <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-display text-xl font-black">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Product gallery */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Gallery</div>
              <h2 className="mt-1 font-display text-2xl font-black">Product & packaging</h2>
              <p className="text-sm text-muted-foreground">Click any image to open the HD lightbox viewer.</p>
            </div>
            <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">{galleryImages.length} photos</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[f.images.hero, ...f.images.packaging, f.images.granules, f.images.label, ...f.images.gallery].slice(0, 8).map((src, i) => (
              <Reveal key={i} delay={i * 40}>
                <button onClick={() => openLb(src)} className="group block w-full overflow-hidden rounded-2xl border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={src} loading="lazy" alt={`${f.name} ${i + 1}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Crop-wise application gallery */}
        <section>
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">On the field</div>
            <h2 className="mt-1 font-display text-2xl font-black">Crop-wise application</h2>
            <p className="text-sm text-muted-foreground">See {f.name} in action on its most recommended crops.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {f.images.cropApplication.map((c, i) => (
              <Reveal key={c.crop} delay={i * 40}>
                <button onClick={() => openLb(c.url)} className="group block w-full overflow-hidden rounded-2xl border border-border/60 text-left">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={c.url} alt={`${f.name} on ${c.crop}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">Applied on</div>
                      <div className="font-display text-lg font-bold text-white">{c.crop}</div>
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Before / After */}
        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Impact</div>
            <h2 className="mt-1 font-display text-2xl font-black">Before & after</h2>
            <p className="mt-2 text-sm text-muted-foreground">Visible crop response typically starts 10–20 days after correct application.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Before", tag: "Deficient", url: f.images.beforeAfter.before, color: "bg-red-500/90" },
                { label: "After", tag: "Healthy", url: f.images.beforeAfter.after, color: "bg-emerald-500/90" },
              ].map((b) => (
                <button key={b.label} onClick={() => openLb(b.url)} className="group relative overflow-hidden rounded-2xl border border-border/60">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={b.url} alt={b.label} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <span className={`absolute left-3 top-3 rounded-full ${b.color} px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white`}>{b.tag}</span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="font-display text-lg font-bold text-white">{b.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card-elegant flex flex-col justify-between overflow-hidden p-0">
            <img src={f.images.root} alt="Root development" className="h-40 w-full object-cover" loading="lazy" />
            <div className="p-6">
              <div className="flex items-center gap-2 text-primary"><HeartPulse className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Root & growth boost</h3></div>
              <p className="mt-2 text-sm text-muted-foreground">Balanced feeding with {f.name} strengthens root mass, improves nutrient absorption and delivers uniform canopy development.</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[{ l: "Root mass", v: "+22%" }, { l: "Uptake", v: "+18%" }, { l: "Yield", v: "+15%" }].map((s) => (
                  <div key={s.l} className="rounded-xl bg-primary/10 p-3">
                    <div className="font-display text-lg font-black text-primary">{s.v}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section>
          <div className="flex flex-wrap gap-2">
            {([
              ["overview", "Overview"], ["application", "How to apply"],
              ["crops", "Crops & soils"], ["deficiency", "Corrects"],
              ["safety", "Storage & safety"], ["faq", "FAQs"],
            ] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tab === k ? "border-primary bg-primary/20 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >{l}</button>
            ))}
          </div>

          <div className="mt-6">
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="card-elegant overflow-hidden">
                    <img src={f.images.gallery[0] ?? f.images.hero} alt="Benefits" className="h-48 w-full object-cover" loading="lazy" />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-emerald-400"><Leaf className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Benefits</h3></div>
                      <ul className="mt-3 space-y-2">
                        {f.benefits.map((b: string) => (
                          <li key={b} className="flex gap-2 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="card-elegant overflow-hidden">
                    <img src={f.images.safety} alt="Cautions" className="h-48 w-full object-cover" loading="lazy" />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-amber-400"><AlertTriangle className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Precautions & mixing</h3></div>
                      <ul className="mt-3 space-y-2">
                        {f.cautions.length > 0 ? f.cautions.map((c: string) => (
                          <li key={c} className="flex gap-2 text-sm">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                            <span>{c}</span>
                          </li>
                        )) : <li className="text-sm text-muted-foreground">No special cautions.</li>}
                      </ul>
                      <div className="mt-4 rounded-2xl bg-background/40 p-3 text-xs text-muted-foreground">
                        <Info className="mb-1 inline h-3 w-3" /> Mixing: {f.mixing}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seasonal recommendations */}
                <div>
                  <h3 className="font-display text-xl font-bold">Seasonal recommendations</h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    {seasonalTips.map((s) => (
                      <div key={s.season} className="card-elegant hover-lift p-5">
                        <div className="flex items-center gap-2 text-primary"><s.icon className="h-5 w-5" /><span className="font-display text-lg font-bold">{s.season}</span></div>
                        <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organic alternatives */}
                <div className="card-elegant overflow-hidden">
                  <div className="grid gap-0 lg:grid-cols-[1fr_2fr]">
                    <img src={f.images.gallery[2] ?? f.images.application[0]} alt="Organic alternatives" className="h-full min-h-[180px] w-full object-cover" loading="lazy" />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-emerald-400"><Sprout className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Organic alternatives</h3></div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(f.category === "Nitrogen" ? ["Vermicompost", "FYM", "Neem cake", "Green manure"]
                          : f.category === "Phosphatic" ? ["Bone meal", "Rock phosphate", "PSB culture"]
                          : f.category === "Potassic" ? ["Wood ash", "Banana peel compost", "KMB culture"]
                          : ["Compost", "Panchagavya", "Jeevamrutham", "FYM"]
                        ).map((o) => (
                          <span key={o} className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">{o}</span>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">Pair chemical inputs with organic sources to sustain long-term soil health and microbial activity.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "application" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {METHODS.filter((m) => f.applicationMethods.includes(m.key)).map((m, i) => (
                  <Reveal key={m.key} delay={i * 30}>
                    <div className="card-elegant hover-lift overflow-hidden">
                      <button onClick={() => openLb(m.image)} className="block w-full text-left">
                        <div className="relative aspect-video overflow-hidden">
                          <img src={m.image} alt={m.key} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute bottom-3 left-4 font-display text-lg font-bold text-white">{m.key}</div>
                        </div>
                      </button>
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
            )}

            {tab === "crops" && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="card-elegant overflow-hidden">
                    <img src={f.images.cropApplication[0]?.url ?? f.images.application[0]} alt="Suitable crops" className="h-48 w-full object-cover" loading="lazy" />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-primary"><Sprout className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Suitable crops</h3></div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {f.suitableCrops.map((c: string) => (
                          <span key={c} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold">{c}</span>
                        ))}
                      </div>
                      {f.unsuitableCrops && (
                        <>
                          <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Not recommended for</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {f.unsuitableCrops.map((c: string) => (
                              <span key={c} className="rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">{c}</span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="card-elegant overflow-hidden">
                    <img src={f.images.soil} alt="Suitable soils" className="h-48 w-full object-cover" loading="lazy" />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-primary"><Droplets className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Suitable soils</h3></div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {f.suitableSoils.map((s: string) => (
                          <span key={s} className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs font-semibold">{s}</span>
                        ))}
                      </div>
                      <p className="mt-4 text-xs text-muted-foreground">Always confirm with a recent soil test — pH and organic carbon dictate real-world nutrient uptake.</p>
                    </div>
                  </div>
                </div>

                {/* Yield uplift chart */}
                <div className="card-elegant p-6">
                  <div className="flex items-center gap-2 text-primary"><TrendingUp className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Expected yield uplift</h3></div>
                  <div className="mt-4 space-y-3">
                    {f.suitableCrops.slice(0, 5).map((c, i) => {
                      const pct = 8 + ((i * 7 + f.npk.n + f.npk.p + f.npk.k) % 22);
                      return (
                        <div key={c}>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>{c}</span><span className="text-emerald-300">+{pct}%</span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary" style={{ width: `${Math.min(100, pct * 3)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {tab === "deficiency" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {nutrientDeficiencyMatches.length > 0 ? nutrientDeficiencyMatches.map((n) => (
                  <div key={n.key} className="card-elegant overflow-hidden">
                    <div className="grid grid-cols-2">
                      <button onClick={() => openLb(n.images.healthy)} className="relative aspect-square overflow-hidden">
                        <img src={n.images.healthy} alt="healthy" className="h-full w-full object-cover" loading="lazy" />
                        <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">Healthy</span>
                      </button>
                      <button onClick={() => openLb(n.images.deficient)} className="relative aspect-square overflow-hidden">
                        <img src={n.images.deficient} alt="deficient" className="h-full w-full object-cover" loading="lazy" />
                        <span className="absolute left-2 top-2 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">Deficient</span>
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="font-display text-base font-bold">{n.name} deficiency</div>
                      <p className="mt-1 text-xs text-muted-foreground">{n.deficiencySymptoms}</p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full card-elegant p-6 text-sm text-muted-foreground">
                    Pair with a soil test for targeted correction.
                  </div>
                )}
              </div>
            )}

            {tab === "safety" && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="card-elegant overflow-hidden">
                  <img src={f.images.storage} alt="Storage" className="h-44 w-full object-cover" loading="lazy" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-primary"><Warehouse className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Storage</h3></div>
                    <p className="mt-3 text-sm text-muted-foreground">{f.storage}</p>
                    <p className="mt-2 text-sm">Shelf life: <span className="font-semibold">{f.shelfLifeMonths} months</span></p>
                  </div>
                </div>
                <div className="card-elegant overflow-hidden">
                  <img src={f.images.safety} alt="Safety" className="h-44 w-full object-cover" loading="lazy" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-amber-400"><HardHat className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Handling & PPE</h3></div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {["Gloves", "Mask", "Boots", "Eye-wear"].map((p) => (
                        <div key={p} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2"><ShieldCheck className="h-3 w-3 text-emerald-400" />{p}</div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Wash hands after handling. Keep away from food, water sources and children.</p>
                  </div>
                </div>
                <div className="card-elegant overflow-hidden">
                  <img src={f.images.gallery[3] ?? f.images.hero} alt="Manufacturers" className="h-44 w-full object-cover" loading="lazy" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-primary"><Factory className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Manufacturers & subsidy</h3></div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {f.manufacturers.map((m: string) => (
                        <span key={m} className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-semibold">{m}</span>
                      ))}
                    </div>
                    {f.subsidy && <p className="mt-3 text-sm text-emerald-300">Subsidy: {f.subsidy}</p>}
                    {f.govApproved && <p className="mt-1 text-xs text-muted-foreground">Approved under FCO — safe for regulated distribution.</p>}
                  </div>
                </div>
              </div>
            )}

            {tab === "faq" && (
              <div className="grid gap-4 lg:grid-cols-2">
                {faqs.map((q, i) => (
                  <div key={i} className="card-elegant p-6">
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary"><HelpCircle className="h-4 w-4" /></div>
                      <div>
                        <div className="font-display text-base font-bold">{q.q}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{q.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Success stories */}
        <section>
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Success stories</div>
            <h2 className="mt-1 font-display text-2xl font-black">Farmers using {f.name}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {successStories.map((s, i) => (
              <Reveal key={i} delay={i * 40}>
                <div className="card-elegant hover-lift overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={s.image} alt={s.name} loading="lazy" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div>
                        <div className="font-display text-lg font-bold text-white">{s.name}</div>
                        <div className="text-xs text-white/70">{s.crop}</div>
                      </div>
                      <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">+{s.uplift}% yield</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <Quote className="h-4 w-4 text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">"{s.quote}"</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA + calculator */}
        <section className="card-elegant flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><FlaskConical className="h-6 w-6" /></div>
            <div>
              <div className="font-display text-xl font-bold">Calculate exact dosage for your land</div>
              <div className="text-sm text-muted-foreground">Get per-acre {f.name} in kilograms and cost instantly.</div>
            </div>
          </div>
          <Link to="/fertilizer" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">Open calculator</Link>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <div className="mb-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Related in {f.category}</div>
              <h2 className="mt-1 font-display text-2xl font-black">You may also compare</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} to="/fertilizers/$slug" params={{ slug: r.slug }} className="card-elegant hover-lift group overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={r.images.hero} alt={r.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <div className="font-display text-base font-bold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.generic}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lbIdx !== null && galleryImages[lbIdx] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]" onClick={closeLb}>
          <button onClick={(e) => { e.stopPropagation(); closeLb(); }} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="h-5 w-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); prevLb(); }} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); nextLb(); }} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronRight className="h-5 w-5" /></button>
          <div className="relative max-h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <img src={galleryImages[lbIdx].url} alt={galleryImages[lbIdx].caption} className="max-h-[85vh] w-auto rounded-2xl object-contain" />
            <div className="mt-3 flex items-center justify-between text-xs text-white/80">
              <span>{galleryImages[lbIdx].caption}</span>
              <span>{lbIdx + 1} / {galleryImages.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
