import { createServerFn } from "@tanstack/react-start";
import { resolveAiEndpoint } from "@/lib/ai-endpoint.server";


/**
 * Batch translation via Lovable AI Gateway.
 * Input: { items: string[], lang: 'te' | 'hi' }
 * Output: { translations: string[] } — parallel array of same length.
 * The AI returns strict JSON so we can safely map back.
 */
export const translateBatch = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { items?: unknown; lang?: string };
    const items = Array.isArray(d?.items) ? d.items.map((s) => String(s ?? "")).slice(0, 120) : [];
    const lang = d?.lang === "te" || d?.lang === "hi" ? d.lang : "en";
    return { items, lang };
  })
  .handler(async ({ data }) => {
    if (data.lang === "en" || data.items.length === 0) {
      return { translations: data.items };
    }
    
    const endpoint = resolveAiEndpoint("fast");
    if (!endpoint) return { translations: data.items };

    const langName = data.lang === "te" ? "Telugu (తెలుగు)" : "Hindi (हिन्दी)";
    const prompt = `Translate every string in the input JSON array into natural, farmer-friendly ${langName}.
- Preserve numbers, units (kg, ha, °C, %, ₹), scientific names (in italics/Latin) and product/brand names as-is.
- Keep the same order and same array length.
- Do NOT add explanations. Return STRICT JSON: {"translations": ["...", "..."]}`;

    try {
      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: endpoint.headers,
        body: JSON.stringify({
          model: endpoint.model,
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: JSON.stringify({ items: data.items }) },
          ],
          ...(endpoint.supportsJsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      // Translation is an enhancement. Provider authorization, quota, and
      // availability errors must never break the page or its language switcher.
      if (!res.ok) {
        console.warn(`[translateBatch] ${endpoint.provider} returned ${res.status}`);
        return { translations: data.items };
      }

      const json = await res.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(content);
      const out = Array.isArray(parsed.translations) ? parsed.translations : [];
      // Guarantee same length; fall back to originals for any misses.
      return {
        translations: data.items.map((s, i) => (typeof out[i] === "string" && out[i].length > 0 ? out[i] : s)),
      };
    } catch (error) {
      console.warn("[translateBatch] provider request failed", error);
      return { translations: data.items };
    }
  });
