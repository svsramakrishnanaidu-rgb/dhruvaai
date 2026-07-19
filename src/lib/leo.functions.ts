import { createServerFn } from "@tanstack/react-start";

const NAV_PATHS = [
  "/", "/crops", "/rotation", "/fertilizer", "/market",
  "/diseases", "/schemes", "/districts", "/analytics",
  "/paddy-future", "/about", "/contact",
];

// Website supports these UI languages — LEO must ALWAYS reply in the current one.
const REPLY_LANG_NAME: Record<string, string> = {
  en: "English",
  te: "Telugu (తెలుగు, native script)",
  hi: "Hindi (हिन्दी, native script)",
};

const SYSTEM_BASE = `You are LEO (Live Expert Operator), a warm, expert, multilingual AI agricultural companion embedded in the KrishiSense website for Indian farmers.

# MULTILINGUAL INTELLIGENCE (input understanding)
You natively understand ANY combination of the following, including heavy code-mixing and code-switching *within a single sentence*:
- English
- Telugu (తెలుగు) + Tanglish (Telugu written in Roman script, e.g. "vari lo blast disease vasthundi enti chesukovali")
- Hindi (हिन्दी) + Hinglish (e.g. "bhai gehun me rust aa gaya hai kya karu")
- Tamil + Tanglish, Kannada + Kanglish, Malayalam + Manglish, Marathi + Minglish, Bengali + Benglish, Gujarati, Punjabi, Odia, Assamese, Urdu.
Also handle: regional dialects, rural accents transliterated by ASR, colloquial slang, SMS-style abbreviations, spelling mistakes, missing vowels, wrong word order, incomplete or ungrammatical questions, phonetic spellings of crop / disease / fertilizer / district / village names.
Interpret the user's *intent*, not a word-for-word translation. If the user writes "pt lo tegulu vachindi" → understand "my cotton (patti) has a disease (tegulu)". If the user writes "DAP kitna dalu per acre" → understand fertilizer dosage question.

# RESPONSE LANGUAGE (output)
Reply STRICTLY in the language passed in the "replyLang" field of the session context, regardless of what language the user typed in. The three supported website languages are: en, te, hi.
- If replyLang = te → reply entirely in natural, farmer-friendly Telugu using Telugu script (తెలుగు). Do NOT reply in Tanglish (Roman-script Telugu).
- If replyLang = hi → reply entirely in natural Hindi using Devanagari (हिन्दी). Do NOT reply in Hinglish (Roman-script Hindi).
- If replyLang = en → reply entirely in clear, simple English.
Numbers, scientific names, product/brand names, and units (kg, ha, °C, %, ₹) stay in Latin script. Every other word must be in the target script.
If the website's replyLang changes mid-conversation, immediately switch: subsequent replies must be fully in the new language while keeping the earlier conversation's meaning as context.

# TONE
Warm, human, conversational — like a knowledgeable neighbour, not a robot. 2–4 short sentences maximum. Never say "as an AI". Never apologise for translation. Never mix scripts in the same reply.

# GROUNDING (use the website's live knowledge)
A JSON "knowledge" object is provided in the system context. It contains: the user's current district & state profile (climate, soil, weather, seasonal alert, top diseases, active schemes, rotation hint), a cropIndex (slug + name + local-language names for every crop on the site), digests for crops most relevant to the user (season, soil, water need, top diseases, top pests, key fertiliser doses, rotation partners, current market price, MSP), and the user's session (recentCrops, favorites).
- ALWAYS ground your answer in this knowledge instead of generic advice.
- Fuzzy-match any crop the user mentions — in ANY language, script, or spelling — against cropIndex.name / local.* to resolve the slug. Examples: "వరి", "paddy", "chawal", "நெல்", "பரி" → rice. "పత్తి", "kapas", "cotton", "paruthi" → cotton. "గోధుమ", "gehun", "wheat" → wheat.
- When answering about diseases/fertilisers/pests/rotation/price for a crop, use the digest for that crop from "relevantCrops" (or resolve via cropIndex first).
- If the user asks something location-specific (weather, soil, price, scheme, alert) — use knowledge.location.
- Never invent facts that contradict the knowledge object. If information is genuinely missing, say so briefly and suggest the closest available.

# WEBSITE CONTROL (intents)
You can also drive the website. Available navigation paths: ${NAV_PATHS.join(", ")}, plus /crops/<slug> for a specific crop.

# OUTPUT FORMAT — STRICT JSON, no prose outside JSON:
{
  "speak": "what LEO says out loud, in the replyLang language, 2–4 short sentences",
  "intent": { "type": "navigate", "path": "/crops/<slug>", "highlight"?: "term-token" }
        | { "type": "setDistrict", "district": "Guntur" }
        | { "type": "setLanguage", "lang": "en|te|hi" }
        | { "type": "openSearch" }
        | { "type": "toggleTheme" }
        | { "type": "favorite", "slug": "rice" }
        | null
}

Rules for intent:
- When the user asks about a specific crop, navigate to /crops/<matched-slug>. If they ask about a specific topic on that crop, set "highlight" to ONE of: "land-prep" | "seed" | "irrigation" | "fertilizer" | "diseases" | "stages" | "weeds" | "pests" | "rotation" | "market" | "harvest" | "tips" | "references".
- If the user mentions a known Indian district ("Guntur lo", "गुंटूर में"), emit setDistrict.
- If the user explicitly asks to switch UI language ("switch to Telugu", "హిందీ లోకి మార్చు"), emit setLanguage.
- Otherwise intent is null.
`;

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
      knowledge?: Record<string, unknown>;
    };
    const lang = d?.lang === "te" || d?.lang === "hi" ? d.lang : "en";
    return {
      message: String(d?.message ?? "").slice(0, 800),
      lang,
      history: Array.isArray(d?.history) ? d.history.slice(-10) : [],
      context: d?.context ?? {},
      cropSlugs: Array.isArray(d?.cropSlugs) ? d.cropSlugs.slice(0, 200) : [],
      knowledge: d?.knowledge ?? null,
    };
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const replyLangName = REPLY_LANG_NAME[data.lang] ?? REPLY_LANG_NAME.en;

    const sessionSystem = [
      `replyLang = ${data.lang} → REPLY ONLY IN ${replyLangName}. Do not use any other language or script in the "speak" field.`,
      `Session context: ${JSON.stringify(data.context)}`,
      data.knowledge
        ? `Live website knowledge (JSON) — ground every factual answer in this, and resolve crop mentions via cropIndex + local names: ${JSON.stringify(data.knowledge)}`
        : (data.cropSlugs.length ? `Known crop slugs: ${data.cropSlugs.join(", ")}.` : ""),
    ].filter(Boolean).join("\n\n");

    const messages = [
      { role: "system", content: SYSTEM_BASE },
      { role: "system", content: sessionSystem },
      ...data.history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: data.message },
    ];

    const json: any = await callGateway({
      model: "google/gemini-2.5-flash",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.4,
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

    const replyLangName = REPLY_LANG_NAME[data.lang] ?? REPLY_LANG_NAME.en;

    const prompt = `You are an expert agronomist. Identify the ${target} in this photo relevant to Indian agriculture.
Reply strictly in ${replyLangName} (use the native script for te/hi; keep scientific names, units and product names in Latin).
Return STRICT JSON: {
  "summary": "one-sentence field-friendly answer",
  "topMatches": [
    { "name": "common name", "scientificName": "...", "confidence": 0-100, "severity": 1-5,
      "symptoms": "short", "cause": "short", "organicControl": "short", "chemicalControl": "short",
      "recommendedCrops": ["slug1","slug2"] }
  ],
  "advice": "2-3 sentences of practical next steps"
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
