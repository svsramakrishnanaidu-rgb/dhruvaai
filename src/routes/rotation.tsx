import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CROP_LIST, CROPS } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import { HeroBanner } from "@/components/HeroBanner";
import { Recycle, ArrowDown, Sprout, CalendarDays, Timer } from "lucide-react";
import heroImg from "@/assets/heroes/rotation.jpg";

export const Route = createFileRoute("/rotation")({
  head: () => ({
    meta: [
      { title: "Crop Rotation — DHRUVA" },
      { name: "description", content: "Animated rotation wheel to plan sustainable multi-season cropping cycles." },
    ],
  }),
  component: Rotation,
});

function Rotation() {
  const [slug, setSlug] = useState("rice");
  const crop = CROPS[slug];
  const wheel = useMemo(
    () => [
      { name: crop.name, emoji: (crop as any).emoji ?? "🌾", meta: "Current" },
      ...crop.rotation.map((r) => ({ name: r.crop, emoji: guessEmoji(r.crop), meta: `${r.season} · ${r.gapDays}d gap` })),
    ],
    [crop]
  );
  const N = wheel.length;

  return (
    <div className="relative min-h-screen bg-web-bg-midnight font-[Plus Jakarta Sans]">
      <HeroBanner
        image={heroImg}
        eyebrow="Sustainability"
        title="Crop Rotation Wheel"
        description="Break pest cycles, restore soil nitrogen, and diversify income. Pick a crop to see the recommended sequence."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16">
        {/* Crop picker — horizontal scroll on mobile, wrap on desktop */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-2 pb-2 sm:flex-wrap sm:pb-0">
            {CROP_LIST.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSlug(c.slug)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  slug === c.slug
                    ? "border-web-emerald bg-web-emerald/20 text-web-mist"
                    : "border-web-leaf/10 text-web-sage hover:bg-web-emerald/10 hover:text-web-gold"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* MOBILE — vertical journey timeline */}
        <div className="mt-8 sm:hidden">
          <div className="card-elegant relative overflow-hidden p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: "conic-gradient(from 0deg, var(--leaf), var(--sunrise), var(--sky), var(--leaf))",
                filter: "blur(60px)",
              }}
            />
            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
                  <Recycle className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Rotation cycle</div>
                  <div className="truncate font-display text-lg font-bold">{crop.name} · {N} stages</div>
                </div>
              </div>

              <ol className="relative space-y-3">
                {/* vertical guideline */}
                <span
                  aria-hidden
                  className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-primary/40"
                />
                {wheel.map((w, i) => (
                  <li
                    key={i}
                    className="relative flex gap-3"
                    style={{ animation: `scale-in 0.45s var(--ease-spring) ${i * 70}ms both` }}
                  >
                    <div className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border/60 bg-background text-xl shadow-sm">
                      {w.emoji}
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl border border-border/60 bg-background/60 p-3 backdrop-blur">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                            Stage {i + 1}
                          </div>
                          <div className="truncate font-semibold">{w.name}</div>
                        </div>
                        {i === 0 ? (
                          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Start
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 truncate text-[11px] text-muted-foreground">{w.meta}</div>
                    </div>
                  </li>
                ))}
                <li className="relative flex gap-3 pl-1">
                  <div className="relative z-10 grid h-11 w-11 shrink-0 place-items-center text-muted-foreground">
                    <ArrowDown className="h-4 w-4 rotate-180" />
                  </div>
                  <div className="flex-1 self-center text-[11px] uppercase tracking-widest text-muted-foreground">
                    Cycle repeats
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Benefits list — mobile */}
          <div className="mt-6">
            <h2 className="font-display text-xl font-bold">Why rotate from {crop.name}?</h2>
            <div className="mt-3 space-y-3">
              {crop.rotation.map((r, i) => (
                <Reveal key={r.crop} delay={i * 60}>
                  <div className="card-elegant p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="min-w-0 flex-1 truncate text-base font-semibold">{r.crop}</h3>
                      <div className="flex shrink-0 gap-1 text-[10px]">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5">
                          <CalendarDays className="h-3 w-3" /> {r.season}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5">
                          <Timer className="h-3 w-3" /> {r.gapDays}d
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.benefit}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Quick tips strip */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { icon: Sprout, label: "Soil health" },
              { icon: Recycle, label: "Break pests" },
              { icon: CalendarDays, label: "Season fit" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="card-elegant grid place-items-center gap-1 p-3 text-center">
                <Icon className="h-4 w-4 text-primary" />
                <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP — original wheel */}
        <div className="mt-12 hidden gap-10 sm:grid lg:grid-cols-[1fr_1.2fr] font-[Plus Jakarta Sans]">
          <div className="relative aspect-square">
            <div
              className="absolute inset-4 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, var(--web-emerald), var(--web-gold), var(--web-leaf), var(--web-emerald))",
                filter: "blur(60px)",
                opacity: 0.2,
                animation: "gradient-shift 14s linear infinite",
              }}
            />
            <div
              className="absolute inset-0 rounded-full border border-web-leaf/20"
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
                      className="web-glass hover-lift grid w-40 place-items-center gap-1 p-4 text-center border-web-leaf/10"
                      style={{ animation: `scale-in 0.5s var(--ease-spring) ${i * 100}ms both` }}
                    >
                      <div className="text-3xl">{w.emoji ?? "🌱"}</div>
                      <div className="font-[Unbounded] text-sm font-black text-web-mist uppercase">{w.name}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-web-sage">{w.meta ?? (w as any).season}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-web-emerald to-web-emerald/50 p-6 shadow-xl shadow-web-emerald/20">
              <Recycle className="h-8 w-8 text-web-mist" />
            </div>
          </div>

          <div>
            <h2 className="font-[Unbounded] text-2xl font-black text-web-mist">Why rotate from {crop.name}?</h2>
            <div className="mt-4 space-y-3">
              {crop.rotation.map((r, i) => (
                <Reveal key={r.crop} delay={i * 80}>
                  <div className="web-glass p-5 border-web-leaf/10 hover:border-web-emerald/30 transition-all">
                    <div className="flex items-center justify-between">
                      <h3 className="font-[Unbounded] text-base font-black text-web-mist uppercase tracking-tight">{r.crop}</h3>
                      <div className="flex gap-1 text-[9px] font-black uppercase tracking-widest">
                        <span className="rounded-full border border-web-leaf/20 bg-web-bg-midnight/40 px-2 py-0.5 text-web-sage">{r.season}</span>
                        <span className="rounded-full border border-web-leaf/20 bg-web-bg-midnight/40 px-2 py-0.5 text-web-sage">{r.gapDays}d</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs font-bold leading-relaxed text-web-sage">{r.benefit}</p>
                  </div>
                </Reveal>
              ))}
            </div>
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
