import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Beaker, Droplets, Coins, Sprout, Ruler, SprayCan, Wheat, TrendingUp,
  History, Download, Copy, Trash2, Info, CheckCircle2, AlertTriangle,
  BookOpen, Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { HeroBanner } from "@/components/HeroBanner";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { useLocation } from "@/lib/location-store";
import {
  CROP_REFS, REF_BY_SLUG, FERT_NUTRIENT, solveFertilizerPlan,
  AREA_TO_ACRE, waterRequirement, pesticideDose,
} from "@/lib/calculators";
import heroImg from "@/assets/heroes/calculators.jpg";

export const Route = createFileRoute("/calculators")({
  head: () => ({
    meta: [
      { title: "Farm Calculators — Krish Sense" },
      { name: "description", content: "Fertilizer, seed rate, water, profit, yield, pesticide and land calculators grounded in ICAR, FAO-56, CACP and GoI reference data." },
    ],
  }),
  component: CalculatorsPage,
});

// ─────────────────────────────────────────────────────────────────
type CalcKey = "fertilizer" | "seed" | "water" | "profit" | "yield" | "pesticide" | "land";

const TOOLS: { key: CalcKey; label: string; icon: any; blurb: string; source: string }[] = [
  { key: "fertilizer", label: "Fertilizer / NPK", icon: Beaker,   blurb: "Convert crop N-P-K demand into bags of Urea, DAP and MOP.", source: "ICAR PoP · FCO 1985" },
  { key: "seed",       label: "Seed Rate",        icon: Sprout,   blurb: "Optimal seed quantity per acre based on crop & spacing.",     source: "ICAR Package of Practices" },
  { key: "water",      label: "Water / Irrigation", icon: Droplets, blurb: "ETc water demand via FAO-56 Kc × ET₀ × days.",              source: "FAO-56 · IIWM Bhopal" },
  { key: "profit",     label: "Profit & Cost",    icon: Coins,    blurb: "Revenue, cost, margin & break-even with CACP benchmarks.",   source: "CACP CoP · GoI MSP" },
  { key: "yield",      label: "Yield Predictor",  icon: Wheat,    blurb: "Estimate yield adjusted for management, water & soil.",      source: "Agri. Stats at a Glance 2023" },
  { key: "pesticide",  label: "Pesticide Dose",   icon: SprayCan, blurb: "Convert a.i. recommendation into product ml/L for tank.",    source: "CIB&RC label claims" },
  { key: "land",       label: "Land / Unit",      icon: Ruler,    blurb: "Interconvert acre, hectare, bigha, guntha, cent, m², ft².",  source: "Survey of India" },
];

// ─────────────────────────────────────────────────────────────────
type HistoryItem = {
  id: string;
  tool: CalcKey;
  title: string;
  summary: string;
  meta: Record<string, string | number>;
  at: number;
};

function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("agri.calc.history");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  const persist = (next: HistoryItem[]) => {
    setItems(next);
    try { localStorage.setItem("agri.calc.history", JSON.stringify(next.slice(0, 40))); } catch {}
  };
  return {
    items,
    add: (h: Omit<HistoryItem, "id" | "at">) =>
      persist([{ ...h, id: crypto.randomUUID(), at: Date.now() }, ...items].slice(0, 40)),
    remove: (id: string) => persist(items.filter((i) => i.id !== id)),
    clear: () => persist([]),
  };
}

