import { createServerFn } from "@tanstack/react-start";

const NAV_PATHS = [
  "/", "/crops", "/rotation", "/fertilizer", "/market",
  "/diseases", "/schemes", "/districts", "/analytics",
  "/paddy-future", "/about", "/contact",
];

const SYSTEM_BASE = `You are LEO (Live Expert Operator), a friendly AI agricultural assistant embedded in the KrishiSense website. You help Indian farmers with crops, diseases, weeds, fertilizers, weather, soil, irrigation, market prices, government schemes, and modern farming. Speak in short, warm, farmer-friendly sentences (2–4 sentences max).

You can DRIVE the website. Available navigation paths: ${NAV_PATHS.join(", ")}, and /crops/<slug> for a specific crop.

Return STRICT JSON only, no prose outside JSON, matching:
{
  "speak": "what LEO says out loud, in the requested language",
  "intent": { "type": "navigate", "path": "/crops/<slug>", "highlight"?: "term to highlight" }
        | { "type": "setDistrict", "district": "Guntur" }
        | { "type": "setLanguage", "lang": "en|te|hi" }
        | { "type": "openSearch" }
        | { "type": "toggleTheme" }
        | { "type": "favorite", "slug": "rice" }
        | null
}

Rules:
- Fuzzy-match crop names against the provided slug list. If the user says a crop even loosely (e.g. "పత్తి", "गेहूं", "paddy" → rice, "brinjal" → brinjal), navigate to /crops/<matched-slug>.
- When navigating to a crop, if the user asks about a specific topic, set "highlight" to ONE of these exact tokens so the page auto-scrolls: "land-prep" | "seed" | "irrigation" | "fertilizer" | "diseases" | "stages" | "weeds" | "pests" | "rotation" | "market" | "harvest" | "tips" | "references". Example: "how to fertilize rice?" → navigate /crops/rice with highlight "fertilizer".
- If both a crop and a district are mentioned, include navigate to the crop AND setDistrict via a second follow-up sentence in "speak".
- Prefer setDistrict for known Indian districts.
- If the user asks to change language ("switch to Telugu"), include setLanguage.
- Otherwise intent is null.
- Always answer in the language matching the "lang" input (en=English, te=Telugu, hi=Hindi).`;

async function callGateway(body: unknown, key: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) return { __err: "Too many requests. Please slow down." };
    if (res.status === 402) return { __err: "AI credits exhausted. Please add credits." };
    throw new Error(`LEO gateway ${res.status}: ${text}`);
  }
  return res.json();
}

export const leoChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = data as {
      message?: string;
      lang?: string;
      history?: { role: string; content: string }[];
      context?: Record<string, unknown>;
      cropSlugs?: string[];
    };
    return {
      message: String(d?.message ?? ""),
      lang: (d?.lang as "en" | "te" | "hi") ?? "en",
      history: Array.isArray(d?.history) ? d.history.slice(-6) : [],
      context: d?.context ?? {},
      cropSlugs: Array.isArray(d?.cropSlugs) ? d.cropSlugs.slice(0, 200) : [],
    };
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const slugHint = data.cropSlugs.length ? `Known crop slugs: ${data.cropSlugs.join(", ")}.` : "";

    const messages = [
      { role: "system", content: SYSTEM_BASE },
      { role: "system", content: `Session context (JSON): ${JSON.stringify(data.context)}. Reply in language: ${data.lang}. ${slugHint}` },
      ...data.history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: data.message },
    ];

    const json: any = await callGateway({
      model: "google/gemini-2.5-flash",
      messages,
      response_format: { type: "json_object" },
    }, key);

    if (json?.__err) return { speak: json.__err, intent: null };

    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content);
      return { speak: String(parsed.speak ?? "I didn't catch that."), intent: parsed.intent ?? null };
    } catch {
      return { speak: content.slice(0, 400), intent: null };
    }
  });

// Vision endpoint for disease/weed/pest identification from a photo.
export const leoIdentify = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = data as { imageDataUrl?: string; lang?: string; kind?: string };
    return {
      imageDataUrl: String(d?.imageDataUrl ?? ""),
      lang: (d?.lang as "en" | "te" | "hi") ?? "en",
      kind: (d?.kind as "disease" | "weed" | "pest" | "crop" | "any") ?? "any",
    };
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    if (!data.imageDataUrl.startsWith("data:image/")) {
      throw new Error("Invalid image data");
    }

    const target =
      data.kind === "disease" ? "plant disease" :
      data.kind === "weed" ? "weed species" :
      data.kind === "pest" ? "crop pest / insect" :
      data.kind === "crop" ? "crop species" :
      "plant, disease, weed or pest";

    const prompt = `You are an expert agronomist. Identify the ${target} in this photo relevant to Indian agriculture. Return STRICT JSON: {
  "summary": "one-sentence field-friendly answer in language ${data.lang}",
  "topMatches": [
    { "name": "common name", "scientificName": "...", "confidence": 0-100, "severity": 1-5,
      "symptoms": "short", "cause": "short", "organicControl": "short", "chemicalControl": "short",
      "recommendedCrops": ["slug1","slug2"] }
  ],
  "advice": "2-3 sentences of practical next steps in language ${data.lang}"
}. Provide 1-3 top matches, best first. Never invent — if unclear, set confidence low and say so in advice.`;

    const json: any = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "user", content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: data.imageDataUrl } },
        ] },
      ],
      response_format: { type: "json_object" },
    }, key);

    if (json?.__err) return { summary: json.__err, topMatches: [], advice: "" };

    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content);
      return {
        summary: String(parsed.summary ?? ""),
        topMatches: Array.isArray(parsed.topMatches) ? parsed.topMatches.slice(0, 3) : [],
        advice: String(parsed.advice ?? ""),
      };
    } catch {
      return { summary: content.slice(0, 300), topMatches: [], advice: "" };
    }
  });
