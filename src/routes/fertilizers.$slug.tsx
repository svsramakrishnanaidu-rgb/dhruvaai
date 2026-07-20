import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { FERTILIZERS_BY_SLUG, FERTILIZERS, NUTRIENTS, METHODS } from "@/data/fertilizers";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import {
  ArrowLeft, Beaker, ShieldCheck, PackageOpen, Sprout, Droplets,
  AlertTriangle, Factory, Info, Layers,
} from "lucide-react";

export const Route = createFileRoute("/fertilizers/$slug")({
  head: ({ params }) => {
    const f = FERTILIZERS_BY_SLUG[params.slug];
    if (!f) return { meta: [{ title: "Fertilizer not found — KrishiSense" }] };
    return {
      meta: [
        { title: `${f.name} — Complete dossier · KrishiSense` },
        { name: "description", content: `${f.name} (${f.generic}): NPK ${f.npk.n}-${f.npk.p}-${f.npk.k}, application methods, dosage, deficiency correction and crop compatibility.` },
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

function FertilizerDetail() {
  const f = Route.useLoaderData();
  const [tab, setTab] = useState<"overview" | "application" | "crops" | "deficiency" | "safety">("overview");
  const total = f.npk.n + f.npk.p + f.npk.k;
  const related = FERTILIZERS.filter((x) => x.category === f.category && x.slug !== f.slug).slice(0, 3);

  return (
    <div className="pb-24">
      {/* Cinematic header */}
      <div className="relative h-[52vh] min-h-[420px] w-full overflow-hidden">
        <img src={f.images.hero} alt={f.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
          <Link
            to="/fertilizers"
            className="inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Fertilizer library
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
              {f.category}
            </span>
            <span className="rounded-full bg-background/70 px-3 py-1 text-[10px] font-semibold backdrop-blur">
              {f.form}
            </span>
            {f.govApproved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                <ShieldCheck className="h-3 w-3" /> Gov approved
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-5xl font-black tracking-tight md:text-6xl">{f.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{f.generic}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 space-y-14">
        {/* NPK dial + stats */}
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
                    <CountUp value={x.val} />
                    <span className="text-sm font-medium">%</span>
                  </div>
                </div>
              ))}
            </div>
            {/* NPK bar */}
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
                  <span key={k} className="rounded-full border border-border/60 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold text-sky-300">
                    {k} {v}%
                  </span>
                ))}
                {f.micro && (Object.entries(f.micro) as [string, number][]).map(([k, v]) => (
                  <span key={k} className="rounded-full border border-border/60 bg-pink-500/10 px-2.5 py-1 text-[10px] font-bold text-pink-300">
                    {k} {v}%
                  </span>
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
              <div key={s.label} className="card-elegant p-5">
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
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[f.images.hero, ...f.images.packaging, f.images.granules, f.images.label].slice(0, 6).map((src, i) => (
              <Reveal key={i} delay={i * 40}>
                <div className="group overflow-hidden rounded-2xl border border-border/60">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={src} loading="lazy" alt={`${f.name} ${i + 1}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Tabs */}
        <section>
          <div className="flex flex-wrap gap-2">
            {([
              ["overview", "Overview"], ["application", "How to apply"],
              ["crops", "Crops & soils"], ["deficiency", "Corrects"],
              ["safety", "Storage & safety"],
            ] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tab === k ? "border-primary bg-primary/20 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card-elegant p-6">
                  <h3 className="font-display text-lg font-bold">Benefits</h3>
                  <ul className="mt-3 space-y-2">
                    {f.benefits.map((b) => (
                      <li key={b} className="flex gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-elegant p-6">
                  <h3 className="font-display text-lg font-bold">Cautions</h3>
                  <ul className="mt-3 space-y-2">
                    {f.cautions.length > 0 ? f.cautions.map((c) => (
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
            )}

            {tab === "application" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {METHODS.filter((m) => f.applicationMethods.includes(m.key)).map((m, i) => (
                  <Reveal key={m.key} delay={i * 30}>
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
            )}

            {tab === "crops" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card-elegant p-6">
                  <div className="flex items-center gap-2 text-primary"><Sprout className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Suitable crops</h3></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {f.suitableCrops.map((c) => (
                      <span key={c} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold">{c}</span>
                    ))}
                  </div>
                  {f.unsuitableCrops && (
                    <>
                      <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Not recommended for</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {f.unsuitableCrops.map((c) => (
                          <span key={c} className="rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">{c}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="card-elegant p-6">
                  <div className="flex items-center gap-2 text-primary"><Droplets className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Suitable soils</h3></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {f.suitableSoils.map((s) => (
                      <span key={s} className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs font-semibold">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "deficiency" && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {NUTRIENTS.filter((n) => n.sources.some((s) => s.toLowerCase().includes(f.name.split(" ")[0].toLowerCase()))).map((n) => (
                  <div key={n.key} className="card-elegant overflow-hidden">
                    <div className="grid grid-cols-2">
                      <img src={n.images.healthy} alt="healthy" className="aspect-square w-full object-cover" loading="lazy" />
                      <img src={n.images.deficient} alt="deficient" className="aspect-square w-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <div className="font-display text-base font-bold">{n.name} deficiency</div>
                      <p className="mt-1 text-xs text-muted-foreground">{n.deficiencySymptoms}</p>
                    </div>
                  </div>
                ))}
                {NUTRIENTS.filter((n) => n.sources.some((s) => s.toLowerCase().includes(f.name.split(" ")[0].toLowerCase()))).length === 0 && (
                  <div className="col-span-full card-elegant p-6 text-sm text-muted-foreground">
                    This fertilizer complements broader crop nutrition — pair it with a soil test for targeted correction.
                  </div>
                )}
              </div>
            )}

            {tab === "safety" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card-elegant p-6">
                  <div className="flex items-center gap-2 text-primary"><Factory className="h-4 w-4" /><h3 className="font-display text-lg font-bold">Manufacturers</h3></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {f.manufacturers.map((m) => (
                      <span key={m} className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-semibold">{m}</span>
                    ))}
                  </div>
                </div>
                <div className="card-elegant p-6">
                  <h3 className="font-display text-lg font-bold">Storage & shelf life</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{f.storage}</p>
                  <p className="mt-2 text-sm">Shelf life: <span className="font-semibold">{f.shelfLifeMonths} months</span></p>
                  {f.subsidy && <p className="mt-2 text-sm text-emerald-300">Subsidy: {f.subsidy}</p>}
                </div>
              </div>
            )}
          </div>
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
                <Link
                  key={r.slug}
                  to="/fertilizers/$slug"
                  params={{ slug: r.slug }}
                  className="card-elegant hover-lift group overflow-hidden"
                >
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
    </div>
  );
}
