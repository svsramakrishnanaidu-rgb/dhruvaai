import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { routeCatalogText, ACTION_CATALOG } from "./registry";

/**
 * Conversation Engine — server-side brain of the Krish Sense AI OS.
 *
 * Receives the live screen snapshot + short conversation memory, returns a
 * spoken-quality reply in the user's language plus a list of safe UI actions
 * drawn only from the action catalogue.
 */

const Input = z.object({
  message: z.string().min(1).max(4000),
  lang: z.enum(["en", "te", "hi"]).default("en"),
  screen: z.string().max(9000).default(""),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(12)
    .default([]),
  favourites: z.array(z.string()).max(8).default([]),
  imageDataUrl: z.string().max(3_500_000).optional(),
});

export type AssistantReply = {
  reply: string;
  actions: {
    type: string;
    path?: string;
    lang?: string;
    theme?: string;
    scale?: number;
    high?: boolean;
    to?: string;
    label?: string;
  }[];
  suggestions: string[];
  error?: string;
};

const LANG_NAME: Record<string, string> = {
  en: "English",
  te: "Telugu (తెలుగు)",
  hi: "Hindi (हिन्दी)",
};

function systemPrompt(lang: string, favourites: string[]) {
  return `You are KRISH AI — the built-in assistant of "Krish Sense", an Indian agricultural advisory web app.

You can see the user's CURRENT SCREEN (a text snapshot of the live DOM) and you know every route in the app.

ROUTES:
${routeCatalogText()}

ACTIONS you may return (never invent others):
${ACTION_CATALOG.map((a) => `- ${a.type} ${a.args} — ${a.desc}`).join("\n")}

RULES
- Answer in ${LANG_NAME[lang] ?? "English"} regardless of the language of the screen text: read the English UI, then explain naturally in that language.
- Be concise and spoken-friendly: 2–5 short sentences unless the user asks to read everything.
- Ground every answer in the screen snapshot and the app's real features. If something is not on screen and not in the route list, say you don't have it rather than inventing it.
- "What is this page / explain this screen / explain this chart" → explain purpose, key data visible, how to use it, and one practical tip.
- "Read this page / read everything" → return action read_page and a one-line intro.
- Navigation or settings requests → return the matching action AND confirm it in the reply ("Opening live weather…").
- Never claim to change prices, data, accounts or source code. You control navigation, language, theme, text size, contrast, search, scrolling and clicking visible controls only.
- Farming questions (crops, doses, pests, market, weather) → answer as an agronomy expert, always advising a local soil test before applying fertilizer.
${favourites.length ? `- The user visits these screens most: ${favourites.join(", ")}. Prefer them when suggesting next steps.` : ""}

Return STRICT JSON only:
{"reply": string, "actions": [{"type": "...", ...args}], "suggestions": [up to 3 short follow-up questions the user could ask next]}`;
}

export const askAssistant = createServerFn({ method: "POST" })
  .validator((i: unknown) => Input.parse(i))
  .handler(async ({ data }): Promise<AssistantReply> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return { reply: "", actions: [], suggestions: [], error: "AI is not configured on this deployment." };
    }

    const userContent: unknown = data.imageDataUrl
      ? [
          { type: "text", text: `SCREEN SNAPSHOT:\n${data.screen}\n\nUSER: ${data.message}` },
          { type: "image_url", image_url: { url: data.imageDataUrl } },
        ]
      : `SCREEN SNAPSHOT:\n${data.screen}\n\nUSER: ${data.message}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          reasoning_effort: "none",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt(data.lang, data.favourites) },
            ...data.history,
            { role: "user", content: userContent },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const msg =
          res.status === 429
            ? "Too many requests right now — try again in a moment."
            : res.status === 402
              ? "AI credits are exhausted for this workspace."
              : `AI error ${res.status}. ${body.slice(0, 140)}`;
        return { reply: "", actions: [], suggestions: [], error: msg };
      }

      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const raw = json.choices?.[0]?.message?.content ?? "{}";
      let parsed: Partial<AssistantReply> = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            parsed = JSON.parse(m[0]);
          } catch {
            /* fall through */
          }
        }
      }

      return {
        reply: typeof parsed.reply === "string" && parsed.reply.trim() ? parsed.reply.trim() : raw.slice(0, 900),
        actions: Array.isArray(parsed.actions) ? (parsed.actions.slice(0, 4) as AssistantReply["actions"]) : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3).map(String) : [],
      };
    } catch (err) {
      return {
        reply: "",
        actions: [],
        suggestions: [],
        error: err instanceof Error ? err.message : "Assistant request failed.",
      };
    }
  });
