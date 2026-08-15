import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  PieChart, Pie, Legend,
  ScatterChart, Scatter, ZAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import {
  ArrowDownUp, Download, Search as SearchIcon,
  Sprout, TrendingUp, Award, BarChart3, MapPin, Layers, Waves, Gauge,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { HeroBanner } from "@/components/HeroBanner";
import heroImg from "@/assets/heroes/analytics.jpg";
import { LiveAnalysis } from "@/components/LiveAnalysis";
import { LiveMarketBoard } from "@/components/LiveMarketBoard";
import { MarketInsightsPanel } from "@/components/MarketInsightsPanel";
import { MarketCommandCenter } from "@/components/MarketCommandCenter";
import { MarketAnalyticsPro } from "@/components/MarketAnalyticsPro";

import { locationStore, useLocation } from "@/lib/location-store";
import {
  DISTRICTS, MACRO, KPIS, EXECUTIVE, CHALLENGES, REFERENCES,
  type DistrictRow,
} from "@/data/pdf-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Agri Analytics — Krish Sense" },
      { name: "description", content: "District-wise crop production, area, yield and season analytics from the Ministry of Agriculture 2025-26 Advance Estimates." },
      { property: "og:title", content: "Agricultural Analytics — Krish Sense" },
      { property: "og:description", content: "Interactive visualization of every state, district and crop from India's Advance Estimates 2025-26." },
    ],
  }),
  component: Analytics,
});

const CHART_COLORS = [
  "var(--primary-crimson)", "var(--bright-crimson)", "rgba(227, 25, 55, 0.6)", "rgba(227, 25, 55, 0.4)", "rgba(227, 25, 55, 0.2)",
  "#1A2B48", "#2C3E50", "#34495E", "#E67E22",
];

function fmt(n: number) { return n.toLocaleString("en-IN"); }
function toCSV(rows: DistrictRow[]) {
  const head = ["State", "District", "Crop", "Season", "Area(Ha)", "Production(MT)", "Yield(kg/Ha)"];
  const body = rows.map((r) =>
    [r.state, r.district, r.crop, r.season, r.areaHa, r.productionMT, r.yieldKgHa]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
  );
  return [head.join(","), ...body].join("\n");
}

type SortKey = keyof DistrictRow;

