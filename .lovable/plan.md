# Plan - Market & Analytics Enterprise Performance Upgrade

Optimize the Market and Analytics sections for speed, reliability, and accuracy through a multi-layer optimization of the data pipeline, caching, and AI integration.

## User Review Required

> [!IMPORTANT]
> The AI insights currently use a deterministic heuristic on the client and a server function for deeper analysis. I will preserve this structure but optimize the server-side AI calls to be more efficient and strictly validated.

- **Data Privacy**: Market data is sourced from public government APIs (Agmarknet). AI analysis only processes anonymized, aggregated market statistics.
- **Accuracy**: AI is used strictly for trend analysis and natural language summaries. Numerical price data is never "hallucinated" or overwritten by AI.

## Proposed Changes

### Data Pipeline & Backend (`src/lib/agmarknet.server.ts`, `src/lib/agmarknet.functions.ts`)

- Implement server-side response caching (TTL: 5 minutes) for common market queries.
- Add Zod-based validation to the Agmarknet response normalization layer.
- Optimize the paged fetcher to use adaptive concurrency and better error recovery (exponential backoff).
- Implement request deduplication at the server level for identical concurrent queries.

### Caching & State Management (`src/lib/market-intel.ts`)

- Enhance `useMarketFeed` with a more robust client-side cache (using `localStorage` for offline persistence and in-memory for session speed).
- Add background pre-fetching for frequently visited crops/states.
- Implement request cancellation (AbortController) to stop obsolete fetches when filters change rapidly.

### AI Intelligence Layer (`src/lib/market-insights.functions.ts`)

- Optimize the prompt to use smaller, pre-aggregated data snapshots to reduce latency and token usage.
- Add a strictly validated JSON output schema check.
- Ensure multilingual support (English, Telugu, Hindi) for generated insights.

### UI Performance (`src/routes/market.tsx`, `src/components/MarketCommandCenter.tsx`)

- Implement virtualization for long lists of mandi rates.
- Add skeleton loaders and progressive rendering for charts.
- Debounce search and filter inputs (300ms) to prevent excessive API calls.
- Add "Last Updated" and "Source" metadata badges to every data point.

## Verification Plan

### Automated Tests

- Run `vitest` to verify data normalization and validation logic.
- Verify `agmarknet.server.ts` handles API failures and retries correctly.

### Manual Verification

- Test mobile responsiveness and scrolling smoothness on a simulated low-end device.
- Verify that toggling filters quickly does not result in "stale" data landing over "fresh" data (race condition check).
- Check the console for unnecessary re-renders in `MarketCommandCenter`.
