import { createServerFn } from "@tanstack/react-start";

/**
 * Batch translation via Lovable AI Gateway.
 * Input: { items: string[], lang: 'te' | 'hi' }
 * Output: { translations: string[] } — parallel array of same length.
 * The AI returns strict JSON so we can safely map back.
 */
export const translateBatch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = data as { items?: unknown; lang?: string };
    const items = Array.isArray(d?.items) ? d.items.map((s) => String(s ?? "")).slice(0, 120) : [];
    const lang = d?.lang === "te" || d?.lang === "hi" ? d.lang : "en";
    return { items, lang };
  })
  .handler(async ({ data }) => {
    if (data.lang === "en" || data.items.length === 0) {
      return { translations: data.items };
    }
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const langName = data.lang === "te" ? "Telugu (తెలుగు)" : "Hindi (हिन्दी)";
    const prompt = `Translate every string in the input JSON array into natural, farmer-friendly ${langName}.
- Preserve numbers, units (kg, ha, °C, %, ₹), scientific names (in italics/Latin) and product/brand names as-is.
- Keep the same order and same array length.
- Do NOT add explanations. Return STRICT JSON: {"translations": ["...", "..."]}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: JSON.stringify({ items: data.items }) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      if (res.status === 429 || res.status === 402) return { translations: data.items };
      throw new Error(`translate ${res.status}`);
    }
    const json: any = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content);
      const out = Array.isArray(parsed.translations) ? parsed.translations : [];
      // Guarantee same length; fall back to originals for any misses.
      return {
        translations: data.items.map((s, i) => (typeof out[i] === "string" && out[i].length > 0 ? out[i] : s)),
      };
    } catch {
      return { translations: data.items };
    }
  });
