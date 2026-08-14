import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp, TrendingDown, Minus, Search, Star, MapPin, Clock, Radio, RefreshCw,
  IndianRupee, Mic, MicOff, X, Bell, BellRing, SlidersHorizontal, Layers, Building2,
  ArrowUpRight, ArrowDownRight, Gauge, Sparkles, AlertTriangle, Map as MapIcon,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { IMAGE_PRESETS } from "@/lib/smart-image";
import { HeroBanner } from "@/components/HeroBanner";
import heroImg from "@/assets/heroes/market.jpg";
import {
  useMarketFeed, useFavorites, useAlerts, useVoiceSearch, searchSummaries,
  MARKET_CATEGORIES, fmtINR, type CommoditySummary, type MarketCategory,
} from "@/lib/market-intel";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Live Crop Market Intelligence — Krish Sense" },
      { name: "description", content: "Live mandi prices for every crop in India — min, max and modal rates, variety, grade, arrivals, state and district filters, trends and AI selling advice from Agmarknet." },
      { property: "og:title", content: "Live Crop Market Intelligence — Krish Sense" },
      { property: "og:description", content: "Real-time government mandi prices for every Indian crop with state-wise comparison, trends and AI recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketPage,
});

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

function timeAgo(iso: string): string {
  if (!iso) return "—";
  const s = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function tone(pct: number) {
  if (pct > 0.25) return { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", Icon: TrendingUp };
  if (pct < -0.25) return { cls: "text-red-400 bg-red-500/10 border-red-500/25", Icon: TrendingDown };
  return { cls: "text-muted-foreground bg-muted/40 border-border/60", Icon: Minus };
}

function pctText(p: number) { return `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`; }

const MAPS_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as string | undefined;

/* ------------------------------------------------------------------ */
/*  Search bar with autocomplete + voice                               */
/* ------------------------------------------------------------------ */

function SmartSearch({
  value, onChange, suggestions, onPick,
}: { value: string; onChange: (v: string) => void; suggestions: CommoditySummary[]; onPick: (s: CommoditySummary) => void }) {
  const [open, setOpen] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const boxRef = useRef<HTMLDivElement>(null);
  const voice = useVoiceSearch((text) => { onChange(text); setOpen(true); });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!debouncedValue.trim()) return [];
    return searchSummaries(suggestions, debouncedValue);
  }, [debouncedValue, suggestions]);

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search any crop — Black Gram (Urad), Paddy, Wheat, Onion, Turmeric…"
        aria-label="Search crops"
        className="w-full rounded-xl border border-border/50 bg-background/70 py-2.5 pl-9 pr-20 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value && (
          <button onClick={() => onChange("")} aria-label="Clear search" className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {voice.supported && (
          <button
            onClick={() => (voice.listening ? voice.stop() : voice.start())}
            aria-label={voice.listening ? "Stop voice search" : "Start voice search"}
            className={`rounded-full p-1.5 transition ${voice.listening ? "bg-primary text-primary-foreground animate-pulse" : "text-muted-foreground hover:bg-secondary/60"}`}
          >
            {voice.listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {open && debouncedValue.trim() && filteredSuggestions.length > 0 && (
        <ul className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-border/60 bg-card/95 p-1 shadow-elegant backdrop-blur-xl">
          {filteredSuggestions.slice(0, 10).map((s) => (
            <li key={s.commodity}>
              <button
                onClick={() => { onPick(s); setOpen(false); }}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-secondary/60"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{s.commodity}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{s.category} · {s.markets} mandis · {s.states} states</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-display font-bold tabular-nums">{fmtINR(s.modal)}</span>
                  <span className={`block text-[11px] tabular-nums ${s.deltaPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>{pctText(s.deltaPct)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Crop card                                                          */
/* ------------------------------------------------------------------ */

function CropCard({ s, isFav, onFav, onOpen }: { s: CommoditySummary; isFav: boolean; onFav: () => void; onOpen: () => void }) {
  const t = tone(s.deltaPct);
  const gid = `spk-${s.commodity.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-elegant">
      <div className="relative aspect-video w-full overflow-hidden">
        <img 
          src={IMAGE_PRESETS.market(s.commodity)} 
          alt={s.commodity} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
        <div className="absolute right-3 top-3">
          <button onClick={onFav} aria-label={isFav ? "Remove favourite" : "Add favourite"} className="rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/60 hover:text-primary">
            <Star className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>
      </div>
      <div className="p-4">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
      <header className="flex items-start justify-between gap-2">
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="truncate font-display text-base font-bold leading-tight">{s.commodity}</h3>
          <div className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{s.topMandi ? `${s.topMandi.market}, ${s.topMandi.state}` : "—"}</span>
          </div>
        </button>
      </header>

      <button onClick={onOpen} className="mt-3 block w-full text-left">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 font-display text-2xl font-black tabular-nums">
              <IndianRupee className="h-4 w-4 text-primary" />
              <AnimatedNumber value={s.modal} />
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Modal · ₹/Quintal</div>
          </div>
          <div className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold tabular-nums ${t.cls}`}>
            <t.Icon className="h-3 w-3" />{pctText(s.deltaPct)}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
          <div className="rounded-lg bg-background/50 px-2 py-1"><span className="text-muted-foreground">Min</span><div className="font-semibold tabular-nums">{fmtINR(s.min)}</div></div>
          <div className="rounded-lg bg-background/50 px-2 py-1"><span className="text-muted-foreground">Max</span><div className="font-semibold tabular-nums">{fmtINR(s.max)}</div></div>
          <div className="rounded-lg bg-background/50 px-2 py-1"><span className="text-muted-foreground">Arrivals</span><div className="font-semibold tabular-nums">{s.arrivals}</div></div>
        </div>

        <div className="mt-2 -mx-1 h-14">
          <ResponsiveContainer>
            <AreaChart data={s.daily} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.deltaPct < 0 ? "#f87171" : "var(--primary)"} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={s.deltaPct < 0 ? "#f87171" : "var(--primary)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 }} formatter={(v) => [`₹${v}`, "Avg"]} />
              <Area type="monotone" dataKey="avg" stroke={s.deltaPct < 0 ? "#f87171" : "var(--primary)"} strokeWidth={2} fill={`url(#${gid})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </button>

      <footer className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${s.fresh ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50"}`} />
          {s.fresh ? "LIVE" : "STALE"}
        </span>
        <span className="tabular-nums">{s.markets} mandis · {s.states} states</span>
        <span className="tabular-nums">{s.lastArrival}</span>
      </footer>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail drawer                                                      */
/* ------------------------------------------------------------------ */

function DetailDrawer({ s, updated, onClose, onAlert }: {
  s: CommoditySummary; updated: string; onClose: () => void;
  onAlert: (price: number, direction: "above" | "below") => void;
}) {
  const [alertPrice, setAlertPrice] = useState(String(Math.round(s.modal * 1.05)));
  const t = tone(s.deltaPct);
  const mapQ = s.topMandi ? encodeURIComponent(`${s.topMandi.market} mandi, ${s.topMandi.district}, ${s.topMandi.state}`) : "";

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-sm" role="dialog" aria-label={`${s.commodity} market detail`}>
      <button className="flex-1" aria-label="Close detail" onClick={onClose} />
      <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-border/60 bg-card/95 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Radio className="h-3 w-3 animate-pulse" /> {s.category} · Live
            </div>
            <h2 className="mt-2 truncate font-display text-2xl font-black">{s.commodity}</h2>
            <p className="text-xs text-muted-foreground">Arrival {s.lastArrival} · updated {timeAgo(updated)} · Agmarknet (DMI)</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted-foreground hover:bg-secondary/60"><X className="h-4 w-4" /></button>
        </div>

        {/* Price block */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { k: "Modal", v: fmtINR(s.modal) },
            { k: "Minimum", v: fmtINR(s.min) },
            { k: "Maximum", v: fmtINR(s.max) },
            { k: "Window Avg", v: fmtINR(s.avgAll) },
          ].map((x) => (
            <div key={x.k} className="rounded-xl border border-border/60 bg-background/50 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{x.k}</div>
              <div className="font-display text-lg font-black tabular-nums">{x.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-bold tabular-nums ${t.cls}`}><t.Icon className="h-3 w-3" /> Daily {pctText(s.deltaPct)}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/50 px-2.5 py-1 tabular-nums">Weekly {pctText(s.weekPct)}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/50 px-2.5 py-1 tabular-nums">Monthly {pctText(s.monthPct)}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/50 px-2.5 py-1 tabular-nums"><Gauge className="h-3 w-3" /> Volatility {s.volatilityPct.toFixed(1)}%</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/50 px-2.5 py-1">Demand {s.demand} · Supply {s.supply}</span>
        </div>

        {/* AI advice */}
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-primary"><Sparkles className="h-4 w-4" /> AI Market Signal</div>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${s.signal === "BUY" ? "bg-emerald-500/20 text-emerald-400" : s.signal === "SELL" ? "bg-red-500/20 text-red-400" : "bg-muted/60 text-muted-foreground"}`}>{s.signal}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{s.advice}</p>
          <p className="mt-2 text-xs tabular-nums">Next-session projection: <span className="font-bold text-foreground">{fmtINR(s.forecast)}</span> ({pctText(s.forecastPct)})</p>
        </div>

        {/* Trend chart */}
        <section className="mt-5">
          <h3 className="mb-2 font-display text-sm font-bold">Price trend (reported arrival days)</h3>
          <div className="h-52 rounded-2xl border border-border/60 bg-background/40 p-2">
            <ResponsiveContainer>
              <AreaChart data={s.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 }} />
                <Area type="monotone" dataKey="max" stroke="var(--border)" fill="var(--primary)" fillOpacity={0.06} />
                <Area type="monotone" dataKey="avg" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.18} />
                <Area type="monotone" dataKey="min" stroke="var(--border)" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Mandi table */}
        <section className="mt-5">
          <h3 className="mb-2 font-display text-sm font-bold">Mandi-wise live rates ({s.mandis.length})</h3>
          <div className="max-h-80 overflow-auto rounded-2xl border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-card/95 backdrop-blur">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="p-2">Mandi</th><th className="p-2">District</th><th className="p-2">State</th>
                  <th className="p-2">Variety</th><th className="p-2">Grade</th>
                  <th className="p-2 text-right">Min</th><th className="p-2 text-right">Max</th><th className="p-2 text-right">Modal</th>
                </tr>
              </thead>
              <tbody>
                {s.mandis.map((m, i) => (
                  <tr key={`${m.market}-${m.variety}-${i}`} className="border-t border-border/40 hover:bg-secondary/40">
                    <td className="p-2 font-semibold">{m.market}</td>
                    <td className="p-2 text-muted-foreground">{m.district}</td>
                    <td className="p-2 text-muted-foreground">{m.state}</td>
                    <td className="p-2 text-muted-foreground">{m.variety}</td>
                    <td className="p-2 text-muted-foreground">{m.grade}</td>
                    <td className="p-2 text-right tabular-nums">{m.min.toLocaleString("en-IN")}</td>
                    <td className="p-2 text-right tabular-nums">{m.max.toLocaleString("en-IN")}</td>
                    <td className="p-2 text-right font-bold tabular-nums">{m.modal.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* State comparison */}
        <section className="mt-5">
          <h3 className="mb-2 font-display text-sm font-bold">State-wise comparison</h3>
          <div className="h-56 rounded-2xl border border-border/60 bg-background/40 p-2">
            <ResponsiveContainer>
              <BarChart data={s.byState.slice(0, 12)} layout="vertical" margin={{ left: 8, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 }} formatter={(v) => [`₹${v}`, "Modal"]} />
                <Bar dataKey="modal" radius={[0, 6, 6, 0]}>
                  {s.byState.slice(0, 12).map((r, i) => <Cell key={r.name} fill={i === 0 ? "var(--primary)" : "var(--muted-foreground)"} fillOpacity={i === 0 ? 1 : 0.45} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Map */}
        {MAPS_KEY && mapQ && (
          <section className="mt-5">
            <h3 className="mb-2 inline-flex items-center gap-2 font-display text-sm font-bold"><MapIcon className="h-4 w-4 text-primary" /> Best-priced mandi location</h3>
            <iframe
              title={`Map of ${s.topMandi?.market}`}
              loading="lazy"
              className="h-56 w-full rounded-2xl border border-border/60"
              src={`https://www.google.com/maps/embed/v1/search?key=${MAPS_KEY}&q=${mapQ}`}
            />
          </section>
        )}

        {/* Alerts */}
        <section className="mt-5 rounded-2xl border border-border/60 bg-background/40 p-4">
          <h3 className="inline-flex items-center gap-2 font-display text-sm font-bold"><Bell className="h-4 w-4 text-primary" /> Price alert</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
              inputMode="numeric"
              aria-label="Alert price"
              className="w-32 rounded-lg border border-border/50 bg-background/70 px-3 py-2 text-sm tabular-nums outline-none focus:border-primary/60"
            />
            <button onClick={() => onAlert(Number(alertPrice) || 0, "above")} className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">Notify above</button>
            <button onClick={() => onAlert(Number(alertPrice) || 0, "below")} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">Notify below</button>
          </div>
        </section>

        <p className="mt-4 text-[10px] text-muted-foreground">
          Source: data.gov.in / Agmarknet — Directorate of Marketing &amp; Inspection, Ministry of Agriculture &amp; Farmers Welfare. Prices in ₹ per quintal.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type SortKey = "trending" | "gainers" | "losers" | "priceHigh" | "priceLow" | "arrivals" | "az";

function MarketPage() {
  const [stateFilter, setStateFilter] = useState("");
  const feed = useMarketFeed({ state: stateFilter || undefined, limit: 2000, pages: stateFilter ? 3 : 6, refreshMs: 120_000 });

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<MarketCategory | "">("");
  const [district, setDistrict] = useState("");
  const [market, setMarket] = useState("");
  const [variety, setVariety] = useState("");
  const [grade, setGrade] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState<SortKey>("trending");
  const [favOnly, setFavOnly] = useState(false);
  const [openCrop, setOpenCrop] = useState<string | null>(null);
  const [visible, setVisible] = useState(36);

  const { favs, isFav, toggle } = useFavorites();
  const alerts = useAlerts(feed.summaries);

  // Record-level filters re-summarise the feed for exact matches.
  const scoped = useMemo(() => {
    const needsFilter = district || market || variety || grade || date;
    if (!needsFilter) return feed.summaries;
    const rows = feed.records.filter((r) =>
      (!district || r.district === district) &&
      (!market || r.market === market) &&
      (!variety || r.variety === variety) &&
      (!grade || r.grade === grade) &&
      (!date || r.arrival_date === date));
    return searchSummaries(
      // summarizeAll via useMarketFeed is memoised on full records; rebuild locally
      (() => {
        const byCommodity = new Map<string, typeof rows>();
        for (const r of rows) {
          const arr = byCommodity.get(r.commodity) ?? [];
          arr.push(r);
          byCommodity.set(r.commodity, arr);
        }
        return [...byCommodity.entries()].map(([name, rs]) => {
          const base = feed.summaries.find((x) => x.commodity === name);
          const modal = Math.round(rs.reduce((s2, r) => s2 + r.modal_price, 0) / rs.length);
          return base ? { ...base, modal, markets: new Set(rs.map((r) => r.market)).size, arrivals: rs.length } : null;
        }).filter(Boolean) as CommoditySummary[];
      })(),
      "");
  }, [feed.summaries, feed.records, district, market, variety, grade, date]);

  const filtered = useMemo(() => {
    let list = q.trim() ? searchSummaries(scoped, q) : [...scoped];
    if (category) list = list.filter((s) => s.category === category);
    if (favOnly) list = list.filter((s) => favs.includes(s.commodity));
    if (!q.trim()) {
      switch (sort) {
        case "gainers": list.sort((a, b) => b.deltaPct - a.deltaPct); break;
        case "losers": list.sort((a, b) => a.deltaPct - b.deltaPct); break;
        case "priceHigh": list.sort((a, b) => b.modal - a.modal); break;
        case "priceLow": list.sort((a, b) => a.modal - b.modal); break;
        case "arrivals": list.sort((a, b) => b.arrivals - a.arrivals); break;
        case "az": list.sort((a, b) => a.commodity.localeCompare(b.commodity)); break;
        default: list.sort((a, b) => b.arrivals * Math.abs(b.deltaPct) - a.arrivals * Math.abs(a.deltaPct));
      }
    }
    return list;
  }, [scoped, q, category, favOnly, favs, sort]);

  useEffect(() => { setVisible(36); }, [q, category, stateFilter, district, market, variety, grade, date, sort, favOnly]);

  const detail = openCrop ? feed.summaries.find((s) => s.commodity === openCrop) ?? null : null;

  const districtOptions = useMemo(() => {
    const rows = stateFilter ? feed.records.filter((r) => r.state === stateFilter) : feed.records;
    return [...new Set(rows.map((r) => r.district).filter(Boolean))].sort();
  }, [feed.records, stateFilter]);

  const marketOptions = useMemo(() => {
    const rows = feed.records.filter((r) => (!stateFilter || r.state === stateFilter) && (!district || r.district === district));
    return [...new Set(rows.map((r) => r.market).filter(Boolean))].sort();
  }, [feed.records, stateFilter, district]);

  const selectCls = "rounded-xl border border-border/50 bg-background/70 px-2.5 py-2 text-xs font-medium outline-none focus:border-primary/60";

  return (
    <div className="space-y-8 pb-16">
      <HeroBanner
        image={heroImg}
        eyebrow="Live · Government of India"
        title="Crop Market Intelligence"
        description="Real-time mandi prices for every crop across all Indian states and union territories — min, max and modal rates, varieties, grades, arrivals, trends and AI selling advice."
      />

      <div className="container mx-auto space-y-6 px-4">
        {/* Status strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/50 p-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-bold uppercase tracking-wider text-primary">
              <Radio className="h-3 w-3 animate-pulse" /> Live feed
            </span>
            <span className="text-muted-foreground">Agmarknet · data.gov.in (DMI)</span>
            {feed.updated && <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> Updated {timeAgo(feed.updated)}</span>}
          </div>
          <div className="flex items-center gap-2">
            {!alerts.enabled && (
              <button onClick={() => void alerts.enable()} className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-xs font-semibold hover:border-primary/50">
                <BellRing className="h-3.5 w-3.5" /> Enable alerts
              </button>
            )}
            <button onClick={feed.refresh} className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-xs font-semibold hover:border-primary/50">
              <RefreshCw className={`h-3.5 w-3.5 ${feed.refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Crops tracked", value: feed.totals.commodities, icon: Layers },
            { label: "Mandis", value: feed.totals.mandis, icon: Building2 },
            { label: "States / UTs", value: feed.totals.states, icon: MapPin },
            { label: "Gainers", value: feed.totals.gainers, icon: ArrowUpRight },
            { label: "Losers", value: feed.totals.losers, icon: ArrowDownRight },
            { label: "Records", value: feed.totals.records, icon: Gauge },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border border-border/60 bg-card/50 p-3 backdrop-blur-md">
              <k.icon className="h-4 w-4 text-primary" />
              <div className="mt-1 font-display text-xl font-black tabular-nums"><AnimatedNumber value={k.value} /></div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Alerts triggered */}
        {alerts.triggered.length > 0 && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
            <div className="inline-flex items-center gap-2 font-bold"><BellRing className="h-4 w-4" /> Alerts triggered</div>
            <ul className="mt-1 space-y-0.5">
              {alerts.triggered.map((h) => (
                <li key={h.alert.commodity} className="flex items-center justify-between gap-2">
                  <span>{h.alert.commodity} is {h.alert.direction} {fmtINR(h.alert.price)} — now {fmtINR(h.price)}</span>
                  <button onClick={() => alerts.remove(h.alert.commodity)} className="rounded px-2 py-0.5 hover:bg-amber-500/20">dismiss</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-2 rounded-2xl border border-border/60 bg-card/40 p-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <SmartSearch value={q} onChange={setQ} suggestions={searchSummaries(scoped, q)} onPick={(s) => { setQ(s.commodity); setOpenCrop(s.commodity); }} />
            <button
              onClick={() => setFavOnly((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${favOnly ? "border-primary bg-primary text-primary-foreground" : "border-border/50 bg-background/70 text-muted-foreground hover:text-foreground"}`}
            >
              <Star className={`h-3.5 w-3.5 ${favOnly ? "fill-current" : ""}`} /> Favourites
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="State" value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setDistrict(""); setMarket(""); }} className={selectCls}>
              <option value="">All States &amp; UTs</option>
              {feed.facets.states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select aria-label="District" value={district} onChange={(e) => { setDistrict(e.target.value); setMarket(""); }} className={selectCls}>
              <option value="">All Districts</option>
              {districtOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select aria-label="Mandi" value={market} onChange={(e) => setMarket(e.target.value)} className={selectCls}>
              <option value="">All Mandis</option>
              {marketOptions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value as MarketCategory | "")} className={selectCls}>
              <option value="">All Categories</option>
              {MARKET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select aria-label="Variety" value={variety} onChange={(e) => setVariety(e.target.value)} className={selectCls}>
              <option value="">All Varieties</option>
              {feed.facets.varieties.slice(0, 400).map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select aria-label="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} className={selectCls}>
              <option value="">All Grades</option>
              {feed.facets.grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select aria-label="Arrival date" value={date} onChange={(e) => setDate(e.target.value)} className={selectCls}>
              <option value="">All Arrival Dates</option>
              {feed.facets.dates.slice(0, 30).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-background/70 px-2 py-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="bg-transparent text-xs font-medium outline-none">
                <option value="trending">Trending</option>
                <option value="gainers">Top gainers</option>
                <option value="losers">Top losers</option>
                <option value="priceHigh">Price high → low</option>
                <option value="priceLow">Price low → high</option>
                <option value="arrivals">Most arrivals</option>
                <option value="az">A → Z</option>
              </select>
            </div>
            {(stateFilter || district || market || category || variety || grade || date) && (
              <button onClick={() => { setStateFilter(""); setDistrict(""); setMarket(""); setCategory(""); setVariety(""); setGrade(""); setDate(""); }} className="rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {feed.error && (
          <div className="flex items-start gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Live market feed issue</p>
              <p className="text-xs opacity-90">{feed.error}</p>
              <button onClick={feed.refresh} className="mt-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold">Retry now</button>
            </div>
          </div>
        )}

        {/* Grid */}
        {feed.loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-border/40 bg-muted/20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No live records match these filters yet. Try clearing filters or another crop name.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.slice(0, visible).map((s) => (
                <CropCard key={s.commodity} s={s} isFav={isFav(s.commodity)} onFav={() => toggle(s.commodity)} onOpen={() => setOpenCrop(s.commodity)} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="text-center">
                <button onClick={() => setVisible((v) => v + 36)} className="rounded-xl border border-border/60 bg-card/50 px-5 py-2.5 text-sm font-semibold hover:border-primary/50">
                  Load more ({filtered.length - visible} crops)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {detail && (
        <DetailDrawer
          s={detail}
          updated={feed.updated}
          onClose={() => setOpenCrop(null)}
          onAlert={(price, direction) => { if (price > 0) alerts.add({ commodity: detail.commodity, price, direction }); }}
        />
      )}
    </div>
  );
}
