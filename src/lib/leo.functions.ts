import { createServerFn } from "@tanstack/react-start";

const NAV_PATHS = [
  "/", "/crops", "/rotation", "/fertilizer", "/market",
  "/diseases", "/schemes", "/districts", "/analytics",
  "/paddy-future", "/about", "/contact",
];

const SYSTEM = `You are LEO (Live Expert Operator), a friendly AI agricultural assistant embedded in the KrishiSense website. You help Indian farmers with crops, diseases, weeds, fertilizers, weather, soil, irrigation, market prices, government schemes, and modern farming. Speak in short, warm, farmer-friendly sentences (2–4 sentences max).

You can also DRIVE the website. Available navigation paths: ${NAV_PATHS.join(", ")}, and /crops/<slug> for a specific crop (slugs are lowercase with hyphens, e.g. rice, cotton, groundnut, maize, chilli, turmeric, sugarcane, mango, tomato, banana, red-gram, bengal-gram, jowar, bajra, ragi, onion, wheat, potato, soybean).

Return STRICT JSON only, no prose outside JSON, matching:
{
  "speak": "what LEO says out loud, in the requested language",
  "intent": { "type": "navigate", "path": "/crops/rice" } | { "type": "setDistrict", "district": "Guntur" } | { "type": "setLanguage", "lang": "en|te|hi" } | { "type": "openSearch" } | { "type": "toggleTheme" } | null
}

Rules:
- If the user asks to open/show/go to a page or crop, include a navigate intent.
- If the user names a district, include setDistrict.
- If the user asks to change language, include setLanguage using en/te/hi.
- Otherwise intent is null.
- Always answer in the language matching the "lang" input (en=English, te=Telugu, hi=Hindi). Use natural script for Telugu/Hindi.`;

export const leoChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = data as { message?: string; lang?: string; history?: { role: string; content: string }[]; context?: Record<string, unknown> };
    return {
      message: String(d?.message ?? ""),
      lang: (d?.lang as "en" | "te" | "hi") ?? "en",
      history: Array.isArray(d?.history) ? d.history.slice(-6) : [],
      context: d?.context ?? {},
    };
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const messages = [
      { role: "system", content: SYSTEM },
      { role: "system", content: `Session context (JSON): ${JSON.stringify(data.context)}. Reply in language: ${data.lang}.` },
      ...data.history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: data.message },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) return { speak: "I'm getting a lot of requests right now. Please try again in a moment.", intent: null };
      if (res.status === 402) return { speak: "AI credits are exhausted. Please add credits to continue.", intent: null };
      throw new Error(`LEO gateway ${res.status}: ${text}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content);
      return {
        speak: String(parsed.speak ?? "I didn't catch that."),
        intent: parsed.intent ?? null,
      };
    } catch {
      return { speak: content.slice(0, 400), intent: null };
    }
  });
