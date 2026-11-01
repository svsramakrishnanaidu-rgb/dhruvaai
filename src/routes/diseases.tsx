import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CROP_LIST } from "@/data/crops";
import { DISEASE_DATABASE } from "@/data/diseases";
import { Disease, DiseaseSeverity, DiseaseCategory } from "@/data/diseases/types";
import { Reveal } from "@/components/Reveal";
import { Search, Info, X, ChevronRight, AlertTriangle, Shield, Thermometer, CloudRain, Zap, Clock, TrendingDown, HelpCircle, Book, ArrowLeft } from "lucide-react";
import { T } from "@/lib/translate-cache";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/diseases")({
  head: () => ({
    meta: [
      { title: "Disease Intelligence Hub — DHRUVA" },
      { name: "description", content: "Comprehensive India-wide crop disease library with identification, prevention, and treatment protocols." },
    ],
  }),
  component: Diseases,
});

function SeverityBadge({ severity }: { severity: DiseaseSeverity }) {
  const styles = {
    Low: "bg-green-500/10 text-green-500 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    Critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function Diseases() {
  const [search, setSearch] = useState("");
  const [selectedCropSlug, setSelectedCropSlug] = useState<string | null>(null);
  const [selectedDiseaseSlug, setSelectedDiseaseSlug] = useState<string | null>(null);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<DiseaseCategory | "All">("All");
  const [severityFilter, setSeverityFilter] = useState<DiseaseSeverity | "All">("All");

  const filteredCrops = useMemo(() => {
    if (!search.trim()) return CROP_LIST;
    const q = search.toLowerCase();
    return CROP_LIST.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.scientificName.toLowerCase().includes(q) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(q))) ||
      (c.localNames && Object.values(c.localNames).some(v => v?.toLowerCase().includes(q)))
    );
  }, [search]);

  const diseasesForCrop = useMemo(() => {
    if (!selectedCropSlug) return [];
    let list = DISEASE_DATABASE.filter(d => d.affectedCrops.includes(selectedCropSlug));
    
    if (categoryFilter !== "All") {
      list = list.filter(d => d.category === categoryFilter);
    }
    if (severityFilter !== "All") {
      list = list.filter(d => d.severity === severityFilter);
    }
    
    return list;
  }, [selectedCropSlug, categoryFilter, severityFilter]);

  const selectedDisease = useMemo(() => 
    DISEASE_DATABASE.find(d => d.slug === selectedDiseaseSlug)
  , [selectedDiseaseSlug]);

  const selectedCrop = useMemo(() => 
    CROP_LIST.find(c => c.slug === selectedCropSlug)
  , [selectedCropSlug]);

  // UI Sections
  if (selectedDiseaseSlug && selectedDisease) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 pb-32">
        <button 
          onClick={() => setSelectedDiseaseSlug(null)}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </button>

        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge severity={selectedDisease.severity} />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/60">{selectedDisease.category}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-black md:text-6xl tracking-tight"><T>{selectedDisease.name}</T></h1>
          <p className="mt-2 text-lg italic text-muted-foreground">{selectedDisease.scientificName}</p>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            {/* Gallery */}
            <section>
              <div className="overflow-hidden rounded-3xl border border-border/40 shadow-2xl">
                <img 
                  src={selectedDisease.images[0]} 
                  alt={selectedDisease.name}
                  className="aspect-video w-full object-cover"
                />
              </div>
            </section>

            {/* Symptoms */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Disease Symptoms</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-secondary/30 p-5 border border-border/20">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Early Stage</span>
                  <p className="mt-2 text-sm leading-relaxed"><T>{selectedDisease.symptoms.early}</T></p>
                </div>
                <div className="rounded-2xl bg-secondary/30 p-5 border border-border/20">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">Mid Stage</span>
                  <p className="mt-2 text-sm leading-relaxed"><T>{selectedDisease.symptoms.mid}</T></p>
                </div>
                <div className="rounded-2xl bg-secondary/30 p-5 border border-border/20">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Advanced</span>
                  <p className="mt-2 text-sm leading-relaxed"><T>{selectedDisease.symptoms.advanced}</T></p>
                </div>
              </div>
            </section>

            {/* Management */}
            <section className="space-y-8">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Management Strategy</h2>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-border/40 bg-background/40 p-6 md:p-8 backdrop-blur">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <Zap className="h-4 w-4 text-primary" /> Chemical Treatment
                  </h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    {selectedDisease.chemicalTreatment.map((t, idx) => (
                      <div key={idx} className="space-y-3 rounded-2xl bg-secondary/50 p-4">
                        <div className="text-sm font-bold text-primary"><T>{t.activeIngredient}</T></div>
                        <div className="text-xs text-muted-foreground">Dosage: <T>{t.dosage}</T></div>
                        <div className="text-xs text-muted-foreground">Method: <T>{t.applicationMethod}</T></div>
                        <div className="text-xs text-muted-foreground">Timing: <T>{t.timing}</T></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-6 backdrop-blur">
                    <h3 className="text-lg font-bold text-green-500">Organic Controls</h3>
                    <ul className="mt-4 space-y-2">
                      {selectedDisease.organicTreatment.map((t, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-foreground/90">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-green-500" />
                          <T>{t}</T>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 backdrop-blur">
                    <h3 className="text-lg font-bold text-primary">Prevention</h3>
                    <ul className="mt-4 space-y-2">
                      {selectedDisease.prevention.map((t, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-foreground/90">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <T>{t}</T>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ & Tips */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Common Questions</h2>
                </div>
                {selectedDisease.faqs.map((f, idx) => (
                  <div key={idx} className="rounded-2xl border border-border/40 p-4">
                    <div className="text-sm font-bold"><T>{f.question}</T></div>
                    <div className="mt-2 text-xs leading-relaxed text-muted-foreground"><T>{f.answer}</T></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Expert Tips</h2>
                </div>
                <div className="rounded-3xl bg-secondary/30 p-6">
                  <ul className="space-y-3">
                    {selectedDisease.expertTips.map((t, idx) => (
                      <li key={idx} className="text-sm italic text-foreground/80">
                        <T>{`"${t}"`}</T>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-3xl border border-border/40 bg-secondary/20 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Impact Analysis</h3>
                <div className="mt-6 space-y-6">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="h-5 w-5 shrink-0 text-red-500" />
                    <div>
                      <div className="text-xs font-bold text-muted-foreground">Est. Yield Loss</div>
                      <div className="text-lg font-bold"><T>{selectedDisease.yieldLossEstimation}</T></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <div className="text-xs font-bold text-muted-foreground">Recovery Timeline</div>
                      <div className="text-lg font-bold"><T>{selectedDisease.recoveryTimeline}</T></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/40 bg-background p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Risk Factors</h3>
                <div className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <CloudRain className="h-3.5 w-3.5" /> Favorable Weather
                    </div>
                    <p className="text-xs leading-relaxed"><T>{selectedDisease.environmentalConditions}</T></p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5" /> Early Warning
                    </div>
                    <p className="text-xs leading-relaxed"><T>{selectedDisease.earlyWarningSigns}</T></p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Safety First</h3>
                <ul className="mt-4 space-y-2">
                  {selectedDisease.safetyPrecautions.map((s, idx) => (
                    <li key={idx} className="flex gap-2 text-xs leading-relaxed">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                      <T>{s}</T>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 font-[Plus Jakarta Sans]">
      <Reveal>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-web-sage">Disease Intelligence</span>
        <h1 className="mt-2 font-[Unbounded] text-5xl font-black tracking-tight text-web-gold md:text-6xl">Pathogen Registry</h1>
        <p className="mt-3 max-w-xl text-xs font-bold uppercase tracking-widest text-web-sage/80">Select your crop to access India's most comprehensive database of agricultural diseases, pests, and clinical advisories.</p>
      </Reveal>

      <div className="mt-12 space-y-10">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-web-sage" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops or diseases..."
            className="w-full rounded-2xl border border-web-leaf/10 bg-web-bg-midnight/40 py-3.5 pl-11 pr-4 text-xs font-bold text-web-mist backdrop-blur transition-all focus:border-web-emerald/50"
          />
        </div>

        {!selectedCropSlug ? (
          <Reveal delay={100}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {filteredCrops.map((c, i) => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCropSlug(c.slug)}
                  className="group relative overflow-hidden rounded-3xl border border-web-leaf/10 bg-web-bg-midnight/30 p-6 text-center transition-all hover:border-web-emerald/40 hover:bg-web-emerald/10 hover:shadow-xl"
                >
                  <div className="text-4xl transition-transform duration-300 group-hover:scale-125">{c.emoji}</div>
                  <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-web-sage group-hover:text-web-gold">
                    <T>{c.name}</T>
                  </div>
                </button>
              ))}
            </div>
          </Reveal>
        ) : (
          <Reveal delay={100}>
            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-web-emerald/20 bg-web-emerald/5 p-6 md:p-8 backdrop-blur">
                <div className="flex items-center gap-6">
                  <span className="text-5xl">{selectedCrop?.emoji}</span>
                  <div>
                    <h2 className="font-[Unbounded] text-3xl font-black uppercase tracking-tight text-web-gold">
                      <T>{selectedCrop?.name || ""}</T>
                    </h2>
                    <p className="text-sm italic text-muted-foreground">{selectedCrop?.scientificName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCropSlug(null)}
                  className="flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-6 py-2.5 text-xs font-bold transition hover:bg-foreground hover:text-background"
                >
                  <X className="h-3 w-3" /> Change Crop
                </button>
              </div>

              {/* Filters for Diseases */}
              <div className="flex flex-wrap gap-2">
                {(["All", "Fungal", "Bacterial", "Viral", "Nematode"] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                      categoryFilter === cat ? "bg-web-gold text-web-bg-midnight" : "bg-web-bg-midnight/40 border border-web-leaf/10 text-web-sage hover:bg-web-bg-midnight/60"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {diseasesForCrop.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {diseasesForCrop.map((d, i) => (
                    <motion.article 
                      key={d.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedDiseaseSlug(d.slug)}
                      className="web-glass group cursor-pointer overflow-hidden rounded-[2rem] border-web-leaf/10 bg-web-bg-midnight/30 shadow-sm transition-all hover:border-web-emerald/40 hover:shadow-2xl"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img 
                          src={d.images[0]} 
                          alt={d.name} 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                        <div className="absolute left-4 top-4">
                          <SeverityBadge severity={d.severity} />
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{d.category}</div>
                        <h3 className="mt-1 font-display text-xl font-bold tracking-tight"><T>{d.name}</T></h3>
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          <T>{d.symptoms.early}</T>
                        </p>
                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">View Protocol</span>
                          <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-border/60 py-32 text-muted-foreground">
                  <Info className="mb-4 h-12 w-12 opacity-20" />
                  <p className="text-lg font-medium">No pathogens found for this criteria.</p>
                  <button 
                    onClick={() => { setCategoryFilter("All"); setSeverityFilter("All"); }}
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
