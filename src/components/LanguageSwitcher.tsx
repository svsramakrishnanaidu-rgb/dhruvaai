"use client";
import { useEffect, useRef, useState } from "react";
import { Languages, Check } from "lucide-react";
import { LANGS, useI18n, useT } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Select Language"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="tap flex items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground"
      >
        <Languages className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{current.native}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''

# Plan - Market & Analytics Enterprise Performance Upgrade

Optimize the Market and Analytics sections for speed, reliability, and accuracy through a multi-layer optimization of the data pipeline, caching, and AI integration.

## User Review Required

> [!IMPORTANT]
> The AI insights currently use a deterministic heuristic on the client and a server function for deeper analysis. I will preserve this structure but optimize the server-side AI calls to be more efficient and strictly validated.

- Data Privacy: Market data is sourced from public government APIs (Agmarknet). AI analysis only processes anonymized, aggregated market statistics.
- Accuracy: AI is used strictly for trend analysis and natural language summaries. Numerical price data is never 'hallucinated' or overwritten by AI.

## Proposed Changes

### Data Pipeline & Backend (src/lib/agmarknet.server.ts, src/lib/agmarknet.functions.ts)
- Implement server-side response caching (TTL: 5 minutes) for common market queries.
- Add Zod-based validation to the Agmarknet response normalization layer.
- Optimize the paged fetcher to use adaptive concurrency and better error recovery (exponential backoff).
- Implement request deduplication at the server level for identical concurrent queries.

### Caching & State Management (src/lib/market-intel.ts)
- Enhance useMarketFeed with a more robust client-side cache (using localStorage for offline persistence and in-memory for session speed).
- Add background pre-fetching for frequently visited crops/states.
- Implement request cancellation (AbortController) to stop obsolete fetches when filters change rapidly.

### AI Intelligence Layer (src/lib/market-insights.functions.ts)
- Optimize the prompt to use smaller, pre-aggregated data snapshots to reduce latency and token usage.
- Add a strictly validated JSON output schema check.
- Ensure multilingual support (English, Telugu, Hindi) for generated insights.

### UI Performance (src/routes/market.tsx, src/components/MarketCommandCenter.tsx)
- Implement virtualization for long lists of mandi rates.
- Add skeleton loaders and progressive rendering for charts.
- Debounce search and filter inputs (300ms) to prevent excessive API calls.
- Add 'Last Updated' and 'Source' metadata badges to every data point.

## Verification Plan
### Automated Tests
- Run vitest to verify data normalization and validation logic.
- Verify agmarknet.server.ts handles API failures and retries correctly.

### Manual Verification
- Test mobile responsiveness and scrolling smoothness on a simulated low-end device.
- Verify that toggling filters quickly does not result in 'stale' data landing over 'fresh' data (race condition check).
- Check the console for unnecessary re-renders in MarketCommandCenter."
          style={{ animation: "scale-in .18s var(--ease-out-expo) both" }}
          className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border bg-popover py-1 shadow-elegant z-50"
        >
          {LANGS.map((l) => {
            const selected = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={selected}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm transition hover:bg-secondary/60 ${
                    selected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span>
                    <span className="font-medium">{l.native}</span>
                    <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">{l.code}</span>
                  </span>
                  {selected && <Check className="h-3.5 w-3.5 text-primary" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
