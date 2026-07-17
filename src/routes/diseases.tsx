import { createFileRoute, Link } from "@tanstack/react-router";
import { CROP_LIST } from "@/data/crops";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/diseases")({
  head: () => ({
    meta: [
      { title: "Disease Library — KrishiSense" },
      { name: "description", content: "HD identification for common crop diseases with organic and chemical controls." },
    ],
  }),
  component: Diseases,
});

function Diseases() {
  // Preserve isolation: enumerate diseases per-crop; render crop context on each card.
  const items = CROP_LIST.flatMap((c) => c.diseases.map((d) => ({ crop: c, d })));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Library</span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-6xl">Disease Identification</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Every disease stays scoped to its own crop — no mixing of pathogens or pesticides across species.</p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ crop, d }, i) => (
          <Reveal key={crop.slug + d.name} delay={i * 40}>
            <article className="card-elegant hover-lift overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={crop.image} alt={crop.name} className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-background/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                  {crop.emoji} {crop.name}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-xl font-bold">{d.name}</h3>
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
              <div className="space-y-2 p-5 text-sm">
                <div><span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Symptoms</span><p className="mt-0.5">{d.symptoms}</p></div>
                <div><span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Organic</span><p className="mt-0.5 text-muted-foreground">{d.organic}</p></div>
                <div><span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Chemical</span><p className="mt-0.5 text-muted-foreground">{d.chemical}</p></div>
                <Link to="/crops/$slug" params={{ slug: crop.slug }} className="story-link inline-block text-primary">Open {crop.name} advisory →</Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
