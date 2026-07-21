import { useAgmarknetLive, type LiveCommodity } from "@/lib/agmarknet-live";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Flame, TrendingUp, TrendingDown, MapPin, Radio } from "lucide-react";

/** Compute the "hottest" crop = biggest positive % move with meaningful arrivals. */
function hottest(data: LiveCommodity[]): LiveCommodity | null {
  const eligible = data.filter((d) => d.arrivals >= 5);
  if (!eligible.length) return null;
  return [...eligible].sort((a, b) => b.deltaPct - a.deltaPct)[0];
}

function Panel({ scope, item, loading }: { scope: string; item: LiveCommodity | null; loading: boolean }) {
  const up = (item?.deltaPct ?? 0) >= 0;
  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 p-5">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          <MapPin className="h-3 w-3" /> {scope}
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <Radio className="h-3 w-3 animate-pulse text-primary" /> Live · Agmarknet
        </span>
      </div>

      {loading || !item ? (
        <div className="mt-5 h-20 animate-pulse rounded-xl bg-muted/30" />
      ) : (
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <div className="truncate font-display text-2xl font-black">{item.commodity}</div>
            </div>
            <div className="mt-1 truncate text-xs text-muted-foreground">
              Top mandi: <span className="font-semibold text-foreground">{item.topMarket || "—"}</span>
              {" · "}{item.markets} markets · {item.arrivals} arrivals
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-black tabular-nums">
              ₹<AnimatedNumber value={item.modal} />
            </div>
            <div className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${up ? "text-primary" : "text-destructive"}`}>
              {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {up ? "+" : ""}{item.deltaPct.toFixed(2)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TopTrendingBar() {
  const ap = useAgmarknetLive({ state: "Andhra Pradesh", limit: 1500, refreshMs: 60_000 });
  const india = useAgmarknetLive({ limit: 3000, refreshMs: 60_000 });

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">🔥 Live Trending Now</h2>
          <p className="text-sm text-muted-foreground">
            Real-time hottest commodities by daily price momentum — streamed from Agmarknet.
          </p>
        </div>
        <div className="text-[11px] text-muted-foreground">Auto-refresh · every 60s</div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <Panel scope="Andhra Pradesh" item={hottest(ap.data)} loading={ap.loading} />
        <Panel scope="All India" item={hottest(india.data)} loading={india.loading} />
      </div>
    </section>
  );
}
