import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CROP_LIST, CROPS } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import { HeroBanner } from "@/components/HeroBanner";
import { Recycle } from "lucide-react";
import heroImg from "@/assets/heroes/rotation.jpg";

export const Route = createFileRoute("/rotation")({
  head: () => ({
    meta: [
      { title: "Crop Rotation — KrishiSense" },
      { name: "description", content: "Animated rotation wheel to plan sustainable multi-season cropping cycles." },
    ],
  }),
  component: Rotation,
});

function Rotation() {
  const [slug, setSlug] = useState("rice");
  const crop = CROPS[slug];
  const wheel = useMemo(() => [crop, ...crop.rotation.map((r) => ({ name: r.crop, emoji: guessEmoji(r.crop), meta: `${r.season} · ${r.gapDays}d gap` }))], [crop]);
  const N = wheel.length;

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="Sustainability"
        title="Crop Rotation Wheel"
        description="Break pest cycles, restore soil nitrogen, and diversify income. Pick a crop to see the recommended sequence."
      />
      <div className="mx-auto max-w-7xl px-6 py-16">


      <div className="mt-8 flex flex-wrap gap-2">
        {CROP_LIST.map((c) => (
          <button
            key={c.slug}
            onClick={() => setSlug(c.slug)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              slug === c.slug
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="relative aspect-square">
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, var(--leaf), var(--sunrise), var(--sky), var(--leaf))",
              filter: "blur(40px)",
              opacity: 0.35,
              animation: "gradient-shift 14s linear infinite",
            }}
          />
          <div
            className="absolute inset-0 rounded-full border border-border/60"
            style={{ animation: "float-y 6s ease-in-out infinite" }}
          />
          <div className="absolute inset-0">
            {wheel.map((w: any, i) => {
              const angle = (i / N) * 360 - 90;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translate(180px) rotate(${-angle}deg)`,
                  }}
                >
                  <div
                    className="card-elegant hover-lift grid w-40 place-items-center gap-1 p-4 text-center"
                    style={{ animation: `scale-in 0.5s var(--ease-spring) ${i * 100}ms both` }}
                  >
                    <div className="text-3xl">{w.emoji ?? "🌱"}</div>
                    <div className="font-semibold">{w.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{w.meta ?? w.season}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary to-accent p-6 shadow-xl">
            <Recycle className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold">Why rotate from {crop.name}?</h2>
          <div className="mt-4 space-y-3">
            {crop.rotation.map((r, i) => (
              <Reveal key={r.crop} delay={i * 80}>
                <div className="card-elegant p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{r.crop}</h3>
                    <div className="flex gap-1 text-xs">
                      <span className="rounded-full border border-border/60 px-2 py-0.5">{r.season}</span>
                      <span className="rounded-full border border-border/60 px-2 py-0.5">{r.gapDays}d</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.benefit}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function guessEmoji(name: string) {
  const map: Record<string, string> = {
    "Black Gram": "🫘", "Bengal Gram": "🫘", Groundnut: "🥜", Maize: "🌽",
    Sorghum: "🌾", Rice: "🌾", Ragi: "🌾", Chickpea: "🫛", Cotton: "🌱",
  };
  return map[name] ?? "🌱";
}
