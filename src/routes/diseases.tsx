import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CROP_LIST } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import { diseaseImage } from "@/lib/disease-image";
import { Search, Info, X } from "lucide-react";
import { T } from "@/lib/translate-cache";

export const Route = createFileRoute("/diseases")({
  head: () => ({
    meta: [
      { title: "Disease Library — Krish Sense" },
      { name: "description", content: "HD identification for common crop diseases with organic and chemical controls." },
    ],
  }),
  component: Diseases,
});

function Diseases() {
  const [search, setSearch] = useState("");
  const [selectedCropSlug, setSelectedCropSlug] = useState<string | null>(null);

  const filteredCrops = useMemo(() => {
    if (!search.trim()) return CROP_LIST;
    const q = search.toLowerCase();
    return CROP_LIST.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.scientificName.toLowerCase().includes(q) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  }, [search]);

  const selectedCrop = useMemo(() => 
    CROP_LIST.find(c => c.slug === selectedCropSlug) || null
  , [selectedCropSlug]);

  const diseases = useMemo(() => {
    if (!selectedCrop) return [];
    return selectedCrop.diseases;
  }, [selectedCrop]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Library</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">Disease Identification</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Select a crop to view its specific diseases. We maintain strict isolation to ensure accurate advisory.</p>
      </Reveal>

      {/* Crop Selector Interface */}
      <div className="mt-10 space-y-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops (e.g. Rice, Cotton, Tomato)..."
            className="w-full rounded-2xl border border-border/40 bg-background/40 py-3 pl-11 pr-4 text-sm backdrop-blur transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {!selectedCropSlug ? (
          <Reveal delay={100}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {filteredCrops.map((c, i) => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCropSlug(c.slug)}
                  className="card-elegant flex flex-col items-center justify-center gap-2 p-4 text-center transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-wider"><T>{c.name}</T></span>
                </button>
              ))}
            </div>
            {filteredCrops.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Search className="mb-4 h-12 w-12 opacity-20" />
                <p>No crops found matching "{search}"</p>
              </div>
            )}
          </Reveal>
        ) : (
          <Reveal delay={100}>
            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{selectedCrop?.emoji}</span>
                  <div>
                    <h2 className="font-display text-2xl font-bold uppercase tracking-tight"><T>{selectedCrop?.name}</T></h2>
                    <p className="text-xs italic text-muted-foreground">{selectedCrop?.scientificName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCropSlug(null)}
                  className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-xs font-bold transition hover:bg-foreground hover:text-background"
                >
                  <X className="h-3 w-3" /> Change Crop
                </button>
              </div>

              {diseases.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {diseases.map((d, i) => (
                    <Reveal key={selectedCropSlug + d.name} delay={i * 60}>
                      <article className="card-elegant hover-lift overflow-hidden p-0">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img 
                            src={diseaseImage(d.name)} 
                            alt={`${d.name} on ${selectedCrop?.name}`} 
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" 
                            loading="lazy" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-4">
                            <h3 className="font-display text-xl font-bold"><T>{d.name}</T></h3>
                            <div className="mt-1 flex gap-0.5" aria-label={`Severity ${d.severity}/5`}>
                              {[1, 2, 3, 4, 5].map((i2) => (
                                <span
                                  key={i2}
                                  className="h-1.5 w-4 rounded-full"
                                  style={{ background: i2 <= d.severity ? "var(--gradient-primary)" : "var(--muted)" }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4 p-5 text-sm">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">Symptoms</span>
                            <p className="mt-1 leading-relaxed text-foreground/90"><T>{d.symptoms}</T></p>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Organic Control</span>
                            <p className="mt-1 text-muted-foreground"><T>{d.organic}</T></p>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Chemical Solution</span>
                            <p className="mt-1 text-muted-foreground"><T>{d.chemical}</T></p>
                          </div>
                          <Link to="/crops/$slug" params={{ slug: selectedCropSlug! }} className="story-link mt-2 inline-block text-primary">
                            Full {selectedCrop?.name} Advisory →
                          </Link>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 py-20 text-muted-foreground">
                  <Info className="mb-4 h-12 w-12 opacity-20" />
                  <p>No disease information currently available for this crop.</p>
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
