import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CROP_LIST, CROPS } from "@/data/crops";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { HeroBanner } from "@/components/HeroBanner";
import { Beaker } from "lucide-react";
import heroImg from "@/assets/heroes/fertilizer.jpg";

export const Route = createFileRoute("/fertilizer")({
  head: () => ({
    meta: [
      { title: "Fertilizer Calculator — KrishiSense" },
      { name: "description", content: "Enter your land size and get exact Urea, DAP, Potash, Zinc, Gypsum and Compost dosages per crop." },
    ],
  }),
  component: Fertilizer,
});

function Fertilizer() {
  const [slug, setSlug] = useState("rice");
  const [size, setSize] = useState(2);
  const [unit, setUnit] = useState<"acre" | "hectare">("acre");
  const crop = CROPS[slug];
  const totalAcres = unit === "acre" ? size : size * 2.471;

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="Tool"
        title="Fertilizer Calculator"
        description="Precision dosage for your acres — every crop uses its own isolated schedule."
      />
      <div className="mx-auto max-w-7xl px-6 py-16">


      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="card-elegant p-6">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Crop</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {CROP_LIST.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSlug(c.slug)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  slug === c.slug
                    ? "border-primary bg-primary/15"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.emoji} {c.name.split(" ")[0]}
              </button>
            ))}
          </div>

          <label className="mt-6 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Land size</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={size}
              onChange={(e) => setSize(Math.max(0.1, Number(e.target.value) || 0))}
              className="flex-1 rounded-xl border border-border/60 bg-background/40 px-3 py-2 outline-none focus:border-primary"
            />
            <div className="flex rounded-xl border border-border/60 p-1 text-xs">
              {(["acre", "hectare"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`rounded-lg px-3 py-1 font-medium capitalize transition ${
                    unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">= {totalAcres.toFixed(2)} acres</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {crop.fertilizer.map((f, i) => (
            <Reveal key={f.name} delay={i * 60}>
              <div className="card-elegant hover-lift p-6">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
                    <Beaker className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{f.stage}</span>
                </div>
                <div className="mt-4 text-sm font-semibold">{f.name}</div>
                <div className="mt-1 font-display text-4xl font-black tabular-nums">
                  <CountUp value={Math.round(f.perAcreKg * totalAcres)} />
                  <span className="ml-1 text-base font-medium text-muted-foreground">kg</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {f.perAcreKg} kg/acre · {(f.perAcreKg * 2.471).toFixed(0)} kg/hectare
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
