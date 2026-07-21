import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Brain, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Target, Compass, Sparkles } from "lucide-react";
import { useAgmarknetLive } from "@/lib/agmarknet-live";
import { generateMarketInsights, type MarketInsights } from "@/lib/market-insights.functions";

export function MarketInsightsPanel() {
  const { data, loading: dataLoading } = useAgmarknetLive({ refreshMs: 5 * 60 * 1000, limit: 3000 });
  const call = useServerFn(generateMarketInsights);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!data.length) return;
    setGenerating(true);
    setError(null);
    try {
      const snapshot = data.map((d) => ({
        commodity: d.commodity,
        modal: d.modal,
        previous: d.previous,
        deltaPct: Number(d.deltaPct.toFixed(2)),
        volatility: d.volatility,
        arrivals: d.arrivals,
        topMarket: d.topMarket,
      }));
      const res = await call({ data: { snapshot, scope: "All India · Agmarknet" } });
      if (!res.ok) setError(res.error ?? "AI insight generation failed");
      setInsights(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  // Auto-generate first time when data lands
  useEffect(() => {
    if (data.length && !insights && !generating) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length]);

  return (
    <div className="card-elegant p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold">AI Market Intelligence</h3>
            <p className="text-xs text-muted-foreground">
              Gemini 3.5 Flash reads the live Agmarknet snapshot and drafts a farmer-facing brief.
            </p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={dataLoading || generating || !data.length}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Analysing…" : "Regenerate"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!insights && (dataLoading || generating) && (
        <div className="space-y-3">
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="grid gap-2 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-24 animate-pulse rounded-xl bg-muted/60" />
          </div>
        </div>
      )}

      {insights?.ok && (
        <div className="space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" /> Headline
            </div>
            <h4 className="font-display text-xl font-bold">{insights.headline}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{insights.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <List title="Bullish signals" tone="up" icon={<TrendingUp className="h-4 w-4" />} items={insights.bullish} />
            <List title="Bearish signals" tone="down" icon={<TrendingDown className="h-4 w-4" />} items={insights.bearish} />
            <List title="Volatile commodities" tone="warn" icon={<AlertTriangle className="h-4 w-4" />} items={insights.volatile} />
            <List title="Actionable moves" tone="up" icon={<Target className="h-4 w-4" />} items={insights.actionable} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Callout icon={<Compass className="h-4 w-4 text-primary" />} label="Best buy signal">
              {insights.bestBuy}
            </Callout>
            <Callout icon={<Compass className="h-4 w-4 text-sunrise" />} label="Best sell signal">
              {insights.bestSell}
            </Callout>
          </div>

          {insights.forecast?.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Forecast</div>
              <ul className="grid gap-2 md:grid-cols-2">
                {insights.forecast.map((f, i) => (
                  <li key={i} className="rounded-xl border border-border/40 bg-background/40 p-3">
                    <div className="text-xs font-semibold text-primary">{f.horizon}</div>
                    <div className="text-sm">{f.view}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-xs">
            <span className="text-muted-foreground">Overall market risk</span>
            <span
              className={`rounded-full px-2 py-1 font-semibold ${
                insights.riskLevel === "Low"
                  ? "bg-primary/15 text-primary"
                  : insights.riskLevel === "High"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-sunrise/15 text-sunrise"
              }`}
            >
              {insights.riskLevel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function List({ title, tone, icon, items }: { title: string; tone: "up" | "down" | "warn"; icon: React.ReactNode; items: string[] }) {
  const color = tone === "up" ? "text-primary" : tone === "down" ? "text-destructive" : "text-sunrise";
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
      <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${color}`}>{icon}{title}</div>
      {items.length ? (
        <ul className="space-y-1.5 text-sm">
          {items.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${color.replace("text-", "bg-")}`} />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-muted-foreground">No signals detected.</div>
      )}
    </div>
  );
}

function Callout({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/70 to-background/40 p-4">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}{label}
      </div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}
