/**
 * Krish Sense AI OS — capability registry.
 *
 * The single source of truth the assistant uses to understand what the app
 * can do. Every navigable screen and every safe, user-level action lives
 * here; the model is only ever allowed to emit actions from this list.
 */

export type AppRoute = {
  path: string;
  name: string;
  purpose: string;
  keywords: string[];
};

export const APP_ROUTES: AppRoute[] = [
  { path: "/", name: "Home", purpose: "Cinematic overview: trending crops, live stats, quick actions.", keywords: ["home", "start", "dashboard", "main"] },
  { path: "/crops", name: "Crop Library", purpose: "Browse every crop with season, soil, water and profit filters.", keywords: ["crops", "library", "list", "catalogue"] },
  { path: "/districts", name: "Districts", purpose: "District profiles with soil, rainfall and cultivated crops.", keywords: ["district", "region", "mandal", "state"] },
  { path: "/weather", name: "Live Weather", purpose: "GPS-locked live weather, AQI, soil moisture and farm advisories.", keywords: ["weather", "rain", "temperature", "forecast", "climate"] },
  { path: "/market", name: "Market Prices", purpose: "Live Agmarknet mandi rates, momentum charts and AI market insights.", keywords: ["market", "price", "mandi", "rate", "agmarknet", "sell"] },
  { path: "/fertilizer", name: "Fertilizer Calculator", purpose: "Scale a crop's fertilizer schedule to any land size.", keywords: ["fertilizer", "urea", "dap", "npk", "dose", "calculator"] },
  { path: "/fertilizers", name: "Nutrient Atlas", purpose: "Fertilizer knowledge base: products, nutrients, application.", keywords: ["nutrient", "atlas", "fertilizers", "micronutrient"] },
  { path: "/rotation", name: "Crop Rotation", purpose: "Rotation journeys with gap duration, season and benefits.", keywords: ["rotation", "sequence", "cycle"] },
  { path: "/diseases", name: "Disease Library", purpose: "Pest and disease identification with symptoms and control.", keywords: ["disease", "pest", "symptom", "infection", "spray"] },
  { path: "/atlas", name: "Soil Testing Atlas", purpose: "District-wise soil testing intelligence across India.", keywords: ["soil", "testing", "ph", "atlas"] },
  { path: "/analytics", name: "Analytics", purpose: "Production KPIs and live analysis dashboards.", keywords: ["analytics", "kpi", "stats", "charts", "analysis"] },
  { path: "/calculators", name: "Calculators", purpose: "Seed, yield, irrigation and profit calculators with CSV export.", keywords: ["calculator", "yield", "seed", "profit", "irrigation"] },
  { path: "/schemes", name: "Government Schemes", purpose: "Subsidies, MSP and scheme eligibility.", keywords: ["scheme", "subsidy", "msp", "government", "pmfby"] },
  { path: "/paddy-future", name: "Paddy Future", purpose: "MSP and yield projections for paddy through 2030.", keywords: ["paddy", "rice", "future", "projection", "msp"] },
  { path: "/music", name: "Music", purpose: "Trending farm radio with a persistent mini player.", keywords: ["music", "song", "play", "radio"] },
  { path: "/permissions", name: "Permissions", purpose: "Location permission status, testing and re-enable guidance.", keywords: ["permission", "location", "gps", "access"] },
  { path: "/about", name: "About", purpose: "About Krish Sense and the team.", keywords: ["about", "team", "who"] },
  { path: "/contact", name: "Contact", purpose: "Get in touch with the Krish Sense team.", keywords: ["contact", "support", "help", "email"] },
];

/** Actions the assistant may perform on the user's behalf. */
export const ACTION_CATALOG = [
  { type: "navigate", args: "{ path: string }", desc: "Go to a route from the route list." },
  { type: "set_language", args: "{ lang: 'en' | 'te' | 'hi' }", desc: "Switch the whole UI language instantly." },
  { type: "set_theme", args: "{ theme: 'dark' | 'light' }", desc: "Switch colour theme." },
  { type: "set_font_scale", args: "{ scale: number }", desc: "Accessibility text size, 0.9–1.6." },
  { type: "set_contrast", args: "{ high: boolean }", desc: "High-contrast accessibility mode." },
  { type: "open_search", args: "{}", desc: "Open the global search palette." },
  { type: "read_page", args: "{}", desc: "Read the current screen aloud, summarised." },
  { type: "scroll", args: "{ to: 'top' | 'bottom' }", desc: "Scroll the current page." },
  { type: "click", args: "{ label: string }", desc: "Click a visible button/link whose text matches the label." },
  { type: "none", args: "{}", desc: "Answer only, take no action." },
] as const;

export type AssistantAction =
  | { type: "navigate"; path: string }
  | { type: "set_language"; lang: "en" | "te" | "hi" }
  | { type: "set_theme"; theme: "dark" | "light" }
  | { type: "set_font_scale"; scale: number }
  | { type: "set_contrast"; high: boolean }
  | { type: "open_search" }
  | { type: "read_page" }
  | { type: "scroll"; to: "top" | "bottom" }
  | { type: "click"; label: string }
  | { type: "none" };

/**
 * Actions that mutate data or spend money must be confirmed before running.
 * Every action in this build is a reversible, user-level UI preference, so the
 * list is intentionally empty — extend it as write-capable tools are added.
 */
export const CONFIRM_REQUIRED: AssistantAction["type"][] = [];


export function routeCatalogText(): string {
  return APP_ROUTES.map((r) => `${r.path} — ${r.name}: ${r.purpose}`).join("\n");
}