function downloadCSV(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─────────────────────────────────────────────────────────────────
function CalculatorsPage() {
  const [active, setActive] = useState<CalcKey>("fertilizer");
  const history = useHistory();

  return (
    <div>
      <HeroBanner
        image={heroImg}
        eyebrow="Decision Support"
        title="Farm Calculators"
        description="Eight precision tools grounded in ICAR, FAO-56, CACP and Government of India reference data. Real formulas, transparent assumptions, exportable reports."
      />

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Tool switcher */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t, i) => {
            const Icon = t.icon;
            const on = t.key === active;
            return (
              <Reveal key={t.key} delay={i * 40}>
                <button
                  onClick={() => setActive(t.key)}
                  className={`group w-full rounded-2xl border p-4 text-left transition ${
                    on
                      ? "border-primary bg-primary/10 shadow-elegant"
                      : "border-border/60 hover:border-primary/40 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${on ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold">{t.label}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{t.blurb}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-widest text-primary/80">{t.source}</div>
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Active calculator */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            {active === "fertilizer" && <FertilizerCalc onSave={history.add} />}
            {active === "seed" && <SeedCalc onSave={history.add} />}
            {active === "water" && <WaterCalc onSave={history.add} />}
            {active === "profit" && <ProfitCalc onSave={history.add} />}
            {active === "yield" && <YieldCalc onSave={history.add} />}
            {active === "pesticide" && <PesticideCalc onSave={history.add} />}
            {active === "land" && <LandCalc onSave={history.add} />}
          </div>

          <aside className="space-y-4">
            <HistoryPanel history={history} />
            <SourcesPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, right }: any) {
  return (
    <section className="card-elegant p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <h2 className="font-display text-xl font-bold">{title}</h2>
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: any) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function NumInput({ value, onChange, min = 0, step = 0.1, suffix }: any) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2 focus-within:border-primary">
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="w-full bg-transparent outline-none"
      />
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function CropSelect({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 outline-none focus:border-primary"
    >
      {CROP_REFS.map((c) => (
        <option key={c.slug} value={c.slug}>{c.name}</option>
      ))}
    </select>
  );
}

function ResultCard({ label, value, sub, accent = "primary" }: any) {
  return (
    <div className="card-elegant relative overflow-hidden p-5">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-${accent}/20 blur-2xl`} />
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-black tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Callout({ tone = "info", children }: { tone?: "info" | "warn" | "ok"; children: React.ReactNode }) {
  const style =
    tone === "warn" ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-200" :
    tone === "ok"   ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200" :
                      "bg-primary/10 border-primary/30 text-foreground";
  const Icon = tone === "warn" ? AlertTriangle : tone === "ok" ? CheckCircle2 : Info;
  return (
    <div className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${style}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// 1. FERTILIZER
// ═════════════════════════════════════════════════════════════════
function FertilizerCalc({ onSave }: { onSave: (h: Omit<HistoryItem, "id" | "at">) => void }) {
  const [slug, setSlug] = useState("rice");
  const [size, setSize] = useState(2);
  const [unit, setUnit] = useState<"acre" | "hectare">("acre");
  const [soilBoost, setSoilBoost] = useState(0); // % adjustment based on soil test
  const ref = REF_BY_SLUG[slug];
  const acres = size * (unit === "acre" ? 1 : AREA_TO_ACRE.hectare);

  const demand = useMemo(() => ({
    N: Math.round(ref.npkPerAcre.N * acres * (1 + soilBoost / 100)),
    P: Math.round(ref.npkPerAcre.P * acres * (1 + soilBoost / 100)),
    K: Math.round(ref.npkPerAcre.K * acres * (1 + soilBoost / 100)),
  }), [ref, acres, soilBoost]);

  const plan = useMemo(() => solveFertilizerPlan(demand), [demand]);
  const costUrea = plan.urea * 6, costDap = plan.dap * 27, costMop = plan.mop * 34; // subsidised MRP ₹/kg
  const totalCost = costUrea + costDap + costMop;

  const pieData = [
    { name: "N", value: demand.N, color: "#10b981" },
    { name: "P", value: demand.P, color: "#f59e0b" },
    { name: "K", value: demand.K, color: "#3b82f6" },
  ];

  return (
    <div className="space-y-6">
      <Section title="Fertilizer / NPK Planner" icon={Beaker} right={
        <button
          onClick={() => onSave({
            tool: "fertilizer",
            title: `${ref.name} · ${size} ${unit}`,
            summary: `Urea ${plan.urea}kg · DAP ${plan.dap}kg · MOP ${plan.mop}kg`,
            meta: { N: demand.N, P: demand.P, K: demand.K, cost: totalCost },
          })}
          className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110"
        >Save</button>
      }>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Crop"><CropSelect value={slug} onChange={setSlug} /></Field>
          <Field label="Land size" hint={`= ${acres.toFixed(2)} acres`}>
            <div className="flex gap-2">
              <NumInput value={size} onChange={setSize} min={0.1} />
              <div className="flex rounded-xl border border-border/60 p-1 text-xs">
                {(["acre", "hectare"] as const).map((u) => (
                  <button key={u} onClick={() => setUnit(u)} className={`rounded-lg px-2 py-1 capitalize ${unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{u}</button>
                ))}
              </div>
            </div>
          </Field>
          <Field label="Soil test adjustment" hint="−30% rich · +30% deficient">
            <input type="range" min={-30} max={30} step={5} value={soilBoost} onChange={(e) => setSoilBoost(Number(e.target.value))} className="w-full accent-primary" />
            <div className="mt-1 text-center text-xs text-muted-foreground">{soilBoost >= 0 ? "+" : ""}{soilBoost}%</div>
          </Field>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard label="Urea (46-0-0)" value={<><CountUp value={plan.urea} /> kg</>} sub={`~${Math.ceil(plan.urea / 45)} × 45kg bags`} />
            <ResultCard label="DAP (18-46-0)" value={<><CountUp value={plan.dap} /> kg</>} sub={`~${Math.ceil(plan.dap / 50)} × 50kg bags`} />
            <ResultCard label="MOP (0-0-60)" value={<><CountUp value={plan.mop} /> kg</>} sub={`~${Math.ceil(plan.mop / 50)} × 50kg bags`} />
          </div>
          <div className="card-elegant p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Nutrient demand · kg</div>
            <div className="h-[180px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-around text-center text-xs">
              <div><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> N {demand.N}kg</div>
              <div><span className="inline-block h-2 w-2 rounded-full bg-amber-500" /> P {demand.P}kg</div>
              <div><span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> K {demand.K}kg</div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ResultCard label="Estimated input cost" value={<>₹<CountUp value={totalCost} /></>} sub="Subsidised retail: Urea ₹6, DAP ₹27, MOP ₹34 /kg" />
          <Callout tone="info">
            <b>Formula.</b> Bag plan solves DAP first for P (18% N side-supply), then Urea tops up remaining N, MOP supplies K. Nutrient % from FCO 1985.
          </Callout>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={() => downloadCSV(`fertilizer-${slug}.csv`, [
            ["Crop", ref.name], ["Land (acres)", acres.toFixed(2)],
            ["N (kg)", demand.N], ["P (kg)", demand.P], ["K (kg)", demand.K],
            ["Urea (kg)", plan.urea], ["DAP (kg)", plan.dap], ["MOP (kg)", plan.mop],
            ["Estimated cost (₹)", totalCost],
          ])} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary">
            <Download className="h-3 w-3" /> CSV
          </button>
        </div>
      </Section>

      <Section title="Assumptions & sources" icon={BookOpen}>
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>· NPK recommendation: ICAR crop-wise Package of Practices (per-acre averages).</li>
          <li>· Straight-fertilizer nutrient %: Fertilizer Control Order (FCO) 1985.</li>
          <li>· Retail prices are subsidised MRPs from Dept. of Fertilizers.</li>
          <li>· Soil-test slider ±30% represents typical macro-nutrient index adjustment.</li>
        </ul>
      </Section>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// 2. SEED RATE
// ═════════════════════════════════════════════════════════════════
function SeedCalc({ onSave }: { onSave: any }) {
  const [slug, setSlug] = useState("wheat");
  const [size, setSize] = useState(1);
  const [germPct, setGermPct] = useState(85);
  const ref = REF_BY_SLUG[slug];
  const [lo, hi] = ref.seedRatePerAcre;
  const mid = (lo + hi) / 2;
  const adjusted = mid * (85 / germPct); // compensate for germination
  const total = adjusted * size;

  return (
    <Section title="Seed Rate Calculator" icon={Sprout} right={
      <button onClick={() => onSave({
        tool: "seed",
        title: `${ref.name} · ${size} ac`,
        summary: `${total.toFixed(1)} kg seed`,
        meta: { total, germPct, spacing: ref.spacingCm },
      })} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save</button>
    }>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Crop"><CropSelect value={slug} onChange={setSlug} /></Field>
        <Field label="Area (acres)"><NumInput value={size} onChange={setSize} min={0.1} suffix="ac" /></Field>
        <Field label="Germination %" hint="Test on 100 seeds">
          <NumInput value={germPct} onChange={setGermPct} min={20} step={1} suffix="%" />
        </Field>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <ResultCard label="Seed required" value={<><CountUp value={Math.round(total * 10) / 10} precision={1} /> kg</>} sub={`Recommended ${lo}–${hi} kg/acre`} />
        <ResultCard label="Spacing" value={ref.spacingCm} sub="Row × plant" />
        <ResultCard label="Germination adjusted" value={`${((85 / germPct - 1) * 100 >= 0 ? "+" : "")}${(((85 / germPct) - 1) * 100).toFixed(0)}%`} sub="vs. standard 85%" />
      </div>

      {germPct < 70 && <div className="mt-4"><Callout tone="warn">Germination below 70% — retest seed lot or increase rate by ≥20%.</Callout></div>}

      <div className="mt-4">
        <Callout>
          <b>Formula.</b> Seed (kg) = mid-recommendation × (85 / germination%) × area. Range from ICAR crop-wise PoP.
        </Callout>
      </div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════
// 3. WATER / IRRIGATION
// ═════════════════════════════════════════════════════════════════
function WaterCalc({ onSave }: { onSave: any }) {
  const [slug, setSlug] = useState("rice");
  const [size, setSize] = useState(1);
  const [et0, setEt0] = useState(5.2); // mm/day national avg
  const [days, setDays] = useState(0);
  const ref = REF_BY_SLUG[slug];
  const D = days || ref.durationDays;
  const w = waterRequirement(ref.kcMid, et0, D);
  const totalL = w.litresPerAcre * size;
  const [seasonLo, seasonHi] = ref.seasonalWaterMm;

  const stages = [
    { label: "Initial", kc: 0.7, days: Math.round(D * 0.15) },
    { label: "Development", kc: 0.9, days: Math.round(D * 0.25) },
    { label: "Mid-season", kc: ref.kcMid, days: Math.round(D * 0.4) },
    { label: "Late", kc: 0.75, days: Math.round(D * 0.2) },
  ].map((s) => ({ ...s, mm: Math.round(s.kc * et0 * s.days) }));

  return (
    <Section title="Irrigation Requirement (FAO-56)" icon={Droplets} right={
      <button onClick={() => onSave({
        tool: "water",
        title: `${ref.name} · ${size} ac`,
        summary: `${w.mm}mm · ${(totalL / 1000).toFixed(0)} kL`,
        meta: { mm: w.mm, days: D, kc: ref.kcMid },
      })} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save</button>
    }>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Crop"><CropSelect value={slug} onChange={setSlug} /></Field>
        <Field label="Area (acres)"><NumInput value={size} onChange={setSize} min={0.1} suffix="ac" /></Field>
        <Field label="Reference ET₀" hint="mm/day (IMD)"><NumInput value={et0} onChange={setEt0} min={1} step={0.1} suffix="mm" /></Field>
        <Field label="Season days" hint={`Default ${ref.durationDays}`}><NumInput value={days} onChange={setDays} min={0} step={5} suffix="d" /></Field>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <ResultCard label="Seasonal ETc" value={<><CountUp value={w.mm} /> mm</>} sub={`Range ${seasonLo}–${seasonHi} mm (FAO)`} />
        <ResultCard label="Per acre" value={<><CountUp value={Math.round(w.litresPerAcre / 1000)} /> kL</>} sub="Kilolitres over season" />
        <ResultCard label={`Total (${size} ac)`} value={<><CountUp value={Math.round(totalL / 1000)} /> kL</>} sub={`${(totalL / 1e6).toFixed(2)} ML`} />
      </div>

      <div className="mt-6">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Stage-wise water demand (mm)</div>
        <div className="h-[220px]">
          <ResponsiveContainer>
            <BarChart data={stages}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="mm" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4">
        <Callout><b>Formula.</b> ETc = Kc × ET₀ × days. Kc (mid) = {ref.kcMid} from FAO-56 Table 12. 1 mm × 1 acre = 4,046.86 L.</Callout>
      </div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════
// 4. PROFIT & COST
// ═════════════════════════════════════════════════════════════════
function ProfitCalc({ onSave }: { onSave: any }) {
  const [slug, setSlug] = useState("cotton");
  const [size, setSize] = useState(2);
  const [yieldPerAcre, setYieldPerAcre] = useState(0);
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const ref = REF_BY_SLUG[slug];
  const y = yieldPerAcre || ref.avgYieldPerAcre;
  const p = price || ref.msp || 3000;
  const c = cost || ref.costPerAcre;

  const revPerAcre = (y * p) / 100; // kg × ₹/qtl → ₹
  const marginPerAcre = revPerAcre - c;
  const total = marginPerAcre * size;
  const breakEvenKg = (c * 100) / p;
  const bcr = revPerAcre / c;

  useEffect(() => { setYieldPerAcre(0); setPrice(0); setCost(0); }, [slug]);

  return (
    <Section title="Profit & Cost Analysis" icon={Coins} right={
      <button onClick={() => onSave({
        tool: "profit",
        title: `${ref.name} · ${size} ac`,
        summary: `Margin ₹${Math.round(total).toLocaleString()}`,
        meta: { margin: Math.round(total), bcr: bcr.toFixed(2) },
      })} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save</button>
    }>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Crop"><CropSelect value={slug} onChange={setSlug} /></Field>
        <Field label="Area (acres)"><NumInput value={size} onChange={setSize} min={0.1} suffix="ac" /></Field>
        <Field label="Yield / acre" hint={`Avg ${ref.avgYieldPerAcre} kg`}><NumInput value={yieldPerAcre} onChange={setYieldPerAcre} min={0} step={10} suffix="kg" /></Field>
        <Field label="Price ₹/qtl" hint={ref.msp ? `MSP ₹${ref.msp}` : "Free market"}><NumInput value={price} onChange={setPrice} min={0} step={50} /></Field>
        <Field label="Cost ₹/acre" hint={`CACP ₹${ref.costPerAcre.toLocaleString()}`}><NumInput value={cost} onChange={setCost} min={0} step={500} /></Field>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <ResultCard label="Revenue / acre" value={<>₹<CountUp value={Math.round(revPerAcre)} /></>} sub={`${y} kg × ₹${p}/qtl`} />
        <ResultCard label="Margin / acre" value={<>₹<CountUp value={Math.round(marginPerAcre)} /></>} sub={marginPerAcre >= 0 ? "Profit" : "Loss"} />
        <ResultCard label={`Total (${size} ac)`} value={<>₹<CountUp value={Math.round(total)} /></>} sub={`BCR ${bcr.toFixed(2)}`} />
        <ResultCard label="Break-even yield" value={<><CountUp value={Math.round(breakEvenKg)} /> kg</>} sub="Per acre at input price" />
      </div>

      {bcr < 1 && <div className="mt-4"><Callout tone="warn">BCR &lt; 1 — cost exceeds revenue. Explore MSP procurement, subsidies (PM-KISAN, PMFBY) or contract farming.</Callout></div>}
      {bcr >= 1.5 && <div className="mt-4"><Callout tone="ok">Strong BCR ({bcr.toFixed(2)}). Consider reinvesting in soil health & mechanisation.</Callout></div>}

      <div className="mt-4"><Callout><b>Formula.</b> Revenue = yield(kg) × price(₹/qtl) / 100. Margin = Revenue − Cost. BCR = Revenue / Cost. Defaults from Agri. Stats at a Glance 2023 & CACP CoP.</Callout></div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════
// 5. YIELD PREDICTOR
// ═════════════════════════════════════════════════════════════════
function YieldCalc({ onSave }: { onSave: any }) {
  const [slug, setSlug] = useState("rice");
  const [soil, setSoil] = useState(80);      // % index
  const [water, setWater] = useState(85);
  const [mgmt, setMgmt] = useState(80);
  const [pest, setPest] = useState(90);
  const ref = REF_BY_SLUG[slug];
  const factor = (soil / 100) * (water / 100) * (mgmt / 100) * (pest / 100);
  const predicted = Math.round(ref.avgYieldPerAcre * factor);
  const vsAvg = ((predicted - ref.avgYieldPerAcre) / ref.avgYieldPerAcre) * 100;

  const data = [
    { m: "M1", y: Math.round(predicted * 0.1) },
    { m: "M2", y: Math.round(predicted * 0.25) },
    { m: "M3", y: Math.round(predicted * 0.55) },
    { m: "M4", y: Math.round(predicted * 0.85) },
    { m: "Harvest", y: predicted },
  ];

  return (
    <Section title="Yield Predictor" icon={Wheat} right={
      <button onClick={() => onSave({
        tool: "yield",
        title: `${ref.name} predict`,
        summary: `${predicted} kg/ac (${vsAvg >= 0 ? "+" : ""}${vsAvg.toFixed(0)}%)`,
        meta: { predicted, factor: factor.toFixed(2) },
      })} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save</button>
    }>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Crop"><CropSelect value={slug} onChange={setSlug} /></Field>
        {[
          { l: "Soil health", v: soil, s: setSoil },
          { l: "Water adequacy", v: water, s: setWater },
          { l: "Management", v: mgmt, s: setMgmt },
          { l: "Pest / disease control", v: pest, s: setPest },
        ].map((r) => (
          <Field key={r.l} label={r.l}>
            <input type="range" min={30} max={110} value={r.v} onChange={(e) => r.s(Number(e.target.value))} className="w-full accent-primary" />
            <div className="mt-1 text-center text-xs text-muted-foreground">{r.v}%</div>
          </Field>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <ResultCard label="Predicted yield" value={<><CountUp value={predicted} /> kg/ac</>} sub={`Baseline ${ref.avgYieldPerAcre} kg`} />
        <ResultCard label="Vs. national avg" value={`${vsAvg >= 0 ? "+" : ""}${vsAvg.toFixed(0)}%`} sub={vsAvg >= 0 ? "Above average" : "Below average"} />
        <ResultCard label="Composite index" value={`${(factor * 100).toFixed(0)}%`} sub="Soil × water × mgmt × pest" />
      </div>

      <div className="mt-6">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Growth-stage biomass trajectory (kg/ac)</div>
        <div className="h-[220px]">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="m" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4"><Callout><b>Model.</b> Multiplicative response function used by IARI advisory. Baseline yield from ICAR-DES 2022–23 national averages.</Callout></div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════
// 6. PESTICIDE DOSE
// ═════════════════════════════════════════════════════════════════
function PesticideCalc({ onSave }: { onSave: any }) {
  const [productConc, setProductConc] = useState(25); // % a.i.
  const [recDose, setRecDose] = useState(400);        // g a.i./acre
  const [sprayVol, setSprayVol] = useState(200);      // L/acre
  const [area, setArea] = useState(1);
  const r = pesticideDose({ productConcPct: productConc, recAiGperAcre: recDose, sprayVolLperAcre: sprayVol });
  const totalProduct = r.productPerAcreG * area;
  const totalWater = sprayVol * area;

  return (
    <Section title="Pesticide Dilution" icon={SprayCan} right={
      <button onClick={() => onSave({
        tool: "pesticide",
        title: `${productConc}% a.i.`,
        summary: `${totalProduct.toFixed(0)}g in ${totalWater}L`,
        meta: { productG: totalProduct, waterL: totalWater },
      })} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save</button>
    }>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Product % a.i." hint="On label"><NumInput value={productConc} onChange={setProductConc} min={0.1} step={0.5} suffix="%" /></Field>
        <Field label="Rec. a.i. g/acre" hint="CIB&RC"><NumInput value={recDose} onChange={setRecDose} min={1} step={10} suffix="g" /></Field>
        <Field label="Spray volume L/acre" hint="Knapsack 200 · HTP 400"><NumInput value={sprayVol} onChange={setSprayVol} min={10} step={10} suffix="L" /></Field>
        <Field label="Area (acres)"><NumInput value={area} onChange={setArea} min={0.1} suffix="ac" /></Field>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <ResultCard label="Product per acre" value={<><CountUp value={r.productPerAcreG} /> g</>} sub={`= ${(r.productPerAcreG / 1000).toFixed(2)} kg/L`} />
        <ResultCard label="Dose per litre" value={`${r.productPerLitreMlOrG} g/mL`} sub="Tank concentration" />
        <ResultCard label="Total needed" value={<><CountUp value={Math.round(totalProduct)} /> g</>} sub={`In ${totalWater} L water`} />
      </div>

      <div className="mt-4"><Callout tone="warn">Safety — wear PPE, respect pre-harvest interval and rotate MoA groups to prevent resistance (IRAC / FRAC).</Callout></div>
      <div className="mt-2"><Callout><b>Formula.</b> Product (g) = (rec. a.i. × 100) / % a.i. Tank concentration = product / spray volume.</Callout></div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════
// 7. LAND / UNIT CONVERTER
// ═════════════════════════════════════════════════════════════════
function LandCalc({ onSave }: { onSave: any }) {
  const [value, setValue] = useState(1);
  const [from, setFrom] = useState("acre");
  const acres = value * AREA_TO_ACRE[from];
  const rows = Object.keys(AREA_TO_ACRE);

  return (
    <Section title="Land / Unit Converter" icon={Ruler} right={
      <button onClick={() => onSave({
        tool: "land",
        title: `${value} ${from}`,
        summary: `${acres.toFixed(3)} acres`,
        meta: { acres: acres.toFixed(3) },
      })} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Save</button>
    }>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Value"><NumInput value={value} onChange={setValue} min={0} step={0.1} /></Field>
        <Field label="Unit">
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 outline-none focus:border-primary">
            {rows.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </Field>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((u) => (
          <div key={u} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{u}</span>
            <span className="font-mono text-sm font-semibold">{(acres / AREA_TO_ACRE[u]).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
          </div>
        ))}
      </div>

      <div className="mt-4"><Callout>Bigha varies by state (0.25–1.6 acre). This tool uses the common Uttar Pradesh average (0.4 ac). Verify locally.</Callout></div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════
// Sidebars
// ═════════════════════════════════════════════════════════════════
function HistoryPanel({ history }: { history: ReturnType<typeof useHistory> }) {
  return (
    <div className="card-elegant p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><History className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Recent calculations</h3></div>
        {history.items.length > 0 && (
          <button onClick={history.clear} className="text-xs text-muted-foreground hover:text-destructive">Clear</button>
        )}
      </div>
      <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto">
        {history.items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">Save any calculation to see it here.</div>
        )}
        {history.items.map((h) => (
          <div key={h.id} className="group rounded-xl border border-border/40 bg-background/40 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold">{h.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{h.summary}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-primary/70">{h.tool}</div>
              </div>
              <button onClick={() => history.remove(h.id)} className="opacity-0 transition group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourcesPanel() {
  const sources = [
    ["ICAR", "Package of Practices – crop-wise seed & NPK"],
    ["FAO-56", "Crop evapotranspiration – Kc coefficients"],
    ["FCO 1985", "Fertilizer nutrient specifications"],
    ["CACP", "Cost of cultivation reports"],
    ["MoAFW", "MSP notifications FY25"],
    ["Agri. Stats", "at a Glance 2023 – yield averages"],
    ["CIB&RC", "Pesticide label recommendations"],
    ["IMD", "Reference ET₀ climate normals"],
  ];
  return (
    <div className="card-elegant p-4">
      <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Data sources</h3></div>
      <ul className="mt-3 space-y-2">
        {sources.map(([k, v]) => (
          <li key={k} className="flex gap-2 text-xs">
            <span className="w-16 shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-center font-semibold text-primary">{k}</span>
            <span className="text-muted-foreground">{v}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-[10px] text-muted-foreground">All calculations are transparent — see the "Formula" callout on each tool.</div>
    </div>
  );
}
