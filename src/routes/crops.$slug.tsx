import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CROPS } from "@/data/crops";
import type { Crop } from "@/data/crops/types";
import { Reveal } from "@/components/Reveal";
import {
  Droplets, Thermometer, CloudRain, Sprout, TrendingUp, Bug, Beaker, Wheat,
  ArrowLeft, ExternalLink, ShieldAlert, Lightbulb, Recycle,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/crops/$slug")({
  head: ({ loaderData }: { loaderData?: Crop }) => {
    const crop = loaderData;
    const meta: Array<{ title?: string; name?: string; property?: string; content?: string }> = [
      { title: crop ? `${crop.name} — Advisory · KrishiSense` : "Crop — KrishiSense" },
      { name: "description", content: crop ? `Complete cultivation playbook for ${crop.name}: land prep, seed, fertilizer, diseases, harvest and market.` : "Crop advisory" },
      { property: "og:title", content: crop ? `${crop.name} · KrishiSense` : "Crop" },
    ];
    if (crop?.image) meta.push({ property: "og:image", content: crop.image });
    return { meta };
  },
  loader: ({ params }): Crop => {
    const c = CROPS[params.slug];
    if (!c) throw notFound();
    return c;
  },
  component: CropDetail,
});

function CropDetail() {
  const c = Route.useLoaderData() as Crop;

  return (
    <div>
      {/* Cover */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 md:pt-14 md:pb-32">
          <Link to="/crops" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to library
          </Link>
          <Reveal delay={60}>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl glass text-4xl">{c.emoji}</span>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                {c.season}
              </span>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <h1 className="mt-4 font-display text-6xl font-black tracking-tight md:text-8xl">{c.name}</h1>
            <p className="mt-2 italic text-muted-foreground">{c.scientificName}</p>
          </Reveal>

          <Reveal delay={280}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Fact icon={<Thermometer className="h-4 w-4" />} label="Temperature" value={c.temperature} />
              <Fact icon={<CloudRain className="h-4 w-4" />} label="Rainfall" value={c.rainfall} />
              <Fact icon={<Droplets className="h-4 w-4" />} label="Water" value={c.waterNeed} />
              <Fact icon={<Sprout className="h-4 w-4" />} label="Soil pH" value={c.soilPh} />
              <Fact icon={<TrendingUp className="h-4 w-4" />} label="Profit" value={`+${c.profitPct}%`} />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 space-y-24 pb-16">
        {/* Land prep timeline */}
        <Section eyebrow="Step 1" title="Land Preparation">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {c.landPrep.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="card-elegant hover-lift relative p-6">
                  <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    STEP {i + 1}
                  </div>
                  <h3 className="mt-1 font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Seed & sowing */}
        <Section eyebrow="Step 2" title="Seed & Sowing">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard label="Seed rate" value={c.seedRate} />
            <InfoCard label="Seed treatment" value={c.seedTreatment} />
            <InfoCard label="Spacing" value={c.spacing} />
            <InfoCard label="Sowing method" value={c.sowingMethod} />
          </div>
        </Section>

        {/* Irrigation */}
        <Section eyebrow="Step 3" title="Irrigation Schedule" icon={<Droplets />}>
          <ul className="grid gap-3 md:grid-cols-3">
            {c.irrigation.map((i, idx) => (
              <li key={idx} className="glass rounded-2xl p-5 text-sm">
                <span className="mr-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">{idx + 1}</span>
                {i}
              </li>
            ))}
          </ul>
        </Section>

        {/* Fertilizer */}
        <Section eyebrow="Step 4" title="Fertilizer Schedule" icon={<Beaker />}>
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/40">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Nutrient / Input</th>
                  <th className="p-4">Per Acre</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Intensity</th>
                </tr>
              </thead>
              <tbody>
                {c.fertilizer.map((f) => {
                  const max = Math.max(...c.fertilizer.map((x) => x.perAcreKg));
                  const pct = (f.perAcreKg / max) * 100;
                  return (
                    <tr key={f.name} className="border-t border-border/40">
                      <td className="p-4 font-semibold">{f.name}</td>
                      <td className="p-4 tabular-nums">{f.perAcreKg} kg</td>
                      <td className="p-4 text-muted-foreground">{f.stage}</td>
                      <td className="p-4">
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-secondary/40">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Need calculations for your exact land size?{" "}
            <Link to="/fertilizer" search={{ crop: c.slug } as any} className="story-link text-primary">Open Fertilizer Calculator</Link>
          </p>
        </Section>

        {/* Diseases (crop-isolated) */}
        <Section eyebrow="Health" title="Disease Identification" icon={<Bug />}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {c.diseases.map((d, i) => (
              <Reveal key={d.name} delay={i * 60}>
                <article className="card-elegant hover-lift p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold">{d.name}</h3>
                    <SeverityMeter n={d.severity} />
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <Row k="Symptoms" v={d.symptoms} />
                    <Row k="Cause" v={d.cause} />
                    <Row k="Organic" v={d.organic} />
                    <Row k="Chemical" v={d.chemical} />
                  </dl>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 grid gap-3 rounded-3xl border border-border/60 bg-card/40 p-6 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pests</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {c.pests.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Weeds</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {c.weeds.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </div>
          </div>
        </Section>

        {/* Rotation preview */}
        <Section eyebrow="Sustainability" title="Recommended Rotation" icon={<Recycle />}>
          <div className="grid gap-4 md:grid-cols-3">
            {c.rotation.map((r, i) => (
              <Reveal key={r.crop} delay={i * 60}>
                <div className="card-elegant p-6">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">After {c.name} →</div>
                  <h3 className="mt-1 font-display text-2xl font-bold">{r.crop}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-border/60 px-2 py-0.5">{r.season}</span>
                    <span className="rounded-full border border-border/60 px-2 py-0.5">{r.gapDays}d gap</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{r.benefit}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Link to="/rotation" className="mt-4 inline-flex items-center gap-1 story-link text-primary">Open rotation wheel →</Link>
        </Section>

        {/* Market */}
        <Section eyebrow="Economics" title="Market Price & MSP" icon={<TrendingUp />}>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card-elegant p-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Today's price</div>
              <div className="mt-2 font-display text-5xl font-black">₹{c.marketPrice.price.toLocaleString()}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.marketPrice.unit}</div>
              <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
                MSP ₹{c.marketPrice.msp.toLocaleString()}
              </div>
            </div>
            <div className="card-elegant p-6 lg:col-span-2">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">7-day trend</div>
              <div className="mt-3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={c.marketPrice.trend}>
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: "var(--muted-foreground)" }}
                    />
                    <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Section>

        {/* Harvest & storage */}
        <Section eyebrow="Post-harvest" title="Harvest & Storage" icon={<Wheat />}>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard label="Harvesting" value={c.harvesting} />
            <InfoCard label="Storage" value={c.storage} />
          </div>
        </Section>

        {/* Tips & precautions */}
        <Section eyebrow="Wisdom" title="Expert Tips & Precautions">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-elegant p-6">
              <div className="mb-2 flex items-center gap-2 text-primary"><Lightbulb className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-widest">Tips</span></div>
              <ul className="space-y-2 text-sm">
                {c.tips.map((t) => <li key={t} className="flex gap-2"><span className="text-primary">•</span>{t}</li>)}
              </ul>
            </div>
            <div className="card-elegant p-6">
              <div className="mb-2 flex items-center gap-2 text-accent"><ShieldAlert className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-widest">Precautions</span></div>
              <ul className="space-y-2 text-sm">
                {c.precautions.map((t) => <li key={t} className="flex gap-2"><span className="text-accent">•</span>{t}</li>)}
              </ul>
            </div>
          </div>
        </Section>

        {/* References */}
        <Section eyebrow="Learn" title="Official References">
          <div className="grid gap-3 md:grid-cols-2">
            {c.references.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass hover-lift flex items-center justify-between rounded-2xl p-5 text-sm"
              >
                <span>{r.label}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span></div>
      <div className="mt-1.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-elegant p-5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-sm">{value}</div>
    </div>
  );
}

function Section({ eyebrow, title, icon, children }: { eyebrow: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <Reveal>
        <div className="flex items-center gap-3">
          {icon && <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">{icon}</span>}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</span>
            <h2 className="font-display text-3xl font-black tracking-tight md:text-4xl">{title}</h2>
          </div>
        </div>
      </Reveal>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k}</dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}

function SeverityMeter({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Severity ${n}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-1.5 w-4 rounded-full"
          style={{
            background: i <= n
              ? `linear-gradient(90deg, var(--primary), ${n >= 4 ? "var(--destructive)" : "var(--accent)"})`
              : "var(--muted)",
          }}
        />
      ))}
    </div>
  );
}
