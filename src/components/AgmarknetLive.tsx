import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAgmarknet, type AgmarknetRecord } from "@/lib/agmarknet.functions";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import {
  Radio, RefreshCw, Search, Filter, Download, TrendingUp, TrendingDown, Minus,
  MapPin, Calendar, Building2, Wheat, AlertCircle, ExternalLink,
} from "lucide-react";

// Post-2019 Indian States + UTs — matches Agmarknet naming exactly.
export const IN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Chandigarh","NCT of Delhi","Puducherry",
];

const CHART_TOOLTIP = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
} as const;

function fmt(n: number) { return n ? n.toLocaleString("en-IN") : "—"; }
function toISO(ddmmyyyy: string) {
  const [d, m, y] = ddmmyyyy.split("/");
  return d && m && y ? `${y}-${m}-${d}` : ddmmyyyy;
}
function fromISO(iso: string) {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

function movementColor(delta: number) {
  if (delta > 1) return { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", Icon: TrendingUp, label: "▲" };
  if (delta < -1) return { cls: "text-rose-400 bg-rose-500/10 border-rose-500/30", Icon: TrendingDown, label: "▼" };
  return { cls: "text-amber-300 bg-amber-500/10 border-amber-500/30", Icon: Minus, label: "•" };
}

function toCSV(rows: AgmarknetRecord[]): string {
  const head = ["State","District","Market","Commodity","Variety","Grade","Arrival Date","Min ₹/qtl","Max ₹/qtl","Modal ₹/qtl"];
  const body = rows.map((r) =>
    [r.state, r.district, r.market, r.commodity, r.variety, r.grade, r.arrival_date, r.min_price, r.max_price, r.modal_price]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  return [head.join(","), ...body].join("\n");
}
function downloadCSV(rows: AgmarknetRecord[]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mandi-prices-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface AgmarknetLiveProps {
  defaultState?: string;
  defaultCommodity?: string;
  autoRefreshMs?: number;   // default 5 min
  compact?: boolean;        // hides secondary charts (used inside Analytics)
  title?: string;
}

export function AgmarknetLive({
  defaultState = "",
  defaultCommodity = "",
  autoRefreshMs = 5 * 60 * 1000,
  compact = false,
  title = "State-Wise Live Mandi Prices",
}: AgmarknetLiveProps) {
  const [state, setState]         = useState(defaultState);
  const [district, setDistrict]   = useState("");
  const [market, setMarket]       = useState("");
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [variety, setVariety]     = useState("");
  const [dateISO, setDateISO]     = useState<string>("");
  const [q, setQ]                 = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [records, setRecords]     = useState<AgmarknetRecord[]>([]);
  const [updated, setUpdated]     = useState<string>("");
  const [prevModal, setPrevModal] = useState<Map<string, number>>(new Map());
  const [activeKey, setActiveKey] = useState<string>("");
  const timerRef = useRef<number | null>(null);

  async function load() {
    setLoading(true); setError(null);
    const res = await fetchAgmarknet({
      data: {
        state: state || undefined,
        district: district || undefined,
        market: market || undefined,
        commodity: commodity || undefined,
        variety: variety || undefined,
        date: dateISO ? fromISO(dateISO) : undefined,
        limit: 500,
      },
    });
    if (!res.ok) setError(res.error ?? "Failed to load data.");
    // remember previous modal per key so we can show movement chips
    setPrevModal((prev) => {
      const next = new Map(prev);
      for (const r of records) next.set(rowKey(r), r.modal_price);
      return next;
    });
    setRecords(res.records as AgmarknetRecord[]);
    setUpdated(res.updated);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => { void load(); }, autoRefreshMs);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, district, market, commodity, variety, dateISO]);

  // filter option lists derive from current result set
  const districts = useMemo(() => uniq(records.map((r) => r.district)).sort(), [records]);
  const markets   = useMemo(() => uniq(records.map((r) => r.market)).sort(), [records]);
  const varieties = useMemo(() => uniq(records.map((r) => r.variety)).sort(), [records]);

  const searched = useMemo(() => {
    if (!q.trim()) return records;
    const needle = q.trim().toLowerCase();
    return records.filter((r) =>
      [r.commodity, r.market, r.district, r.state, r.variety].some((v) =>
        v.toLowerCase().includes(needle),
      ),
    );
  }, [records, q]);

  const stats = useMemo(() => {
    if (!searched.length) return null;
    const modal = searched.map((r) => r.modal_price).filter((n) => n > 0);
    const min = searched.map((r) => r.min_price).filter((n) => n > 0);
    const max = searched.map((r) => r.max_price).filter((n) => n > 0);
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    return {
      count: searched.length,
      modalAvg: avg(modal),
      minAvg: avg(min),
      maxAvg: avg(max),
      top: [...searched].sort((a, b) => b.modal_price - a.modal_price).slice(0, 6),
      bot: [...searched].sort((a, b) => a.modal_price - b.modal_price).slice(0, 6),
    };
  }, [searched]);

  const active = useMemo(() => {
    if (!activeKey) return null;
    return searched.find((r) => rowKey(r) === activeKey) ?? null;
  }, [activeKey, searched]);

  return (
    <div className="rounded-3xl border border-white/10 bg-card/50 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <Radio className="h-4 w-4 text-emerald-400" />
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Source: <a className="underline" href="https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi" target="_blank" rel="noreferrer">data.gov.in <ExternalLink className="inline h-3 w-3" /></a></span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Updated {updated ? new Date(updated).toLocaleTimeString() : "—"}</span>
          <button
            onClick={() => void load()}
            className="ml-2 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
            aria-label="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => downloadCSV(searched)}
            disabled={!searched.length}
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs hover:bg-white/10 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="grid gap-3 border-b border-white/10 bg-black/20 p-4 md:grid-cols-6">
        <Select icon={<MapPin className="h-3.5 w-3.5" />} label="State" value={state}
          onChange={(v) => { setState(v); setDistrict(""); setMarket(""); }}
          options={["", ...IN_STATES]} placeholderText="All States" />
        <Select icon={<Building2 className="h-3.5 w-3.5" />} label="District" value={district}
          onChange={(v) => { setDistrict(v); setMarket(""); }}
          options={["", ...districts]} placeholderText="All Districts" disabled={!districts.length} />
        <Select icon={<Building2 className="h-3.5 w-3.5" />} label="Mandi" value={market}
          onChange={setMarket} options={["", ...markets]} placeholderText="All Mandis" disabled={!markets.length} />
        <TextInput icon={<Wheat className="h-3.5 w-3.5" />} label="Crop"
          value={commodity} onChange={setCommodity} placeholder="e.g. Onion, Paddy" />
        <Select icon={<Filter className="h-3.5 w-3.5" />} label="Variety" value={variety}
          onChange={setVariety} options={["", ...varieties]} placeholderText="Any variety" disabled={!varieties.length} />
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> Date
          </label>
          <input
            type="date"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
            className="rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Search + stats */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-black/10 px-4 py-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search commodity, market, district…"
            className="w-full rounded-lg border border-white/15 bg-black/40 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        {stats && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Stat label="Rows"  value={fmt(stats.count)} />
            <Stat label="Avg Min ₹/qtl"   value={fmt(stats.minAvg)} />
            <Stat label="Avg Modal ₹/qtl" value={fmt(stats.modalAvg)} accent />
            <Stat label="Avg Max ₹/qtl"   value={fmt(stats.maxAvg)} />
          </div>
        )}
      </div>

      {/* Body */}
      {error && (
        <div className="m-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <div className="font-medium">Live data unavailable</div>
            <div className="text-amber-200/80">{error}</div>
          </div>
        </div>
      )}

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Table */}
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card/95 backdrop-blur border-b border-white/10 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Commodity</th>
                <th className="px-3 py-2 text-left">Market · District</th>
                <th className="px-3 py-2 text-left hidden md:table-cell">Variety</th>
                <th className="px-3 py-2 text-right">Min</th>
                <th className="px-3 py-2 text-right">Modal</th>
                <th className="px-3 py-2 text-right">Max</th>
                <th className="px-3 py-2 text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {loading && !searched.length && (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              )}
              {!loading && !searched.length && !error && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  No records for the chosen filters. Try clearing filters or picking today's date.
                </td></tr>
              )}
              {searched.map((r) => {
                const key = rowKey(r);
                const prev = prevModal.get(key);
                const delta = prev ? ((r.modal_price - prev) / prev) * 100 : 0;
                const m = movementColor(delta);
                const active = key === activeKey;
                return (
                  <tr
                    key={key}
                    onClick={() => setActiveKey(key)}
                    className={`cursor-pointer border-b border-white/5 transition hover:bg-white/[.04] ${active ? "bg-primary/10" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.commodity}</div>
                      <div className="text-[10px] text-muted-foreground">{r.arrival_date}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div>{r.market}</div>
                      <div className="text-[10px] text-muted-foreground">{r.district}, {r.state}</div>
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell text-muted-foreground">{r.variety || "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(r.min_price)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-primary">{fmt(r.modal_price)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt(r.max_price)}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${m.cls}`}>
                        <m.Icon className="h-3 w-3" />
                        {prev ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%` : m.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Side panel — top movers / active detail */}
        <aside className="border-t border-white/10 lg:border-l lg:border-t-0 lg:border-white/10 p-4 space-y-4 bg-black/20">
          {active ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Selected</div>
                <div className="text-lg font-semibold">{active.commodity}</div>
                <div className="text-xs text-muted-foreground">{active.market} · {active.district}, {active.state}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <PriceCell label="Min"   value={active.min_price} />
                <PriceCell label="Modal" value={active.modal_price} accent />
                <PriceCell label="Max"   value={active.max_price} />
              </div>
              <div className="text-[11px] text-muted-foreground">
                Variety: <span className="text-foreground">{active.variety || "—"}</span> ·
                Grade: <span className="text-foreground">{active.grade || "—"}</span> ·
                Date: <span className="text-foreground">{active.arrival_date}</span>
              </div>
              <div className="pt-1">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Range across markets</div>
                <div className="h-40">
                  <ResponsiveContainer>
                    <BarChart data={searched.filter((r) => r.commodity === active.commodity).slice(0, 12)}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
                      <XAxis dataKey="market" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} interval={0} angle={-25} textAnchor="end" height={40} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                      <Tooltip contentStyle={CHART_TOOLTIP} />
                      <Bar dataKey="modal_price" radius={[6, 6, 0, 0]}>
                        {searched.filter((r) => r.commodity === active.commodity).slice(0, 12).map((_, i) => (
                          <Cell key={i} fill={i % 2 ? "var(--primary)" : "var(--accent)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            stats && (
              <div className="space-y-4">
                <MoversBlock title="Highest Modal ₹/qtl" rows={stats.top} kind="up" onPick={setActiveKey} />
                <MoversBlock title="Lowest Modal ₹/qtl"  rows={stats.bot} kind="down" onPick={setActiveKey} />
              </div>
            )
          )}

          {!compact && stats && (
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Modal price distribution</div>
              <div className="h-32">
                <ResponsiveContainer>
                  <LineChart data={searched.slice(0, 60).map((r, i) => ({ i, v: r.modal_price }))}>
                    <XAxis dataKey="i" hide />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip contentStyle={CHART_TOOLTIP} formatter={(v) => `₹${fmt(Number(v))}`} />
                    <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------ helpers -------------------------------- */

function rowKey(r: AgmarknetRecord) {
  return `${r.state}|${r.district}|${r.market}|${r.commodity}|${r.variety}|${r.arrival_date}`;
}
function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

function Select({
  label, value, onChange, options, placeholderText, icon, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholderText: string; icon?: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-primary disabled:opacity-40"
      >
        {options.map((o) => (
          <option key={o || "all"} value={o} className="bg-neutral-900 text-white">
            {o || placeholderText}
          </option>
        ))}
      </select>
    </div>
  );
}
function TextInput({
  label, value, onChange, placeholder, icon,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary"
      />
    </div>
  );
}
function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-full border px-3 py-1 ${accent ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/5"}`}>
      <span className="text-muted-foreground">{label}: </span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}
function PriceCell({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-2 ${accent ? "border-primary/40 bg-primary/10" : "border-white/10 bg-white/5"}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`tabular-nums text-sm font-semibold ${accent ? "text-primary" : ""}`}>₹{fmt(value)}</div>
    </div>
  );
}
function MoversBlock({
  title, rows, kind, onPick,
}: {
  title: string; rows: AgmarknetRecord[]; kind: "up" | "down"; onPick: (k: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {kind === "up" ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-rose-400" />}
        {title}
      </div>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={rowKey(r)}>
            <button
              onClick={() => onPick(rowKey(r))}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[.03] px-2.5 py-1.5 text-left text-xs hover:bg-white/[.06]"
            >
              <div className="min-w-0 flex-1 truncate">
                <span className="font-medium">{r.commodity}</span>
                <span className="text-muted-foreground"> · {r.market}</span>
              </div>
              <span className="tabular-nums font-semibold text-primary">₹{fmt(r.modal_price)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
