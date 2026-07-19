import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Cloud, Cpu, Ship, Landmark, Sprout, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { useT } from "@/lib/i18n";
import { CROP_LIST } from "@/data/crops";

export const Route = createFileRoute("/paddy-future")({
  head: () => ({
    meta: [
      { title: "The Future of Paddy — KrishiSense" },
      { name: "description", content: "Yield, price, climate and technology outlook for India's paddy crop through 2030." },
    ],
  }),
  component: PaddyFuture,
});

// MSP progression (Rs / quintal, common paddy). Historical + projected.
const MSP_SERIES = [
  { y: "2019", v: 1815 },
  { y: "2020", v: 1868 },
  { y: "2021", v: 1940 },
  { y: "2022", v: 2040 },
  { y: "2023", v: 2183 },
  { y: "2024", v: 2300 },
  { y: "2025", v: 2389 },
  { y: "2026", v: 2495, proj: true },
  { y: "2028", v: 2720, proj: true },
  { y: "2030", v: 2980, proj: true },
];

const YIELD_SERIES = [
  { y: "2019", v: 2659 },
  { y: "2021", v: 2789 },
  { y: "2023", v: 2809 },
  { y: "2025", v: 2905 },
  { y: "2028", v: 3120, proj: true },
  { y: "2030", v: 3280, proj: true },
];

function PaddyFuture() {
  const t = useT();
  const rice = CROP_LIST.find((c) => c.slug === "rice");
  const maxMsp = Math.max(...MSP_SERIES.map((d) => d.v));
  const maxYield = Math.max(...YIELD_SERIES.map((d) => d.v));

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Outlook · 2025 → 2030
        </span>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight md:text-7xl">
          {t("paddy.title")}
        </h1>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t("paddy.subtitle")}</p>
      </Reveal>

      {/* KPIs */}
      <div className="mt-12 grid gap-4 md:grid-cols-4">
        {[
          { label: "Projected 2030 MSP (₹/qtl)", value: 2980, prefix: "₹" },
          { label: "Projected 2030 yield (kg/ha)", value: 3280 },
          { label: "Export share by 2030", value: 42, suffix: "%" },
          { label: "Climate-stress districts", value: 118 },
        ].map((k, i) => (
          <Reveal key={k.label} delay={i * 80}>
            <div className="card-elegant p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{k.label}</div>
              <div className="mt-2 font-display text-3xl font-black">
                <CountUp end={k.value} prefix={k.prefix} suffix={k.suffix} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* MSP chart */}
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="card-elegant p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-display text-xl font-bold">{t("paddy.msp")}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">₹/quintal · Common paddy · Solid = actual, dashed = projected</p>
            <div className="mt-6 space-y-2">
              {MSP_SERIES.map((d) => (
                <div key={d.y} className="flex items-center gap-3 text-xs">
                  <div className="w-10 text-muted-foreground">{d.y}</div>
                  <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-secondary/40">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.v / maxMsp) * 100}%`,
                        background: d.proj
                          ? "repeating-linear-gradient(90deg, color-mix(in oklab, var(--primary) 60%, transparent) 0 6px, transparent 6px 10px)"
                          : "linear-gradient(90deg, var(--primary), var(--accent))",
                      }}
                    />
                  </div>
                  <div className="w-14 text-right font-semibold tabular-nums">₹{d.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="card-elegant p-6">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-primary" />
              <h2 className="font-display text-xl font-bold">{t("paddy.yield")}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">kg/ha national average · target 3.3 t/ha by 2030</p>
            <div className="mt-6 space-y-2">
              {YIELD_SERIES.map((d) => (
                <div key={d.y} className="flex items-center gap-3 text-xs">
                  <div className="w-10 text-muted-foreground">{d.y}</div>
                  <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-secondary/40">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.v / maxYield) * 100}%`,
                        background: d.proj
                          ? "repeating-linear-gradient(90deg, color-mix(in oklab, var(--accent) 60%, transparent) 0 6px, transparent 6px 10px)"
                          : "linear-gradient(90deg, var(--accent), var(--primary))",
                      }}
                    />
                  </div>
                  <div className="w-14 text-right font-semibold tabular-nums">{d.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Four pillars */}
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <Pillar
          icon={<Cloud className="h-4 w-4" />}
          title={t("paddy.climate")}
          bullets={[
            "Heat stress days (>35°C during flowering) up 22% by 2030 across Indo-Gangetic plain.",
            "Erratic monsoon onset in AP & Odisha — 12–18 day variance projected.",
            "Groundwater in Punjab-Haryana declining 40 cm/yr; shift to DSR & short-duration varieties inevitable.",
          ]}
        />
        <Pillar
          icon={<Cpu className="h-4 w-4" />}
          title={t("paddy.tech")}
          bullets={[
            "Direct-Seeded Rice (DSR) coverage projected to hit 8 M ha by 2030 — saves 30% water.",
            "AI-powered nitrogen advisory (leaf-colour + drone NDVI) cuts urea 18–24%.",
            "Climate-resilient cultivars: DRR Dhan 42, CR Dhan 801 tolerant to submergence + drought.",
            "Drone sowing & spraying subsidised at 40–50% under SMAM until 2027.",
          ]}
        />
        <Pillar
          icon={<Ship className="h-4 w-4" />}
          title={t("paddy.markets")}
          bullets={[
            "India retains ~40% share of global rice exports; Basmati premium widening.",
            "Non-Basmati exports expected to rebound as buffer stocks stabilise post-2025.",
            "GI-tagged varieties (Sona Masuri, Gobindobhog) commanding 25–35% premium.",
          ]}
        />
        <Pillar
          icon={<Landmark className="h-4 w-4" />}
          title={t("paddy.policy")}
          bullets={[
            "MSP indexed to A2+FL+50%; expected ₹2,980/qtl by 2030 for common paddy.",
            "PM-PRANAM & fertilizer DBT pushing balanced NPK — urea overuse penalised from FY27.",
            "PMFBY 2.0 offers weather-index insurance with 72-hr claim settlement.",
          ]}
        />
      </section>

      {/* CTA */}
      <section className="mt-16 card-elegant p-8">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-2xl font-bold">Get the paddy playbook for your district</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sowing dates, fertilizer schedule, mandi price and disease alerts — tuned to your location.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/crops/$slug"
              params={{ slug: rice?.slug ?? "rice" }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110"
            >
              Open Paddy dossier <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/market"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
            >
              Live mandi prices
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Pillar({ icon, title, bullets }: { icon: React.ReactNode; title: string; bullets: string[] }) {
  return (
    <Reveal>
      <div className="card-elegant p-6">
        <div className="flex items-center gap-2 text-primary">
          {icon}
          <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
