import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Cloud, Cpu, Ship, Landmark, Sprout, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { HeroBanner } from "@/components/HeroBanner";
import { useT } from "@/lib/i18n";
import { CROP_LIST } from "@/data/crops";
import heroImg from "@/assets/heroes/paddy-future.jpg";

export const Route = createFileRoute("/paddy-future")({
  head: () => ({
    meta: [
      { title: "The Future of Paddy — KrishiSense" },
      { name: "description", content: "Yield, price, climate and technology outlook for India's paddy crop through 2030." },
    ],
  }),
  component: PaddyFuture,
});

const MSP_SERIES = [
  { y: "2019", v: 1815 }, { y: "2020", v: 1868 }, { y: "2021", v: 1940 },
  { y: "2022", v: 2040 }, { y: "2023", v: 2183 }, { y: "2024", v: 2300 },
  { y: "2025", v: 2389 },
  { y: "2026", v: 2495, proj: true }, { y: "2028", v: 2720, proj: true },
  { y: "2030", v: 2980, proj: true },
];

const YIELD_SERIES = [
  { y: "2019", v: 2659 }, { y: "2021", v: 2789 }, { y: "2023", v: 2809 },
  { y: "2025", v: 2905 },
  { y: "2028", v: 3120, proj: true }, { y: "2030", v: 3280, proj: true },
];

function PaddyFuture() {
  const t = useT();
  const rice = CROP_LIST.find((c) => c.slug === "rice");
  const maxMsp = Math.max(...MSP_SERIES.map((d) => d.v));
  const maxYield = Math.max(...YIELD_SERIES.map((d) => d.v));

  const kpis = [
    { label: t("paddy.kpi.msp"), value: 2980, suffix: "" },
    { label: t("paddy.kpi.yield"), value: 3280, suffix: "" },
    { label: t("paddy.kpi.export"), value: 42, suffix: "%" },
    { label: t("paddy.kpi.stress"), value: 118, suffix: "" },
  ];

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow={t("paddy.eyebrow")}
        title={t("paddy.title")}
        description={t("paddy.subtitle")}
      />
      <div className="mx-auto max-w-6xl px-6 py-20">


      <div className="mt-12 grid gap-4 md:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 80}>
            <div className="card-elegant p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{k.label}</div>
              <div className="mt-2 font-display text-3xl font-black">
                <CountUp value={k.value} suffix={k.suffix} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="card-elegant p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-display text-xl font-bold">{t("paddy.msp")}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("paddy.mspCaption")}</p>
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
            <p className="mt-1 text-xs text-muted-foreground">{t("paddy.yieldCaption")}</p>
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

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <Pillar
          icon={<Cloud className="h-4 w-4" />}
          title={t("paddy.climate")}
          bullets={[t("paddy.climate.b1"), t("paddy.climate.b2"), t("paddy.climate.b3")]}
        />
        <Pillar
          icon={<Cpu className="h-4 w-4" />}
          title={t("paddy.tech")}
          bullets={[t("paddy.tech.b1"), t("paddy.tech.b2"), t("paddy.tech.b3"), t("paddy.tech.b4")]}
        />
        <Pillar
          icon={<Ship className="h-4 w-4" />}
          title={t("paddy.markets")}
          bullets={[t("paddy.market.b1"), t("paddy.market.b2"), t("paddy.market.b3")]}
        />
        <Pillar
          icon={<Landmark className="h-4 w-4" />}
          title={t("paddy.policy")}
          bullets={[t("paddy.policy.b1"), t("paddy.policy.b2"), t("paddy.policy.b3")]}
        />
      </section>

      <section className="mt-16 card-elegant p-8">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-2xl font-bold">{t("paddy.cta.title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("paddy.cta.sub")}</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/crops/$slug"
              params={{ slug: rice?.slug ?? "rice" }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110"
            >
              {t("paddy.cta.open")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/market"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
            >
              {t("paddy.cta.market")}
            </Link>
          </div>
        </div>
      </section>
    </div>
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
