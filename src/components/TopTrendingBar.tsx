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
    <div className="web-glass relative flex-1 overflow-hidden rounded-[2.5rem] border-web-leaf/10 p-5 font-[Plus Jakarta Sans]">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-web-emerald/10 blur-3xl" />
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-web-emerald/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-web-emerald">
          <MapPin className="h-3 w-3 text-web-gold" /> {scope}
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-web-sage">
          <Radio className="h-3 w-3 animate-pulse text-web-emerald" /> Live · Agmarknet
        </span>
      </div>

      {loading || !item ? (
        <div className="mt-5 h-20 animate-pulse rounded-xl bg-muted/30" />
      ) : (
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-web-gold" />
              <div className="truncate font-[Unbounded] text-2xl font-black text-web-mist">{item.commodity}</div>
            </div>
            <div className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-web-sage">
              Top mandi: <span className="text-web-mist">{item.topMarket || "—"}</span>
              {" · "}{item.markets} markets · {item.arrivals} arrivals
            </div>
          </div>
          <div className="text-right">
            <div className="font-[Unbounded] text-3xl font-black tabular-nums text-web-mist">
              ₹<AnimatedNumber value={item.modal} />
            </div>
            <div className={`inline-flex items-center gap-1 text-[11px] font-black tabular-nums uppercase tracking-widest ${up ? "text-web-emerald" : "text-rose-500"}`}>
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
    <section className="space-y-3 font-[Plus Jakarta Sans]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[Unbounded] text-2xl font-black text-web-mist">🔥 Live Trending Now</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-web-sage">
            Real-time hottest commodities by daily price momentum — streamed from Agmarknet.
          </p>
        </div>
        <div className="text-[9px] font-black uppercase tracking-widest text-web-sage opacity-60">Auto-refresh · every 60s</div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <Panel scope="Andhra Pradesh" item={hottest(ap.data)} loading={ap.loading} />
        <Panel scope="All India" item={hottest(india.data)} loading={india.loading} />
      </div>
    </section>
  );
}
