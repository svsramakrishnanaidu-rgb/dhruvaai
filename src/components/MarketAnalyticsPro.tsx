import { useMemo, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import {
  Activity, Gauge, Sparkles, TrendingUp, TrendingDown, Radio, RefreshCw, Clock,
  BarChart3, MapPin, Layers, Download, AlertTriangle,
} from "lucide-react";
import { useMarketFeed, fmtINR, MARKET_CATEGORIES, type CommoditySummary, type MarketCategory } from "@/lib/market-intel";

/* ------------------------------------------------------------------ */

function timeAgo(iso: string) {
  if (!iso) return "—";
  const s = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
}

function Card({ title, icon: Icon, children, className = "" }: { title: string; icon: typeof Activity; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-md ${className}`}>
      <h3 className="mb-3 inline-flex items-center gap-2 font-display text-sm font-bold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </section>
  );
}

type StateRow = { name: string; avg: number; records: number; mandis: number };

function StateActivityBoard({ rows }: { rows: StateRow[] }) {
  const [mode, setMode] = useState<"records" | "avg">("records");
  const sorted = useMemo(
    () => [...rows].sort((a, b) => (mode === "records" ? b.records - a.records : b.avg - a.avg)),
    [rows, mode],
  );
  const peak = Math.max(1, ...sorted.map((r) => (mode === "records" ? r.records : r.avg)));
  const totalRecords = sorted.reduce((n, r) => n + r.records, 0);
  const totalMandis = sorted.reduce((n, r) => n + r.mandis, 0);

  if (!sorted.length) {
    return <p className="py-10 text-center text-xs text-muted-foreground">No state activity in this feed yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="rounded-lg border border-border/50 bg-background/60 px-2 py-1 tabular-nums">
            <b className="text-foreground">{sorted.length}</b> states
          </span>
          <span className="rounded-lg border border-border/50 bg-background/60 px-2 py-1 tabular-nums">
            <b className="text-foreground">{totalMandis}</b> mandis
          </span>
          <span className="rounded-lg border border-border/50 bg-background/60 px-2 py-1 tabular-nums">
            <b className="text-foreground">{totalRecords}</b> records
          </span>
        </div>
        <div className="inline-flex rounded-xl border border-border/50 bg-background/60 p-0.5">
          {(["records", "avg"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                mode === m ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "records" ? "Activity" : "Avg price"}
            </button>
          ))}
        </div>
      </div>

      <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {sorted.map((r, i) => {
          const val = mode === "records" ? r.records : r.avg;
          const pct = Math.max(4, Math.round((val / peak) * 100));
          return (
            <li
              key={r.name}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-background/50 px-3 py-2 transition hover:border-primary/50"
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/25 to-primary/5 transition-all"
                style={{ width: `${pct}%` }}
                aria-hidden
              />
              <div className="relative flex items-center gap-3">
                <span className="w-5 shrink-0 text-[11px] font-bold tabular-nums text-primary/80">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{r.name}</p>
                  <p className="text-[10px] tabular-nums text-muted-foreground">
                    {r.mandis} mandis · {r.records} records
                  </p>
                </div>
                <span className="shrink-0 text-right text-xs font-bold tabular-nums">
                  {mode === "records" ? r.records : fmtINR(r.avg)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


const chartTip = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 };

function csvFor(rows: CommoditySummary[]): string {
  const head = ["Commodity", "Category", "Modal", "Min", "Max", "Daily %", "Weekly %", "Monthly %", "Volatility %", "Mandis", "States", "Arrivals", "Forecast", "Signal", "Last Arrival"];
  const body = rows.map((s) => [
    s.commodity, s.category, s.modal, s.min, s.max, s.deltaPct.toFixed(2), s.weekPct.toFixed(2),
    s.monthPct.toFixed(2), s.volatilityPct.toFixed(2), s.markets, s.states, s.arrivals, s.forecast, s.signal, s.lastArrival,
  ].join(","));
  return [head.join(","), ...body].join("\n");
}

/* ------------------------------------------------------------------ */

export function MarketAnalyticsPro() {
  const [stateFilter, setStateFilter] = useState("");
  const [category, setCategory] = useState<MarketCategory | "">("");
  const feed = useMarketFeed({ state: stateFilter || undefined, limit: 2000, pages: stateFilter ? 3 : 6, refreshMs: 180_000 });
  const [focus, setFocus] = useState<string>("");

  const universe = useMemo(
    () => (category ? feed.summaries.filter((s) => s.category === category) : feed.summaries),
    [feed.summaries, category],
  );

  const selected = useMemo(
    () => universe.find((s) => s.commodity === focus) ?? universe[0] ?? null,
    [universe, focus],
  );

  const gainers = useMemo(() => [...universe].sort((a, b) => b.deltaPct - a.deltaPct).slice(0, 8), [universe]);
  const losers = useMemo(() => [...universe].sort((a, b) => a.deltaPct - b.deltaPct).slice(0, 8), [universe]);
  const volatile = useMemo(() => [...universe].sort((a, b) => b.volatilityPct - a.volatilityPct).slice(0, 10), [universe]);
  const arrivalsTop = useMemo(() => [...universe].sort((a, b) => b.arrivals - a.arrivals).slice(0, 10), [universe]);

  const categoryMix = useMemo(() => {
    const map = new Map<string, { name: string; records: number; avg: number; count: number }>();
    for (const s of universe) {
      const e = map.get(s.category) ?? { name: s.category, records: 0, avg: 0, count: 0 };
      e.records += s.arrivals;
      e.avg += s.modal;
      e.count += 1;
      map.set(s.category, e);
    }
    return [...map.values()].map((e) => ({ name: e.name, records: e.records, avg: Math.round(e.avg / e.count), crops: e.count }))
      .sort((a, b) => b.records - a.records);
  }, [universe]);

  const stateBoard = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number; mandis: Set<string> }>();
    for (const r of feed.records) {
      const e = map.get(r.state) ?? { name: r.state, total: 0, count: 0, mandis: new Set<string>() };
      e.total += r.modal_price;
      e.count += 1;
      e.mandis.add(r.market);
      map.set(r.state, e);
    }
    return [...map.values()]
      .map((e) => ({ name: e.name, avg: Math.round(e.total / e.count), records: e.count, mandis: e.mandis.size }))
      .sort((a, b) => b.records - a.records)
      .slice(0, 14);
  }, [feed.records]);

  const riskScatter = useMemo(
    () => universe.slice(0, 160).map((s) => ({ x: s.volatilityPct, y: s.deltaPct, z: s.arrivals, name: s.commodity })),
    [universe],
  );

  const recommendations = useMemo(() => {
    const buys = universe.filter((s) => s.signal === "BUY").sort((a, b) => b.forecastPct - a.forecastPct).slice(0, 4);
    const sells = universe.filter((s) => s.signal === "SELL").sort((a, b) => a.forecastPct - b.forecastPct).slice(0, 4);
    return [...buys, ...sells];
  }, [universe]);

  const download = () => {
    const blob = new Blob([csvFor(universe)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `market-intelligence-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectCls = "rounded-xl border border-border/50 bg-background/70 px-2.5 py-2 text-xs font-medium outline-none focus:border-primary/60";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Radio className="h-3 w-3 animate-pulse" /> Live market analytics
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Agricultural Market Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Trends, volatility, arrivals, demand–supply and AI recommendations computed live from Agmarknet (data.gov.in).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Analytics state filter" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className={selectCls}>
            <option value="">All India</option>
            {feed.facets.states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select aria-label="Analytics category filter" value={category} onChange={(e) => setCategory(e.target.value as MarketCategory | "")} className={selectCls}>
            <option value="">All categories</option>
            {MARKET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={feed.refresh} className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-xs font-semibold hover:border-primary/50">
            <RefreshCw className={`h-3.5 w-3.5 ${feed.refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={download} className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-xs font-semibold hover:border-primary/50">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Updated {timeAgo(feed.updated)} · auto every 3 min</span>
        <span>{feed.totals.commodities} crops · {feed.totals.mandis} mandis · {feed.totals.states} states · {feed.totals.records} records</span>
      </div>

      {feed.error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div><p className="font-semibold">Feed issue</p><p className="opacity-90">{feed.error}</p></div>
        </div>
      )}

      {feed.loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl border border-border/40 bg-muted/20" />)}
        </div>
      ) : (
        <>
          {/* Focus crop */}
          <Card title="Crop deep-dive · daily / weekly / monthly trend" icon={BarChart3}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select aria-label="Focus crop" value={selected?.commodity ?? ""} onChange={(e) => setFocus(e.target.value)} className={selectCls}>
                {universe.slice(0, 300).map((s) => <option key={s.commodity} value={s.commodity}>{s.commodity}</option>)}
              </select>
              {selected && (
                <>
                  <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs tabular-nums">Modal {fmtINR(selected.modal)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${selected.deltaPct >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                    Daily {selected.deltaPct >= 0 ? "+" : ""}{selected.deltaPct.toFixed(2)}%
                  </span>
                  <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs tabular-nums">Weekly {selected.weekPct >= 0 ? "+" : ""}{selected.weekPct.toFixed(2)}%</span>
                  <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs tabular-nums">Monthly {selected.monthPct >= 0 ? "+" : ""}{selected.monthPct.toFixed(2)}%</span>
                  <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs">Demand {selected.demand} · Supply {selected.supply}</span>
                </>
              )}
            </div>
            {selected && (
              <div className="h-64">
                <ResponsiveContainer>
                  <ComposedChart data={selected.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="p" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                    <YAxis yAxisId="a" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={chartTip} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="a" dataKey="count" name="Arrival records" fill="var(--primary)" fillOpacity={0.18} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="p" type="monotone" dataKey="max" name="Max ₹" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                    <Line yAxisId="p" type="monotone" dataKey="avg" name="Modal ₹" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                    <Line yAxisId="p" type="monotone" dataKey="min" name="Min ₹" stroke="#60a5fa" strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
            {selected && (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                <span className="inline-flex items-center gap-2 font-bold text-primary"><Sparkles className="h-4 w-4" /> {selected.signal}</span>
                <p className="mt-1 text-muted-foreground">{selected.advice}</p>
                <p className="mt-1 text-xs tabular-nums">Forecast next session: <b className="text-foreground">{fmtINR(selected.forecast)}</b> ({selected.forecastPct >= 0 ? "+" : ""}{selected.forecastPct.toFixed(2)}%)</p>
              </div>
            )}
          </Card>

          {/* Movers */}
          <div className="grid gap-3 lg:grid-cols-2">
            <Card title="Top gainers (daily)" icon={TrendingUp}>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={gainers} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                    <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
                    <YAxis type="category" dataKey="commodity" width={130} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={chartTip} formatter={(v) => [`${Number(v).toFixed(2)}%`, "Change"]} />
                    <Bar dataKey="deltaPct" radius={[0, 6, 6, 0]} fill="#34d399" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Top losers (daily)" icon={TrendingDown}>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={losers} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                    <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
                    <YAxis type="category" dataKey="commodity" width={130} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={chartTip} formatter={(v) => [`${Number(v).toFixed(2)}%`, "Change"]} />
                    <Bar dataKey="deltaPct" radius={[0, 6, 6, 0]} fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* State + arrivals */}
          <div className="grid gap-3 lg:grid-cols-2">
            <Card title="State-wise market activity & average modal price" icon={MapPin}>
              <StateActivityBoard rows={stateBoard} />
            </Card>


            <Card title="Arrival quantity leaders (supply pressure)" icon={Layers}>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={arrivalsTop} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="commodity" width={130} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={chartTip} formatter={(v) => [String(v), "Arrival records"]} />
                    <Bar dataKey="arrivals" radius={[0, 6, 6, 0]}>
                      {arrivalsTop.map((s) => (
                        <Cell key={s.commodity} fill={s.supply === "High" ? "#f59e0b" : "var(--primary)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Volatility + risk */}
          <div className="grid gap-3 lg:grid-cols-2">
            <Card title="Price volatility ranking" icon={Gauge}>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={volatile} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                    <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
                    <YAxis type="category" dataKey="commodity" width={130} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={chartTip} formatter={(v) => [`${Number(v).toFixed(1)}%`, "Volatility"]} />
                    <Bar dataKey="volatilityPct" radius={[0, 6, 6, 0]} fill="#a78bfa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Risk map · volatility vs daily move (bubble = arrivals)" icon={Activity}>
              <div className="h-72">
                <ResponsiveContainer>
                  <ScatterChart margin={{ left: 4, right: 12, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                    <XAxis type="number" dataKey="x" name="Volatility %" unit="%" tick={{ fontSize: 10 }} />
                    <YAxis type="number" dataKey="y" name="Daily %" unit="%" tick={{ fontSize: 10 }} />
                    <ZAxis type="number" dataKey="z" range={[30, 320]} name="Arrivals" />
                    <Tooltip contentStyle={chartTip} cursor={{ strokeDasharray: "3 3" }}
                      formatter={(v, n) => [Number(v).toFixed(2), String(n)]}
                      labelFormatter={() => ""} />
                    <Scatter data={riskScatter} fill="var(--primary)" fillOpacity={0.55} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Category mix */}
          <Card title="Crop-group mix · coverage and average price" icon={Layers}>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={categoryMix}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={chartTip} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="records" name="Records" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="crops" name="Crops tracked" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* AI recommendations */}
          <Card title="AI recommendations · where and when to sell" icon={Sparkles}>
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendations.map((s) => (
                <div key={s.commodity} className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{s.commodity}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${s.signal === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{s.signal}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.advice}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] tabular-nums text-muted-foreground">
                    <span className="rounded-full bg-secondary/50 px-2 py-0.5">Now {fmtINR(s.modal)}</span>
                    <span className="rounded-full bg-secondary/50 px-2 py-0.5">Forecast {fmtINR(s.forecast)}</span>
                    {s.topMandi && <span className="rounded-full bg-secondary/50 px-2 py-0.5">Best: {s.topMandi.market}, {s.topMandi.district}</span>}
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && (
                <p className="text-sm text-muted-foreground">Markets are range-bound right now — no strong buy or sell signals in this selection.</p>
              )}
            </div>
          </Card>

          <p className="text-[10px] text-muted-foreground">
            All analytics derive from live Agmarknet records (Directorate of Marketing &amp; Inspection, data.gov.in). Forecasts are statistical projections from live momentum and mean reversion, not guarantees.
          </p>
        </>
      )}
    </div>
  );
}