function Analytics() {
  const loc = useLocation();
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("All");
  const [seasonFilter, setSeasonFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("productionMT");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const states = useMemo(() => ["All", ...Array.from(new Set(DISTRICTS.map((d) => d.state)))], []);
  const seasons = useMemo(() => ["All", ...Array.from(new Set(DISTRICTS.map((d) => d.season)))], []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = DISTRICTS.filter((r) => {
      if (stateFilter !== "All" && r.state !== stateFilter) return false;
      if (seasonFilter !== "All" && r.season !== seasonFilter) return false;
      if (!needle) return true;
      return (
        r.district.toLowerCase().includes(needle) ||
        r.crop.toLowerCase().includes(needle) ||
        r.state.toLowerCase().includes(needle)
      );
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [q, stateFilter, seasonFilter, sortKey, sortDir]);

  const selectedRow = DISTRICTS.find((d) => d.district === loc.district);

  // Aggregates
  const productionByState = useMemo(() => {
    const m = new Map<string, { state: string; production: number; area: number }>();
    for (const d of DISTRICTS) {
      const cur = m.get(d.state) ?? { state: d.state, production: 0, area: 0 };
      cur.production += d.productionMT; cur.area += d.areaHa;
      m.set(d.state, cur);
    }
    return Array.from(m.values()).sort((a, b) => b.production - a.production);
  }, []);

  const productionByCrop = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of DISTRICTS) m.set(d.crop, (m.get(d.crop) ?? 0) + d.productionMT);
    return Array.from(m.entries())
      .map(([crop, v]) => ({ crop, value: v }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const yieldRank = useMemo(
    () => [...DISTRICTS].sort((a, b) => b.yieldKgHa - a.yieldKgHa),
    [],
  );

  const scatter = DISTRICTS.map((d) => ({
    x: d.areaHa, y: d.yieldKgHa, z: d.productionMT,
    district: d.district, crop: d.crop, state: d.state,
  }));

  const macroPie = MACRO.filter((m) => m.category !== "Total Food Grains Group")
    .map((m) => ({ name: m.category, value: m.outputLakhTonnes }));

  const macroRadar = MACRO.filter((m) => m.category !== "Total Food Grains Group")
    .map((m) => ({ category: m.category.split(" ")[0], Area: m.areaLakhHa, Output: m.outputLakhTonnes / 5 }));

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  }

  function downloadCSV() {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `krishisense-districts-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="Ministry of Agriculture · 2025-26 · 3rd Advance Estimates"
        title="India Crop Production Atlas"
        description="A spatial & quantitative matrix of area, yield and annual output metrics across India's foremost agricultural clusters — Rice, Wheat, Pulses, Oilseeds and Commercial crops."
      />
      <div className="mx-auto max-w-7xl px-6 py-16">

      {/* Live agricultural market intelligence */}
      <section className="mb-10">
        <MarketAnalyticsPro />
      </section>

      <LiveAnalysis />

      {/* Enterprise command center */}
      <section className="mt-10">
        <MarketCommandCenter />
      </section>

      {/* AI-generated market brief */}
      <section className="mt-10 space-y-3">
        <MarketInsightsPanel />
      </section>

      {/* All-India live mandi analytics */}
      <section className="mt-10 space-y-3">
        <div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-moonlight-white">All-India Live Market Analysis</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-muted-blue-gray">
            Real-time mandi prices sourced from Agmarknet (data.gov.in). Search, sort and drill into every commodity, mandi and price movement.
          </p>
        </div>
        <LiveMarketBoard title="Live Mandi Board · Nationwide" compact />
      </section>




      {/* KPI DASHBOARD */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Layers className="h-5 w-5" />} label="States tracked" value={KPIS.states} />
        <Kpi icon={<MapPin className="h-5 w-5" />} label="Districts" value={KPIS.districts} />
        <Kpi icon={<Sprout className="h-5 w-5" />} label="Distinct crops" value={KPIS.crops} />
        <Kpi icon={<BarChart3 className="h-5 w-5" />} label="Food-grain output" value={255.13} suffix=" M-T" precision={2} />
        <Kpi icon={<Gauge className="h-5 w-5" />} label="Avg. yield" value={KPIS.avgYield} suffix=" kg/ha" />
        <Kpi icon={<TrendingUp className="h-5 w-5" />} label="Highest yield" value={KPIS.highest.yieldKgHa} suffix=" kg/ha" tag={`${KPIS.highest.district} · ${KPIS.highest.crop}`} />
        <Kpi icon={<Waves className="h-5 w-5" />} label="Lowest yield" value={KPIS.lowest.yieldKgHa} suffix=" kg/ha" tag={`${KPIS.lowest.district} · ${KPIS.lowest.crop}`} />
        <Kpi icon={<Award className="h-5 w-5" />} label="Top producer" value={KPIS.topProducer.productionMT / 1_000_000} suffix=" M-MT" precision={2} tag={KPIS.topProducer.district} />
      </div>

      {/* SELECTED DISTRICT SPOTLIGHT */}
      {selectedRow && (
        <Reveal>
          <div className="mt-10 neo-glass p-8 rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-crimson">
                  Your district · live spotlight
                </div>
                <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tighter text-moonlight-white">
                  {selectedRow.district} <span className="text-muted-blue-gray">· {selectedRow.state}</span>
                </h2>
              </div>
              <span className="rounded-full bg-primary-crimson/20 border border-primary-crimson/30 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-crimson shadow-[0_0_15px_rgba(227,25,55,0.1)]">
                {selectedRow.crop} · {selectedRow.season}
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MiniStat label="Area" value={`${fmt(selectedRow.areaHa)} ha`} />
              <MiniStat label="Production" value={`${fmt(selectedRow.productionMT)} MT`} />
              <MiniStat label="Avg. yield" value={`${fmt(selectedRow.yieldKgHa)} kg/ha`} />
            </div>
          </div>
        </Reveal>
      )}

      {/* EXECUTIVE SUMMARY + FORMULA */}
      <div className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <div className="neo-glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-crimson">Executive Summary</div>
            <p className="mt-6 font-bold text-sm text-moonlight-white/80 leading-relaxed uppercase tracking-wider">
              Agriculture remains a fundamental pillar of the Indian economy, driving
              livelihoods for over half of the nation's populace. For the current
              agricultural calendar year, overall food-grain production in India is
              projected at{" "}
              <span className="text-primary-crimson font-black">255.13 × 10⁶ Metric Tonnes</span>.
              While traditional grain baskets like Punjab, Haryana, and Western Uttar
              Pradesh continue to anchor national buffer stocks, high-performing
              agro-ecological zones across Central, Western, and Southern India have
              rapidly transformed into specialized hubs.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 group-hover:border-primary-crimson/20 transition-colors">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-blue-gray">Data Scope</div>
                <div className="mt-1 text-sm">{EXECUTIVE.scope}</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 group-hover:border-primary-crimson/20 transition-colors">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-blue-gray">Analytical Indexing</div>
                <div className="mt-1 text-sm">{EXECUTIVE.indexing}</div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="neo-glass relative overflow-hidden p-8 rounded-[2rem] border border-white/10 shadow-2xl group">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl bg-primary-crimson/30 group-hover:opacity-40 transition-opacity"
            />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-crimson">Key Yield Formulation</div>
            <div className="mt-6 flex items-center justify-center">
              <div className="font-display text-6xl font-black tracking-tight md:text-7xl">
                <span className="text-primary-crimson">Y</span>
                <span className="mx-3 text-muted-blue-gray/40">=</span>
                <span className="text-moonlight-white">P</span>
                <span className="mx-2 text-muted-blue-gray/40">/</span>
                <span className="text-moonlight-white">A</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {EXECUTIVE.formulaLegend.map((l) => (
                <div key={l.symbol} className="flex items-center gap-3 text-sm">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-crimson/20 font-display text-xl font-black text-primary-crimson shadow-lg shadow-primary-crimson/10 border border-primary-crimson/20">
                    {l.symbol}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-blue-gray">{l.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* MACRO CATEGORY TABLE + PIE + RADAR */}
      <Reveal>
        <h2 className="mt-16 font-display text-4xl font-black uppercase tracking-tighter text-moonlight-white">
          Macro Crop Categories
        </h2>
        <p className="mt-3 max-w-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-muted-blue-gray">
          National composition for the 2025-26 cycle — area (Lakh Ha) and estimated
          output (Lakh Tonnes) across the five core groups plus the consolidated
          food-grain aggregate.
        </p>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="neo-glass overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-primary-crimson">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Season</th>
                  <th className="px-4 py-3 text-right">Area (Lakh Ha)</th>
                  <th className="px-4 py-3 text-right">Output (Lakh T)</th>
                  <th className="px-4 py-3">Dominant Zones</th>
                </tr>
              </thead>
              <tbody>
                {MACRO.map((m) => {
                  const total = m.category === "Total Food Grains Group";
                  return (
                    <tr key={m.category} className={`border-b border-white/5 last:border-none transition-colors hover:bg-white/5 ${total ? "bg-primary-crimson/10 font-black text-primary-crimson" : "text-moonlight-white"}`}>
                      <td className="px-4 py-3">{m.category}</td>
                      <td className={`px-4 py-3 ${total ? "text-primary-crimson/80" : "text-muted-blue-gray"}`}>{m.season}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{m.areaLakhHa.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{m.outputLakhTonnes.toLocaleString("en-IN")}</td>
                      <td className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest ${total ? "text-primary-crimson/60" : "text-muted-blue-gray/60"}`}>{m.zones}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="neo-glass p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-crimson">Output share</div>
          <div className="mt-2 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={macroPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {macroPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 neo-glass p-8 rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-crimson">
          Area vs Output — normalized radar
        </div>
        <div className="mt-4 h-80">
          <ResponsiveContainer>
            <RadarChart data={macroRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="category" tick={{ fill: "var(--muted-blue-gray)", fontSize: 10, fontWeight: "bold" }} />
              <PolarRadiusAxis tick={{ fill: "var(--muted-blue-gray)", fontSize: 9 }} />
              <Radar name="Area (Lakh Ha)" dataKey="Area" stroke="var(--primary-crimson)" fill="var(--primary-crimson)" fillOpacity={0.3} />
              <Radar name="Output (÷5)" dataKey="Output" stroke="var(--sunrise)" fill="var(--sunrise)" fillOpacity={0.35} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STATE PRODUCTION BAR */}
      <Reveal>
        <h2 className="mt-16 font-display text-3xl font-bold md:text-4xl">
          Production by State
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Aggregated MT across all districts sampled in the handbook.
        </p>
      </Reveal>
      <div className="mt-6 card-elegant p-6">
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={productionByState} margin={{ top: 12, right: 12, left: -8, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="state" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(v) => (v / 1_000_000).toFixed(1) + "M"} />
              <Tooltip
                formatter={(v: any) => [fmt(Number(v)) + " MT", "Production"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="production" radius={[10, 10, 0, 0]}>
                {productionByState.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* YIELD RANKING */}
      <Reveal>
        <h2 className="mt-16 font-display text-3xl font-bold md:text-4xl">
          District Yield Ranking
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Sugarcane skews the top — cane yield is measured on cane weight, not grain
          equivalent. Cereals sit around the 3,000–5,000 kg/ha band; rainfed drylands
          fall below 700 kg/ha.
        </p>
      </Reveal>
      <div className="mt-6 card-elegant p-6">
        <div className="h-[520px]">
          <ResponsiveContainer>
            <BarChart data={yieldRank} layout="vertical" margin={{ top: 8, right: 24, left: 100, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis type="category" dataKey="district" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={100} />
              <Tooltip
                formatter={(v: any) => [fmt(Number(v)) + " kg/ha", "Yield"]}
                labelFormatter={(l, p: any) => `${l} · ${p?.[0]?.payload?.crop ?? ""}`}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="yieldKgHa" fill="var(--leaf)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SCATTER: Area vs Yield (bubble = production) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card-elegant p-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Area (ha) vs Yield (kg/ha) · bubble = production
          </div>
          <div className="mt-4 h-96">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis type="number" dataKey="x" name="Area" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(v) => (v / 1000) + "k"} />
                <YAxis type="number" dataKey="y" name="Yield" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <ZAxis type="number" dataKey="z" range={[40, 600]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: any, k: any) => k === "z" ? [fmt(v) + " MT", "Production"] : [fmt(v), k === "x" ? "Area (ha)" : "Yield (kg/ha)"]}
                  labelFormatter={() => ""}
                  content={({ payload }: any) => {
                    const p = payload?.[0]?.payload;
                    if (!p) return null;
                    return (
                      <div className="rounded-xl border border-border bg-card p-3 text-xs shadow-lg">
                        <div className="font-semibold">{p.district} · {p.state}</div>
                        <div className="text-muted-foreground">{p.crop}</div>
                        <div className="mt-1">Area: {fmt(p.x)} ha</div>
                        <div>Yield: {fmt(p.y)} kg/ha</div>
                        <div>Production: {fmt(p.z)} MT</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatter} fill="var(--sunrise)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elegant p-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Production by Crop
          </div>
          <div className="mt-2 h-96 overflow-y-auto pr-2">
            {productionByCrop.map((c, i) => {
              const max = productionByCrop[0].value;
              const pct = (c.value / max) * 100;
              return (
                <div key={c.crop} className="mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{c.crop}</span>
                    <span className="tabular-nums text-muted-foreground">{fmt(c.value)} MT</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary/60">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length],
                        transition: "width .8s var(--ease-out-expo)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* INTERACTIVE MATRIX */}
      <Reveal>
        <div className="mt-16 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">District Matrix</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Sort any column, filter by state or season, search anything. Click a
              row to pin that district to the whole app — Weather, Market, Fertilizer
              and Schemes update instantly.
            </p>
          </div>
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-2 text-sm font-semibold hover:border-primary/60"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </Reveal>

      <div className="mt-6 card-elegant overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search district, crop, state…"
              className="w-full rounded-xl border border-border/60 bg-background/40 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <Select label="State" value={stateFilter} onChange={setStateFilter} options={states} />
          <Select label="Season" value={seasonFilter} onChange={setSeasonFilter} options={seasons} />
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {DISTRICTS.length} rows
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <Th onClick={() => toggleSort("state")}      active={sortKey === "state"}      dir={sortDir}>State</Th>
                <Th onClick={() => toggleSort("district")}   active={sortKey === "district"}   dir={sortDir}>District</Th>
                <Th onClick={() => toggleSort("crop")}       active={sortKey === "crop"}       dir={sortDir}>Crop</Th>
                <Th onClick={() => toggleSort("season")}     active={sortKey === "season"}     dir={sortDir}>Season</Th>
                <Th onClick={() => toggleSort("areaHa")}     active={sortKey === "areaHa"}     dir={sortDir} align="right">Area (Ha)</Th>
                <Th onClick={() => toggleSort("productionMT")} active={sortKey === "productionMT"} dir={sortDir} align="right">Production (MT)</Th>
                <Th onClick={() => toggleSort("yieldKgHa")}  active={sortKey === "yieldKgHa"}  dir={sortDir} align="right">Yield (kg/Ha)</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const active = r.district === loc.district && r.state === loc.state;
                return (
                  <tr
                    key={r.state + r.district + r.crop}
                    onClick={() => locationStore.set({ state: r.state, district: r.district })}
                    className={`cursor-pointer border-b border-border/40 last:border-none transition-colors ${
                      active ? "bg-primary/10" : "hover:bg-secondary/40"
                    }`}
                  >
                    <td className="px-4 py-3">{r.state}</td>
                    <td className="px-4 py-3 font-semibold">{r.district}</td>
                    <td className="px-4 py-3">{r.crop}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.season}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmt(r.areaHa)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmt(r.productionMT)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmt(r.yieldKgHa)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No rows match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHALLENGES */}
      <Reveal>
        <div className="mt-16 card-elegant p-8">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            §4 · Spatial Challenges & Yield Optimization
          </div>
          <p className="mt-4 leading-relaxed text-muted-foreground">{CHALLENGES.gap}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CHALLENGES.interventions.map((t, i) => (
              <div key={t} className="rounded-2xl border border-border/60 bg-secondary/20 p-4 text-sm">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div className="mt-3">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* REFERENCES */}
      <Reveal>
        <h2 className="mt-16 font-display text-3xl font-bold md:text-4xl">Sources</h2>
      </Reveal>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REFERENCES.map((r) => (
          <div key={r.name} className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="text-[10px] uppercase tracking-widest text-primary">{r.tag}</div>
            <div className="mt-1 text-sm font-semibold">{r.name}</div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

function Kpi({ icon, label, value, suffix, tag, precision = 0 }: {
  icon: React.ReactNode; label: string; value: number; suffix?: string; tag?: string; precision?: number;
}) {
  return (
    <div className="card-elegant hover-lift p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">{icon}</div>
        {tag && <span className="max-w-[140px] truncate text-[10px] uppercase tracking-widest text-muted-foreground">{tag}</span>}
      </div>
      <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-black tabular-nums">
        <CountUp value={value} precision={precision} />
        {suffix && <span className="ml-1 text-sm font-medium text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Th({ children, onClick, active, dir, align = "left" }: {
  children: React.ReactNode; onClick: () => void; active: boolean; dir: "asc" | "desc"; align?: "left" | "right";
}) {
  return (
    <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 uppercase tracking-widest ${active ? "text-primary" : "hover:text-foreground"}`}
      >
        {children}
        <ArrowDownUp className={`h-3 w-3 transition ${active ? "opacity-100" : "opacity-40"} ${active && dir === "asc" ? "rotate-180" : ""}`} />
      </button>
    </th>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border/60 bg-background/60 px-3 py-1.5 text-sm outline-none focus:border-primary"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
