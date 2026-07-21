import { useMemo, useState } from "react";
import { useAgmarknetLive, type LiveCommodity } from "@/lib/agmarknet-live";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { TrendingUp, TrendingDown, Sparkles, MapPin } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

/**
 * Guntur is world-famous for Chilli & Tobacco; AP is a powerhouse for
 * Paddy, Cotton, Turmeric, Groundnut, Bengal Gram, Red Gram, Maize,
 * Onion, Mango, Banana, Sugarcane, Coriander.
 */
const GUNTUR_FAMOUS = ["Chilli", "Chilly", "Chillies", "Tobacco", "Cotton", "Paddy(Dhan)(Common)", "Paddy(Dhan)(Basmati)"];
const AP_FAMOUS = [
  "Paddy(Dhan)(Common)", "Paddy(Dhan)(Basmati)", "Cotton", "Chilli", "Chilly", "Chillies",
  "Turmeric", "Groundnut", "Bengal Gram(Gram)(Whole)", "Red Gram", "Maize",
  "Onion", "Mango", "Banana", "Sugarcane", "Coriander", "Black Gram (Urd Beans)(Whole)",
  "Green Gram (Moong)(Whole)", "Jowar(Sorghum)", "Bajra(Pearl Millet/Cumbu)", "Tobacco",
];

function matches(commodity: string, list: string[]) {
  const c = commodity.toLowerCase();
  return list.some((x) => c.includes(x.toLowerCase()) || x.toLowerCase().includes(c));
}

function StatChip({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/40 px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm font-bold tabular-nums ${tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function CommodityCard({ c }: { c: LiveCommodity }) {
  const up = c.deltaPct >= 0;
  return (
    <div className="card-elegant hover-lift overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-bold">{c.commodity}</div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
            <MapPin className="mr-1 inline h-3 w-3" />
            {c.topMarket || "—"} · {c.markets} mandis
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
          up ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
        }`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}{c.deltaPct.toFixed(2)}%
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="font-display text-3xl font-black tabular-nums">
          ₹<AnimatedNumber value={c.modal} />
        </div>
        <div className="text-[11px] text-muted-foreground">/ quintal</div>
      </div>

      <div className="mt-3 h-16">
        <ResponsiveContainer>
          <AreaChart data={c.weekly}>
            <defs>
              <linearGradient id={`ap-${c.commodity.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 }} />
            <Area type="monotone" dataKey="avg" stroke="var(--primary)" fill={`url(#ap-${c.commodity.replace(/[^a-z0-9]/gi, "")})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        <StatChip label="Min" value={`₹${c.min.toLocaleString()}`} />
        <StatChip label="Max" value={`₹${c.max.toLocaleString()}`} />
        <StatChip label="Avg" value={`₹${c.avg.toLocaleString()}`} />
        <StatChip label="Vol" value={`±${c.volatility}`} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Demand: <span className="font-semibold text-foreground">{c.demand}</span></span>
        <span>Supply: <span className="font-semibold text-foreground">{c.supply}</span></span>
        <span className={`font-semibold ${c.status === "OPEN" ? "text-primary" : "text-muted-foreground"}`}>● {c.status}</span>
      </div>
    </div>
  );
}

export function APFamousCrops() {
  const { data, loading, updated, error } = useAgmarknetLive({ state: "Andhra Pradesh", limit: 2000, refreshMs: 60_000 });
  const [tab, setTab] = useState<"guntur" | "ap">("guntur");

  const filtered = useMemo(() => {
    const list = tab === "guntur" ? GUNTUR_FAMOUS : AP_FAMOUS;
    return data
      .filter((d) => matches(d.commodity, list))
      .sort((a, b) => b.arrivals - a.arrivals);
  }, [data, tab]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Regional Live Board
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold">
            {tab === "guntur" ? "Guntur Famous Crops" : "Andhra Pradesh Famous Crops"} · Live
          </h2>
          <p className="text-sm text-muted-foreground">
            {tab === "guntur"
              ? "Guntur's signature commodities — the world's largest chilli market, plus tobacco, cotton and paddy."
              : "AP's flagship commodities — paddy, cotton, chilli, turmeric, groundnut, pulses & more."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-border/60 bg-card/60 p-1">
            <button
              onClick={() => setTab("guntur")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === "guntur" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Guntur
            </button>
            <button
              onClick={() => setTab("ap")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === "ap" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              All AP
            </button>
          </div>
          {updated && (
            <span className="text-[11px] text-muted-foreground">
              Updated {new Date(updated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && !filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted/30" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
          No live arrivals reported for these commodities right now. Agmarknet mandis publish through the day — the board will refill on the next tick.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CommodityCard key={c.commodity} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}
