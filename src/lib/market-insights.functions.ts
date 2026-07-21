import { createServerFn } from "@tanstack/react-start";

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
  headline: string;
  summary: string;
  bullish: string[];
  bearish: string[];
  volatile: string[];
  actionable: string[];
  forecast: { horizon: string; view: string }[];
  bestBuy: string;
  bestSell: string;
  riskLevel: "Low" | "Moderate" | "High";
  error?: string;
}

const SYSTEM = `You are an expert Indian agricultural market analyst.
You will receive a JSON snapshot of live Agmarknet mandi prices (data.gov.in) for many commodities across India.
Produce a concise, farmer-facing market brief in clear plain English. Do NOT invent prices — use only what is in the JSON.
Return ONLY strict JSON matching the schema. No prose outside JSON. No markdown fences.
Schema:
{
  "headline": string (<= 90 chars),
  "summary": string (2-3 sentences, plain English),
  "bullish": string[] (up to 4 short bullet insights on gainers, name commodities),
  "bearish": string[] (up to 4 short bullet insights on losers),
  "volatile": string[] (up to 3 commodities with high price volatility),
  "actionable": string[] (up to 4 concrete recommendations for farmers/traders),
  "forecast": [{"horizon":"Short-term (1-2 wk)","view": string},{"horizon":"Medium-term (1-2 mo)","view": string}],
  "bestBuy": string (one sentence, name specific commodity),
  "bestSell": string (one sentence, name specific commodity),
  "riskLevel": "Low"|"Moderate"|"High"
}`;

export const generateMarketInsights = createServerFn({ method: "POST" })
  .inputValidator((input: { snapshot: MarketInsightSummary[]; scope?: string }) => input)
  .handler(async ({ data }): Promise<MarketInsights> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        ok: false,
        headline: "",
        summary: "",
        bullish: [], bearish: [], volatile: [], actionable: [],
        forecast: [], bestBuy: "", bestSell: "", riskLevel: "Moderate",
        error: "LOVABLE_API_KEY missing",
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
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: "google/gemini-3.5-flash",
          response_format: { type: "json_object" },
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
        headline: parsed.headline ?? "",
        summary: parsed.summary ?? "",
        bullish: parsed.bullish ?? [],
        bearish: parsed.bearish ?? [],
        volatile: parsed.volatile ?? [],
        actionable: parsed.actionable ?? [],
        forecast: parsed.forecast ?? [],
        bestBuy: parsed.bestBuy ?? "",
        bestSell: parsed.bestSell ?? "",
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
