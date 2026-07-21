import { useMemo, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  TrendingUp, TrendingDown, Radio, Clock, Search, ArrowUpDown,
  Flame, Snowflake, Sparkles, Package, Activity, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAgmarknetLive, type LiveCommodity } from "@/lib/agmarknet-live";

type SortKey = "arrivals" | "modal" | "deltaPct" | "volatility" | "commodity";
type Filter = "all" | "gainers" | "losers" | "volatile" | "high-arrivals";

const CHART_TOOLTIP = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
} as const;

export function LiveMarketBoard({ title = "All-India Live Mandi Board", compact = false }: { title?: string; compact?: boolean }) {
  const { data, updated, loading, error, stats } = useAgmarknetLive({ refreshMs: 5 * 60 * 1000, limit: 3000 });
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("arrivals");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = data.filter((d) => (needle ? d.commodity.toLowerCase().includes(needle) : true));
    if (filter === "gainers") rows = rows.filter((d) => d.deltaPct > 0);
    if (filter === "losers") rows = rows.filter((d) => d.deltaPct < 0);
    if (filter === "volatile") rows = [...rows].sort((a, b) => b.volatility - a.volatility).slice(0, 20);
    if (filter === "high-arrivals") rows = [...rows].sort((a, b) => b.arrivals - a.arrivals).slice(0, 20);

    if (filter !== "volatile" && filter !== "high-arrivals") {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [data, q, sortKey, sortDir, filter]);

  const gainers = useMemo(() => [...data].sort((a, b) => b.deltaPct - a.deltaPct).slice(0, 5), [data]);
  const losers = useMemo(() => [...data].sort((a, b) => a.deltaPct - b.deltaPct).slice(0, 5), [data]);
  const overall = useMemo(() => {
    if (!data.length) return { avgChange: 0, mandis: 0, topGainer: null as LiveCommodity | null, topLoser: null as LiveCommodity | null, states: 0 };
    const avgChange = data.reduce((s, d) => s + d.deltaPct, 0) / data.length;
    const mandis = data.reduce((s, d) => s + d.markets, 0);
    const states = new Set(data.flatMap((d) => d.mandis.map((m) => m.state))).size;
    return { avgChange, mandis, topGainer: gainers[0] ?? null, topLoser: losers[0] ?? null, states };
  }, [data, gainers, losers]);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="glass rounded-2xl border border-border/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live · data.gov.in · Agmarknet
            </div>
            <h3 className="font-display text-2xl font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground">
              Real-time daily prices across every reporting state, district and mandi — auto-refreshes every 5 min.
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {updated && (
              <div className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> Updated {new Date(updated).toLocaleTimeString()}
              </div>
            )}
            <div className="mt-1 inline-flex items-center gap-1">
              <Radio className="h-3 w-3 text-primary animate-pulse" /> {stats.total} commodities · {stats.totalArrivals.toLocaleString()} records
            </div>
          </div>
        </div>

        {/* Overall KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Kpi icon={<Package className="h-4 w-4" />} label="Commodities" value={stats.total.toString()} />
          <Kpi icon={<Radio className="h-4 w-4" />} label="Reporting mandis" value={overall.mandis.toLocaleString()} />
          <Kpi icon={<Sparkles className="h-4 w-4" />} label="States covered" value={overall.states.toString()} />
          <Kpi
            icon={overall.avgChange >= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
            label="Avg. change"
            value={`${overall.avgChange >= 0 ? "+" : ""}${overall.avgChange.toFixed(2)}%`}
            tone={overall.avgChange >= 0 ? "up" : "down"}
          />
          <Kpi
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            label={overall.topGainer ? `Top ▲ ${overall.topGainer.commodity}` : "Top gainer"}
            value={overall.topGainer ? `+${overall.topGainer.deltaPct.toFixed(1)}%` : "—"}
            tone="up"
          />
          <Kpi
            icon={<TrendingDown className="h-4 w-4 text-destructive" />}
            label={overall.topLoser ? `Top ▼ ${overall.topLoser.commodity}` : "Top loser"}
            value={overall.topLoser ? `${overall.topLoser.deltaPct.toFixed(1)}%` : "—"}
            tone="down"
          />
        </div>
      </div>

      {/* Trending */}
      {!loading && !error && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <TrendingCard title="Top Gainers" tone="up" items={gainers} onPick={setExpanded} />
          <TrendingCard title="Top Losers" tone="down" items={losers} onPick={setExpanded} />
        </div>
      )}

      {/* Toolbar */}
      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search commodity (Rice, Onion, Cotton…)"
            className="w-full rounded-xl border border-border bg-card/60 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} icon={<Sparkles className="h-3 w-3" />} />
        <FilterChip label="Gainers" active={filter === "gainers"} onClick={() => setFilter("gainers")} icon={<TrendingUp className="h-3 w-3" />} />
        <FilterChip label="Losers" active={filter === "losers"} onClick={() => setFilter("losers")} icon={<TrendingDown className="h-3 w-3" />} />
        <FilterChip label="Volatile" active={filter === "volatile"} onClick={() => setFilter("volatile")} icon={<Flame className="h-3 w-3" />} />
        <FilterChip label="High arrivals" active={filter === "high-arrivals"} onClick={() => setFilter("high-arrivals")} icon={<Package className="h-3 w-3" />} />

        <div className="ml-auto flex items-center gap-2 text-xs">
          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-card/70 px-2 py-1.5 text-xs"
          >
            <option value="arrivals">Arrivals</option>
            <option value="modal">Modal ₹</option>
            <option value="deltaPct">% Change</option>
            <option value="volatility">Volatility</option>
            <option value="commodity">A–Z</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="rounded-lg border border-border bg-card/70 px-2 py-1.5 text-xs uppercase tracking-wider"
          >
            {sortDir}
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading && <SkeletonGrid compact={compact} />}
      {error && !loading && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
          {filtered.map((c) => (
            <CommodityCard
              key={c.commodity}
              item={c}
              expanded={expanded === c.commodity}
              onToggle={() => setExpanded(expanded === c.commodity ? null : c.commodity)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              No commodities match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Kpi({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">{icon}{label}</div>
      <div className={`mt-1 font-display text-xl font-bold tabular-nums ${tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}{label}
    </button>
  );
}

function TrendingCard({ title, tone, items, onPick }: { title: string; tone: "up" | "down"; items: LiveCommodity[]; onPick: (c: string) => void }) {
  const Icon = tone === "up" ? TrendingUp : TrendingDown;
  const color = tone === "up" ? "text-primary" : "text-destructive";
  return (
    <div className="card-elegant p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <h4 className="font-display text-lg font-bold">{title}</h4>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">Live</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((c) => (
          <li key={c.commodity}>
            <button
              onClick={() => onPick(c.commodity)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-card/60"
            >
              <span className="font-medium">{c.commodity}</span>
              <span className="flex items-center gap-3 tabular-nums">
                <span className="text-xs text-muted-foreground">₹{c.modal.toLocaleString()}</span>
                <span className={`font-semibold ${color}`}>
                  {c.deltaPct >= 0 ? "+" : ""}{c.deltaPct.toFixed(1)}%
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommodityCard({ item, expanded, onToggle }: { item: LiveCommodity; expanded: boolean; onToggle: () => void }) {
  const up = item.deltaPct >= 0;
  const spark = item.weekly.map((w) => ({ x: w.date, y: w.avg }));
  const statusColor = item.status === "OPEN" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground";
  const demandColor = item.demand === "High" ? "text-primary" : item.demand === "Low" ? "text-destructive" : "text-muted-foreground";
  const supplyColor = item.supply === "High" ? "text-primary" : item.supply === "Low" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="card-elegant hover-lift overflow-hidden p-0">
      <button onClick={onToggle} className="w-full p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="font-display text-lg font-bold truncate">{item.commodity}</h5>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColor}`}>
                ● {item.status}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="font-display text-3xl font-black tabular-nums">₹{item.modal.toLocaleString()}</div>
              <span className={`text-xs ${up ? "text-primary" : "text-destructive"}`}>
                {up ? "+" : ""}{item.delta} ({item.deltaPct.toFixed(1)}%)
              </span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">prev ₹{item.previous.toLocaleString()} · ₹/quintal</div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${up ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {up ? "▲" : "▼"} {Math.abs(item.deltaPct).toFixed(1)}%
            </span>
            {item.volatility > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                {item.volatility > 200 ? <Flame className="h-3 w-3 text-sunrise" /> : <Snowflake className="h-3 w-3" />}
                σ ₹{item.volatility.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Metrics grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
          <Metric label="Min" value={`₹${item.min.toLocaleString()}`} />
          <Metric label="Avg" value={`₹${item.avg.toLocaleString()}`} />
          <Metric label="Max" value={`₹${item.max.toLocaleString()}`} />
          <Metric label="Mandis" value={item.markets.toString()} />
          <Metric label="Demand" value={item.demand} valueClass={demandColor} />
          <Metric label="Supply" value={item.supply} valueClass={supplyColor} />
        </div>

        {/* Sparkline */}
        {spark.length > 1 && (
          <div className="mt-3 h-20">
            <ResponsiveContainer>
              <AreaChart data={spark}>
                <defs>
                  <linearGradient id={`sp-${item.commodity}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={up ? "var(--primary)" : "var(--destructive)"} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={up ? "var(--primary)" : "var(--destructive)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="x" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip contentStyle={CHART_TOOLTIP} formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Area type="monotone" dataKey="y" stroke={up ? "var(--primary)" : "var(--destructive)"} fill={`url(#sp-${item.commodity})`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> Latest arrival · {item.weekly[item.weekly.length - 1]?.date ?? "—"}
          </span>
          <span className="inline-flex items-center gap-1">
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Hide mandis" : "Top mandis"}
          </span>
        </div>
      </button>

      {expanded && item.mandis.length > 0 && (
        <div className="border-t border-border/50 bg-card/30 p-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Top mandis today</div>
          <ul className="space-y-1 text-xs">
            {item.mandis.map((m) => (
              <li key={m.market + m.district} className="flex items-center justify-between">
                <span className="truncate">
                  <span className="font-medium">{m.market}</span>
                  <span className="text-muted-foreground"> · {m.district}, {m.state}</span>
                </span>
                <span className="tabular-nums font-display">₹{m.modal.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/40 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-sm font-bold tabular-nums ${valueClass}`}>{value}</div>
    </div>
  );
}

function SkeletonGrid({ compact }: { compact: boolean }) {
  const cells = compact ? 4 : 6;
  return (
    <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} className="card-elegant animate-pulse space-y-3 p-5">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-8 w-1/2 rounded bg-muted" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, k) => <div key={k} className="h-10 rounded bg-muted/70" />)}
          </div>
          <div className="h-20 rounded bg-muted/60" />
        </div>
      ))}
    </div>
  );
}
