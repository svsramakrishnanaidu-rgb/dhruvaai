// Runtime AI translation for any UI string not yet in the static dictionary.
// Batched calls to Lovable AI Gateway with aggressive client-side caching.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { resolveAiEndpoint } from "@/lib/ai-endpoint.server";


const In = z.object({
  lang: z.enum(["te", "hi"]),
  texts: z.array(z.string().min(1).max(500)).min(1).max(60),
});

const LANG_NAME: Record<"te" | "hi", string> = {
  te: "Telugu (తెలుగు)",
  hi: "Hindi (हिन्दी)",
};

export const translateBatch = createServerFn({ method: "POST" })
  .validator((i: unknown) => In.parse(i))
  .handler(async ({ data }): Promise<{ translations: string[] }> => {
    const endpoint = resolveAiEndpoint("fast");
    if (!endpoint) return { translations: data.texts.map((t) => t) };


    const system = `You are a professional agricultural-domain translator into ${LANG_NAME[data.lang]}.
Rules:
- Translate meaning, not word-by-word. Keep it natural and concise.
- Preserve: numbers, units (kg, ha, ₹, %, °C), dates, ISO codes, punctuation.
- Preserve proper nouns and brand/variety names (e.g. Coromandel, IFFCO, DRR Dhan 42, DAP, NPK, MSP, PMFBY).
- Preserve placeholders like {name}, %s, {{value}}.
- Keep leading/trailing whitespace when present.
- Output STRICT JSON: {"t":[...]} with the same number of strings, in the same order.`;

    const user = `Translate each string. Return {"t":[...]} in order.\nInput: ${JSON.stringify(data.texts)}`;

    try {
      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: endpoint.headers,
        body: JSON.stringify({
          model: endpoint.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          ...(endpoint.supportsJsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!res.ok) {
        console.warn("[translateBatch] gateway", res.status, await res.text().catch(() => ""));
        return { translations: data.texts };
      }
      const j = await res.json();
      const raw: string = j?.choices?.[0]?.message?.content ?? "{}";
      let arr: string[] = [];
      try {
        const parsed = JSON.parse(raw);
        arr = Array.isArray(parsed?.t) ? parsed.t
            : Array.isArray(parsed?.translations) ? parsed.translations
            : Array.isArray(parsed) ? parsed
            : [];
      } catch {
        // Try to salvage a JSON array from the raw string
        const m = raw.match(/\[[\s\S]*\]/);
        if (m) { try { arr = JSON.parse(m[0]); } catch {} }
      }
      // Ensure length parity and coerce to strings
      const out = data.texts.map((src, i) => {
        const v = arr[i];
        return typeof v === "string" && v.trim().length > 0 ? v : src;
      });
      return { translations: out };
    } catch (e) {
      console.warn("[translateBatch] error", e);
      return { translations: data.texts };
    }
  });
