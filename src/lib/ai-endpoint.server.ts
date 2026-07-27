/**
 * AI gateway resolver (server-only).
 *
 * Krish Sense talks to any OpenAI-compatible chat endpoint. The first provider
 * whose API key is configured wins:
 *
 *   OPENAI_API_KEY      -> OpenAI            (primary)
 *   GEMINI_API_KEY      -> Google AI Studio  (generous free tier)
 *   OPENROUTER_API_KEY  -> OpenRouter        (has free ":free" models)
 *   GROQ_API_KEY        -> Groq              (free, very fast)
 *
 * Never import this from browser code.
 */

export type AiProvider = "openai" | "google" | "openrouter" | "groq";

export type AiEndpoint = {
  url: string;
  headers: Record<string, string>;
  model: string;
  provider: AiProvider;
  /** Some free providers do not implement JSON response_format. */
  supportsJsonMode: boolean;
};

/** Model ids per provider, keyed by the capability the caller asks for. */
type Tier = "fast" | "smart";

const MODELS: Record<AiProvider, Record<Tier, string>> = {
  openai: { fast: "gpt-4o-mini", smart: "gpt-4o" },
  google: { fast: "gemini-2.5-flash", smart: "gemini-2.5-pro" },
  openrouter: {
    fast: "google/gemini-2.0-flash-exp:free",
    smart: "deepseek/deepseek-chat-v3.1:free",
  },
  groq: { fast: "llama-3.3-70b-versatile", smart: "llama-3.3-70b-versatile" },
};

/**
 * Resolve the active chat endpoint. Returns null when no provider key exists.
 */
export function resolveAiEndpoint(tier: Tier = "fast"): AiEndpoint | null {
  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    return {
      url: "https://api.openai.com/v1/chat/completions",
      headers: { Authorization: `Bearer ${openai}`, "Content-Type": "application/json" },
      model: MODELS.openai[tier],
      provider: "openai",
      supportsJsonMode: true,
    };
  }

  const google = process.env.GEMINI_API_KEY;
  if (google) {
    return {
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      headers: { Authorization: `Bearer ${google}`, "Content-Type": "application/json" },
      model: MODELS.google[tier],
      provider: "google",
      supportsJsonMode: true,
    };
  }

  const openrouter = process.env.OPENROUTER_API_KEY;
  if (openrouter) {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      headers: { Authorization: `Bearer ${openrouter}`, "Content-Type": "application/json" },
      model: MODELS.openrouter[tier],
      provider: "openrouter",
      supportsJsonMode: true,
    };
  }

  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    return {
      url: "https://api.groq.com/openai/v1/chat/completions",
      headers: { Authorization: `Bearer ${groq}`, "Content-Type": "application/json" },
      model: MODELS.groq[tier],
      provider: "groq",
      supportsJsonMode: true,
    };
  }

  return null;
}

/** Human-readable name of the gateway currently in use. */
export function activeAiProviderLabel(): string {
  const ep = resolveAiEndpoint();
  if (!ep) return "none";
  return {
    openai: "OpenAI",
    google: "Google AI Studio",
    openrouter: "OpenRouter",
    groq: "Groq",
  }[ep.provider];
}

