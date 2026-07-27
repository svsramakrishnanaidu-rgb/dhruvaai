/**
 * AI endpoint resolver.
 *
 * Krish Sense can talk to two OpenAI-compatible chat endpoints:
 *
 *  1. Google AI Studio (Gemini) — used when GEMINI_API_KEY is configured.
 *     Billed to the user's own free Google AI Studio quota, so it costs
 *     no Lovable workspace credits.
 *  2. Lovable AI Gateway — automatic fallback when no Gemini key exists.
 *
 * Server-only: never import this from browser code.
 */

const GOOGLE_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

/** Map the gateway-style ids used across the app to plain Google model ids. */
function toGoogleModel(model: string): string {
  const bare = model.replace(/^google\//, "");
  // Google AI Studio only serves the stable Gemini line.
  if (/^gemini-3/.test(bare)) return "gemini-2.5-flash";
  if (/^gpt/.test(bare) || bare.startsWith("openai")) return "gemini-2.5-flash";
  return bare;
}

export type AiEndpoint = {
  url: string;
  headers: Record<string, string>;
  model: string;
  provider: "google" | "lovable";
};

/**
 * Resolve the chat endpoint for a requested model id.
 * Returns null when no provider key is configured at all.
 */
export function resolveAiEndpoint(model: string): AiEndpoint | null {
  const googleKey = process.env.GEMINI_API_KEY;
  if (googleKey) {
    return {
      url: GOOGLE_URL,
      headers: {
        Authorization: `Bearer ${googleKey}`,
        "Content-Type": "application/json",
      },
      model: toGoogleModel(model),
      provider: "google",
    };
  }

  const lovableKey = process.env.LOVABLE_API_KEY;
  if (lovableKey) {
    return {
      url: LOVABLE_URL,
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      model,
      provider: "lovable",
    };
  }

  return null;
}
