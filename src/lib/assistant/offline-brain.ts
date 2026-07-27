/**
 * Offline brain — deterministic fallback for the Krish Sense AI OS.
 *
 * Whenever the model gateway is unreachable, rate-limited or out of quota, the
 * assistant must still DO what the user asked instead of showing an error.
 * This resolver understands the app's own vocabulary (routes, settings,
 * accessibility, reading, scrolling) and answers from local data.
 *
 * Pure, dependency-free and safe to run on both server and client.
 */

import { APP_ROUTES } from "./registry";
import type { AssistantReply } from "./assistant.functions";

type Lang = "en" | "te" | "hi";

const T = {
  opening: {
    en: (n: string) => `Opening ${n}…`,
    te: (n: string) => `${n} తెరుస్తున్నాను…`,
    hi: (n: string) => `${n} खोल रहा हूँ…`,
  },
  reading: {
    en: "Reading this screen for you.",
    te: "ఈ స్క్రీన్‌ను చదువుతున్నాను.",
    hi: "यह स्क्रीन पढ़ रहा हूँ।",
  },
  search: {
    en: "Search is open — type a crop, district or disease.",
    te: "సెర్చ్ తెరిచాను — పంట, జిల్లా లేదా వ్యాధి టైప్ చేయండి.",
    hi: "खोज खुल गई — फ़सल, ज़िला या रोग टाइप करें।",
  },
  langSet: {
    en: "Language switched to English.",
    te: "భాష తెలుగుకు మార్చాను.",
    hi: "भाषा हिन्दी में बदल दी।",
  },
  scrolled: {
    en: "Scrolled for you.",
    te: "స్క్రోల్ చేశాను.",
    hi: "स्क्रॉल कर दिया।",
  },
  here: {
    en: (n: string, p: string) => `${n}: ${p}`,
    te: (n: string, p: string) => `${n}: ${p}`,
    hi: (n: string, p: string) => `${n}: ${p}`,
  },
  guide: {
    en: "Here's what I can open for you right now:",
    te: "ఇప్పుడు నేను తెరవగలిగేవి:",
    hi: "अभी मैं ये खोल सकता हूँ:",
  },
} as const;

function pick<K extends keyof typeof T>(k: K, lang: Lang) {
  const row = T[k] as Record<Lang, unknown>;
  return row[lang] ?? row.en;
}

/** Score a route against the user's words. */
function matchRoute(q: string) {
  const words = q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  let best: { route: (typeof APP_ROUTES)[number]; score: number } | null = null;
  for (const route of APP_ROUTES) {
    let score = 0;
    for (const w of words) {
      if (w.length < 3) continue;
      if (route.keywords.some((k) => k === w)) score += 3;
      else if (route.keywords.some((k) => k.includes(w) || w.includes(k))) score += 2;
      if (route.name.toLowerCase().includes(w)) score += 2;
      if (route.purpose.toLowerCase().includes(w)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { route, score };
  }
  return best;
}

const NAV_HINT = /\b(open|go to|show|take me|navigate|launch|తెరు|చూపించు|खोल|दिखा)\b/i;

/**
 * Resolve a request without any model call. Always returns a usable reply —
 * never an error — so the assistant keeps working during outages.
 */
export function offlineAnswer(message: string, lang: Lang = "en", screen = ""): AssistantReply {
  const q = message.trim();
  const l = q.toLowerCase();

  // --- Accessibility & appearance -----------------------------------------
  if (/\b(dark|night|డార్క్|डार्क)\b/.test(l))
    return reply("Dark theme on.", [{ type: "set_theme", theme: "dark" }]);
  if (/\b(light|day|లైట్|लाइट)\b/.test(l) && /theme|mode|థీమ్|मोड/.test(l))
    return reply("Light theme on.", [{ type: "set_theme", theme: "light" }]);
  if (/\b(bigger|larger|zoom in|increase text|పెద్ద|बड़ा)\b/.test(l))
    return reply("Text size increased.", [{ type: "set_font_scale", scale: 1.3 }]);
  if (/\b(smaller|reduce text|zoom out|చిన్న|छोटा)\b/.test(l))
    return reply("Text size reduced.", [{ type: "set_font_scale", scale: 1 }]);
  if (/\b(contrast)\b/.test(l))
    return reply("High contrast enabled.", [{ type: "set_contrast", high: true }]);

  // --- Language ------------------------------------------------------------
  if (/\b(telugu|తెలుగు)\b/.test(l))
    return reply(T.langSet.te, [{ type: "set_language", lang: "te" }]);
  if (/\b(hindi|हिन्दी|hindhi)\b/.test(l))
    return reply(T.langSet.hi, [{ type: "set_language", lang: "hi" }]);
  if (/\b(english|ఇంగ్లీష్|अंग्रे)\b/.test(l))
    return reply(T.langSet.en, [{ type: "set_language", lang: "en" }]);

  // --- Reading / scrolling / search ---------------------------------------
  if (/\b(read|aloud|చదవ|पढ़)\b/.test(l))
    return reply(pick("reading", lang) as string, [{ type: "read_page" }]);
  if (/\b(scroll (down|to bottom)|bottom|కింద|नीचे)\b/.test(l))
    return reply(pick("scrolled", lang) as string, [{ type: "scroll", to: "bottom" }]);
  if (/\b(scroll up|top|పైకి|ऊपर)\b/.test(l))
    return reply(pick("scrolled", lang) as string, [{ type: "scroll", to: "top" }]);
  if (/\b(search|find|వెతుక|खोज)\b/.test(l))
    return reply(pick("search", lang) as string, [{ type: "open_search" }]);

  // --- Navigation by route match ------------------------------------------
  const hit = matchRoute(q);
  if (hit && (hit.score >= 3 || NAV_HINT.test(l))) {
    const opening = pick("opening", lang) as (n: string) => string;
    return reply(`${opening(hit.route.name)} ${hit.route.purpose}`, [
      { type: "navigate", path: hit.route.path },
    ]);
  }

  // --- Explain the current screen -----------------------------------------
  if (/\b(what is this|explain|this page|this screen|ఏమిటి|क्या है)\b/.test(l)) {
    const first = screen.split("\n").filter(Boolean).slice(0, 6).join(" · ").slice(0, 400);
    return reply(
      first
        ? `This screen shows: ${first}. Ask me to read it fully or to open any other section.`
        : "This is a Krish Sense screen. Ask me to read it aloud or to open crops, weather, market or fertilizer.",
      [],
    );
  }

  // --- Fallback: capability guide -----------------------------------------
  const menu = APP_ROUTES.slice(0, 8).map((r) => `• ${r.name} — ${r.purpose}`).join("\n");
  return reply(`${pick("guide", lang) as string}\n${menu}`, []);
}

function reply(text: string, actions: AssistantReply["actions"]): AssistantReply {
  return {
    reply: text,
    actions,
    suggestions: ["Open live weather", "Show market prices", "Calculate fertilizer"],
  };
}
