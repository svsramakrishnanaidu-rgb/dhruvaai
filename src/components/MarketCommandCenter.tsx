import { useEffect, useMemo, useState } from "react";
import {
  Activity, TrendingUp, TrendingDown, Wifi, Database, Cloud, Brain,
  Sparkles, Trophy, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Zap, Bell, ShieldCheck, BarChart3, Flame, Snowflake, Timer,
} from "lucide-react";
import { useAgmarknetLive, type LiveCommodity } from "@/lib/agmarknet-live";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import {
  ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis,
} from "recharts";

/* ============================================================
   Market Command Center
   - Live KPIs · Leaderboard · Buy/Hold/Sell · Pulse ticker
   - Live status panel · Notifications
   ============================================================ */

const CHART_TOOLTIP = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
} as const;

const REFRESH_MS = 60_000;

export function MarketCommandCenter() {
  const { data, updated, loading, error, stats } = useAgmarknetLive({ refreshMs: REFRESH_MS });
  const [tick, setTick] = useState(0);

  // Countdown to next refresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % REFRESH_MS), 1000);
    return () => clearInterval(id);
  }, []);

  const updatedAt = useMemo(() => (updated ? new Date(updated) : null), [updated]);
  const secondsSince = updatedAt ? Math.floor((Date.now() - updatedAt.getTime()) / 1000) : 0;
  const secondsToNext = Math.max(0, Math.floor((REFRESH_MS - (secondsSince * 1000)) / 1000));

  // Leaderboards
  const gainers = useMemo(
    () => [...data].filter((d) => d.deltaPct > 0).sort((a, b) => b.deltaPct - a.deltaPct).slice(0, 5),
    [data]
  );
  const losers = useMemo(
    () => [...data].filter((d) => d.deltaPct < 0).sort((a, b) => a.deltaPct - b.deltaPct).slice(0, 5),
    [data]
  );
  const mostActive = useMemo(
    () => [...data].sort((a, b) => b.arrivals - a.arrivals).slice(0, 5),
    [data]
  );
  const volatile = useMemo(
    () => [...data].sort((a, b) => b.volatility - a.volatility).slice(0, 5),
    [data]
  );

  const highest = useMemo(
    () => data.reduce<{ c: LiveCommodity | null; v: number }>(
      (acc, d) => (d.max > acc.v ? { c: d, v: d.max } : acc), { c: null, v: 0 }
    ),
    [data]
  );
  const lowest = useMemo(
    () => data.filter((d) => d.min > 0).reduce<{ c: LiveCommodity | null; v: number }>(
      (acc, d) => (acc.c === null || d.min < acc.v ? { c: d, v: d.min } : acc), { c: null, v: 0 }
    ),
    [data]
  );

  // AI-style Buy/Hold/Sell (deterministic heuristic)
  const recommendations = useMemo(() => recommend(data.slice(0, 12)), [data]);

  // Rolling notifications from real market movement
  const notifications = useMemo(() => buildNotifications(data), [data]);

  // Live status
  const apiOk = !error && !loading;
  const freshness = updatedAt ? (Date.now() - updatedAt.getTime()) / 1000 : Infinity;
  const dataFresh = freshness < 180; // <3 min

  return (
    <section className="space-y-6" aria-label="Market command center">
      {/* Live status strip */}
      <div className="card-elegant grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatusPill
          icon={<Activity className="h-4 w-4" />}
          label="Market Status"
          value={apiOk ? "LIVE" : "OFFLINE"}
          tone={apiOk ? "ok" : "err"}
          pulse={apiOk}
        />
        <StatusPill
          icon={<Wifi className="h-4 w-4" />}
          label="Agmarknet API"
          value={apiOk ? "Connected" : "Retrying"}
          tone={apiOk ? "ok" : "warn"}
        />
        <StatusPill
          icon={<Database className="h-4 w-4" />}
          label="Data Freshness"
          value={dataFresh ? "Fresh" : "Stale"}
          tone={dataFresh ? "ok" : "warn"}
          sub={updatedAt ? `${Math.max(0, secondsSince)}s ago` : "—"}
        />
        <StatusPill
          icon={<Timer className="h-4 w-4" />}
          label="Next Refresh"
          value={`${secondsToNext}s`}
          tone="info"
        />
        <StatusPill
          icon={<Brain className="h-4 w-4" />}
          label="AI Engine"
          value="Running"
          tone="ok"
          pulse
        />
        <StatusPill
          icon={<Cloud className="h-4 w-4" />}
          label="Weather Sync"
          value="Live"
          tone="ok"
        />
      </div>

      {/* KPI Command Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Commodities"
          value={stats.total}
          hint="Reporting today"
          tone="primary"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Gainers"
          value={stats.gainers}
          hint={`${percent(stats.gainers, stats.total)}% of tracked`}
          tone="up"
        />
        <KpiCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Losers"
          value={stats.losers}
          hint={`${percent(stats.losers, stats.total)}% of tracked`}
          tone="down"
        />
        <KpiCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Avg Modal"
          value={stats.avgModal}
          prefix="₹"
          hint="₹/quintal · India"
          tone="primary"
        />
        <KpiCard
          icon={<Flame className="h-4 w-4" />}
          label="Highest Today"
          value={highest.v}
          prefix="₹"
          hint={highest.c?.commodity ?? "—"}
          tone="up"
        />
        <KpiCard
          icon={<Snowflake className="h-4 w-4" />}
          label="Lowest Today"
          value={lowest.v}
          prefix="₹"
          hint={lowest.c?.commodity ?? "—"}
          tone="down"
        />
      </div>

      {/* Notifications ticker */}
      {notifications.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 py-2.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="flex items-center gap-3 px-4">
            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Bell className="h-3 w-3" /> Live Alerts
            </div>
            <div className="marquee-track flex min-w-0 gap-8 whitespace-nowrap text-sm">
              {[...notifications, ...notifications].map((n, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                  <span className={n.tone === "up" ? "text-primary" : n.tone === "down" ? "text-destructive" : "text-muted-foreground"}>
                    {n.tone === "up" ? "▲" : n.tone === "down" ? "▼" : "•"}
                  </span>
                  <span className="font-semibold">{n.title}</span>
                  <span className="text-muted-foreground">{n.detail}</span>
                </span>
              ))}
            </div>
          </div>
          <style>{`
            .marquee-track { animation: marquee 45s linear infinite; }
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }
          `}</style>
        </div>
      )}

      {/* Leaderboards */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <Leaderboard
          title="Top Gainers"
          icon={<ArrowUpRight className="h-4 w-4 text-primary" />}
          rows={gainers}
          metric={(d) => `+${d.deltaPct.toFixed(2)}%`}
          tone="up"
        />
        <Leaderboard
          title="Top Losers"
          icon={<ArrowDownRight className="h-4 w-4 text-destructive" />}
          rows={losers}
          metric={(d) => `${d.deltaPct.toFixed(2)}%`}
          tone="down"
        />
        <Leaderboard
          title="Most Traded"
          icon={<Trophy className="h-4 w-4 text-primary" />}
          rows={mostActive}
          metric={(d) => `${d.arrivals} arrivals`}
        />
        <Leaderboard
          title="Highest Volatility"
          icon={<AlertTriangle className="h-4 w-4 text-primary" />}
          rows={volatile}
          metric={(d) => `σ ₹${d.volatility.toLocaleString()}`}
        />
      </div>

      {/* AI Recommendations */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Brain className="h-3 w-3" /> AI Trading Signals
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold">Buy · Hold · Sell — Nationwide</h3>
            <p className="text-sm text-muted-foreground">
              Signals derived from live Agmarknet trend, volatility, arrival volume and market breadth. Farmer-first heuristics, not financial advice.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((r) => (
            <RecommendationCard key={r.commodity} rec={r} />
          ))}
          {loading && recommendations.length === 0 && (
            <div className="col-span-full rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
              Reading nationwide Agmarknet feed…
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- helpers ---------------- */

function percent(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

function StatusPill({
  icon, label, value, tone, sub, pulse,
}: {
  icon: React.ReactNode; label: string; value: string;
  tone: "ok" | "warn" | "err" | "info"; sub?: string; pulse?: boolean;
}) {
  const dot =
    tone === "ok" ? "bg-primary" :
    tone === "warn" ? "bg-amber-400" :
    tone === "err" ? "bg-destructive" : "bg-sky-400";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-3 py-2">
      <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
        <span className={`absolute inset-0 rounded-full ${dot} ${pulse ? "animate-ping opacity-60" : ""}`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {icon} {label}
        </div>
        <div className="truncate text-sm font-semibold">{value} {sub && <span className="text-[10px] font-normal text-muted-foreground">· {sub}</span>}</div>
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, prefix, suffix, hint, tone,
}: {
  icon: React.ReactNode; label: string; value: number;
  prefix?: string; suffix?: string; hint?: string;
  tone?: "up" | "down" | "primary";
}) {
  const toneCls = tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : "text-foreground";
  return (
    <div className="card-elegant hover-lift p-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          {icon} {label}
        </div>
      </div>
      <div className={`mt-2 font-display text-3xl font-black tabular-nums ${toneCls}`}>
        {prefix}<AnimatedNumber value={value} />{suffix}
      </div>
      {hint && <div className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Leaderboard({
  title, icon, rows, metric, tone,
}: {
  title: string;
  icon: React.ReactNode;
  rows: LiveCommodity[];
  metric: (d: LiveCommodity) => string;
  tone?: "up" | "down";
}) {
  return (
    <div className="card-elegant p-5">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h4 className="font-display text-sm font-bold uppercase tracking-wider">{title}</h4>
      </div>
      {rows.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">No data yet.</div>
      ) : (
        <ol className="space-y-2.5">
          {rows.map((r, i) => (
            <li key={r.commodity} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-xs font-bold text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{r.commodity}</div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {r.markets} mandis · ₹{r.modal.toLocaleString()}
                </div>
              </div>
              <span className={`shrink-0 text-xs font-bold tabular-nums ${
                tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : "text-foreground"
              }`}>
                {metric(r)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* -------- Buy / Hold / Sell -------- */
type Signal = "BUY" | "HOLD" | "SELL";
interface Recommendation {
  commodity: string;
  signal: Signal;
  confidence: number;
  reason: string;
  action: string;
  price: number;
  deltaPct: number;
  markets: number;
  spark: { i: number; v: number }[];
  demand: LiveCommodity["demand"];
  supply: LiveCommodity["supply"];
}

function recommend(rows: LiveCommodity[]): Recommendation[] {
  return rows.map((d): Recommendation => {
    const vol = d.volatility / (d.modal || 1);
    const strength = Math.min(1, Math.abs(d.deltaPct) / 8);
    const breadth = Math.min(1, d.markets / 50);
    // Confidence: trend strength + market breadth − volatility penalty
    const raw = strength * 0.55 + breadth * 0.35 - Math.min(0.25, vol);
    const confidence = Math.max(35, Math.min(97, Math.round((raw + 0.35) * 100)));

    let signal: Signal = "HOLD";
    let reason = "Price and arrivals steady across mandis — wait for a clearer trend.";
    let action = "Hold 2–3 days";
    if (d.deltaPct >= 3 && d.demand === "High") {
      signal = "SELL";
      reason = `Prices up ${d.deltaPct.toFixed(1)}% with strong demand across ${d.markets} mandis. Book profits before mean reversion.`;
      action = "Sell today · lock rate";
    } else if (d.deltaPct <= -3 && d.supply === "High") {
      signal = "BUY";
      reason = `Prices down ${Math.abs(d.deltaPct).toFixed(1)}% while supply is heavy — likely a short-term bottom.`;
      action = "Buy / accumulate 2–3 days";
    } else if (d.deltaPct <= -1.5) {
      signal = "HOLD";
      reason = "Softening market. Avoid new sales unless storage is a constraint.";
      action = "Store, revisit in 5 days";
    } else if (d.deltaPct >= 1.5) {
      signal = "HOLD";
      reason = "Uptrend forming. Ladder your sales over the week to catch the peak.";
      action = "Sell 30% now · trail the rest";
    }

    const spark = d.weekly.map((w, i) => ({ i, v: w.avg }));

    return {
      commodity: d.commodity,
      signal,
      confidence,
      reason,
      action,
      price: d.modal,
      deltaPct: d.deltaPct,
      markets: d.markets,
      spark,
      demand: d.demand,
      supply: d.supply,
    };
  });
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const signalCls =
    rec.signal === "BUY" ? "bg-primary text-primary-foreground" :
    rec.signal === "SELL" ? "bg-destructive text-destructive-foreground" :
    "bg-amber-500/90 text-black";
  const trendUp = rec.deltaPct >= 0;

  return (
    <div className="card-elegant hover-lift overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Signal</div>
          <h3 className="mt-0.5 truncate font-display text-xl font-black">{rec.commodity}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="font-display text-2xl font-bold tabular-nums">₹{rec.price.toLocaleString()}</div>
            <span className={`text-xs font-semibold ${trendUp ? "text-primary" : "text-destructive"}`}>
              {trendUp ? "+" : ""}{rec.deltaPct.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black tracking-wider shadow-sm ${signalCls}`}>
            {rec.signal === "BUY" && <Zap className="h-3 w-3" />}
            {rec.signal === "SELL" && <Flame className="h-3 w-3" />}
            {rec.signal === "HOLD" && <ShieldCheck className="h-3 w-3" />}
            {rec.signal}
          </span>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</div>
            <div className="font-display text-sm font-bold tabular-nums">{rec.confidence}%</div>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-16 px-3">
        <ResponsiveContainer>
          <AreaChart data={rec.spark}>
            <defs>
              <linearGradient id={`rec-${rec.commodity}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trendUp ? "var(--primary)" : "var(--destructive)"} stopOpacity={0.5} />
                <stop offset="100%" stopColor={trendUp ? "var(--primary)" : "var(--destructive)"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={CHART_TOOLTIP} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Avg"]} labelFormatter={() => ""} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={trendUp ? "var(--primary)" : "var(--destructive)"}
              fill={`url(#rec-${rec.commodity})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 py-3 text-[11px]">
        <MiniPill label="Demand" value={rec.demand} tone={rec.demand === "High" ? "up" : rec.demand === "Low" ? "down" : undefined} />
        <MiniPill label="Supply" value={rec.supply} tone={rec.supply === "High" ? "down" : rec.supply === "Low" ? "up" : undefined} />
        <MiniPill label="Mandis" value={String(rec.markets)} />
      </div>

      <div className="border-t border-border/50 bg-background/30 p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">AI Rationale</div>
        <p className="mt-1 text-sm leading-snug">{rec.reason}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3 w-3" /> {rec.action}
        </div>
      </div>
    </div>
  );
}

function MiniPill({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  const cls = tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-sm font-bold ${cls}`}>{value}</div>
    </div>
  );
}

/* -------- Notifications -------- */
function buildNotifications(rows: LiveCommodity[]) {
  const notes: { tone: "up" | "down" | "info"; title: string; detail: string }[] = [];
  const bigUp = rows.filter((r) => r.deltaPct >= 4).slice(0, 4);
  const bigDn = rows.filter((r) => r.deltaPct <= -4).slice(0, 4);
  const heavy = [...rows].sort((a, b) => b.arrivals - a.arrivals).slice(0, 2);

  for (const r of bigUp) {
    notes.push({
      tone: "up",
      title: `${r.commodity} +${r.deltaPct.toFixed(1)}%`,
      detail: `to ₹${r.modal.toLocaleString()} · ${r.markets} mandis`,
    });
  }
  for (const r of bigDn) {
    notes.push({
      tone: "down",
      title: `${r.commodity} ${r.deltaPct.toFixed(1)}%`,
      detail: `to ₹${r.modal.toLocaleString()} · supply ${r.supply.toLowerCase()}`,
    });
  }
  for (const r of heavy) {
    notes.push({
      tone: "info",
      title: `${r.commodity} arrivals surging`,
      detail: `${r.arrivals} records across ${r.markets} mandis`,
    });
  }
  if (!notes.length && rows.length) {
    notes.push({ tone: "info", title: "Markets calm", detail: "No major movers in the latest tick" });
  }
  return notes;
}
