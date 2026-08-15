import { createServerFn } from "@tanstack/react-start";
import { resolveAiEndpoint } from "@/lib/ai-endpoint.server";


export interface MarketInsightSummary {
  commodity: string;
  modal: number;
  previous: number;
  deltaPct: number;
  volatility: number;
  arrivals: number;
  topMarket: string;
}

export interface MarketInsights {
  ok: boolean;
  headline: { en: string; te: string; hi: string };
  summary: { en: string; te: string; hi: string };
  bullish: { en: string[]; te: string[]; hi: string[] };
  bearish: { en: string[]; te: string[]; hi: string[] };
  volatile: { en: string[]; te: string[]; hi: string[] };
  actionable: { en: string[]; te: string[]; hi: string[] };
  forecast: { en: string; te: string; hi: string };
  bestBuy: { en: string; te: string; hi: string };
  bestSell: { en: string; te: string; hi: string };
  riskLevel: "Low" | "Moderate" | "High";
  error?: string;
}

const SYSTEM = `You are an expert Indian agricultural market analyst.
You will receive a JSON snapshot of live Agmarknet mandi prices (data.gov.in) for top commodities.
Produce a concise, farmer-facing market brief in English, Telugu, and Hindi.
Return ONLY strict JSON matching the schema.

Schema:
{
  "headline": { "en": string, "te": string, "hi": string },
  "summary": { "en": string, "te": string, "hi": string },
  "bullish": { "en": string[], "te": string[], "hi": string[] },
  "bearish": { "en": string[], "te": string[], "hi": string[] },
  "volatile": { "en": string[], "te": string[], "hi": string[] },
  "actionable": { "en": string[], "te": string[], "hi": string[] },
  "forecast": { "en": string, "te": string, "hi": string },
  "bestBuy": { "en": string, "te": string, "hi": string },
  "bestSell": { "en": string, "te": string, "hi": string },
  "riskLevel": "Low"|"Moderate"|"High"
}`;


export const generateMarketInsights = createServerFn({ method: "POST" })
  .validator((input: { snapshot: MarketInsightSummary[]; scope?: string }) => input)
  .handler(async ({ data }): Promise<MarketInsights> => {
    const endpoint = resolveAiEndpoint("smart");
    const emptyLangs = { en: "", te: "", hi: "" };
    const emptyLists = { en: [], te: [], hi: [] };
    const empty: MarketInsights = {
      ok: false,
      headline: emptyLangs,
      summary: emptyLangs,
      bullish: emptyLists,
      bearish: emptyLists,
      volatile: emptyLists,
      actionable: emptyLists,
      forecast: emptyLangs,
      bestBuy: emptyLangs,
      bestSell: emptyLangs,
      riskLevel: "Moderate",
    };

    if (!endpoint) return { ...empty, error: "No AI provider key configured" };
    if (!data.snapshot?.length) return { ...empty, error: "No market data available yet." };

    const top = [...data.snapshot].sort((a, b) => b.arrivals - a.arrivals).slice(0, 40);

    try {
      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: endpoint.headers,
        body: JSON.stringify({
          model: endpoint.model,
          ...(endpoint.supportsJsonMode ? { response_format: { type: "json_object" } } : {}),
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: JSON.stringify({
                scope: data.scope ?? "All India",
                generatedAt: new Date().toISOString(),
                commodities: top,
              }),
            },
          ],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ...empty, error: `Gateway ${res.status}: ${body.slice(0, 200)}` };
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = json.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(text) as Partial<MarketInsights>;
      return {
        ok: true,
        headline: parsed.headline ?? emptyLangs,
        summary: parsed.summary ?? emptyLangs,
        bullish: parsed.bullish ?? emptyLists,
        bearish: parsed.bearish ?? emptyLists,
        volatile: parsed.volatile ?? emptyLists,
        actionable: parsed.actionable ?? emptyLists,
        forecast: parsed.forecast ?? emptyLangs,
        bestBuy: parsed.bestBuy ?? emptyLangs,
        bestSell: parsed.bestSell ?? emptyLangs,
        riskLevel: (parsed.riskLevel as MarketInsights["riskLevel"]) ?? "Moderate",
      };
    } catch (err) {
      return { ...empty, error: err instanceof Error ? err.message : String(err) };
    }
  });
