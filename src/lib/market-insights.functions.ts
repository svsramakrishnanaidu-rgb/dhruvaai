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
    const endpoint = resolveAiEndpoint("fast");
    if (!endpoint) {
      return {
        ok: false,
        headline: "",
        summary: "",
        bullish: [], bearish: [], volatile: [], actionable: [],
        forecast: [], bestBuy: "", bestSell: "", riskLevel: "Moderate",
        error: "No AI provider key configured",
      };
    }

    if (!data.snapshot?.length) {
      return {
        ok: false,
        headline: "",
        summary: "",
        bullish: [], bearish: [], volatile: [], actionable: [],
        forecast: [], bestBuy: "", bestSell: "", riskLevel: "Moderate",
        error: "No market data available yet.",
      };
    }
    // Trim to top ~40 commodities by arrivals to keep prompt small
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
        return {
          ok: false, headline: "", summary: "",
          bullish: [], bearish: [], volatile: [], actionable: [],
          forecast: [], bestBuy: "", bestSell: "", riskLevel: "Moderate",
          error: `Gateway ${res.status}: ${body.slice(0, 200)}`,
        };
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = json.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(text) as Partial<MarketInsights>;
      return {
        ok: true,
        headline: parsed.headline ?? { en: "", te: "", hi: "" },
        summary: parsed.summary ?? { en: "", te: "", hi: "" },
        bullish: parsed.bullish ?? { en: [], te: [], hi: [] },
        bearish: parsed.bearish ?? { en: [], te: [], hi: [] },
        volatile: parsed.volatile ?? { en: [], te: [], hi: [] },
        actionable: parsed.actionable ?? { en: [], te: [], hi: [] },
        forecast: parsed.forecast ?? { en: "", te: "", hi: "" },
        bestBuy: parsed.bestBuy ?? { en: "", te: "", hi: "" },
        bestSell: parsed.bestSell ?? { en: "", te: "", hi: "" },
        riskLevel: (parsed.riskLevel as MarketInsights["riskLevel"]) ?? "Moderate",
      };
    } catch (err) {
      return {
        ok: false, headline: "", summary: "",
        bullish: [], bearish: [], volatile: [], actionable: [],
        forecast: [], bestBuy: "", bestSell: "", riskLevel: "Moderate",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });
