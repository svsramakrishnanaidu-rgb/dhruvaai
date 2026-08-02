// Deterministic, content-derived AI imagery for the Fertilizer section.
//
// Every image URL is generated from the *data* of the item it illustrates
// (product name, category, form, NPK, crop, soil, section) so no two
// fertilizers — and no two sections of the same fertilizer — share a picture.
// The seed is a stable hash of the prompt, so the same data always renders
// the exact same image (cacheable, SSR-safe, no API key required).

const FNV = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619;
  return Math.abs(h | 0);
};

const STYLE =
  "ultra realistic professional agricultural photography, natural daylight, shallow depth of field, high detail, 8k";

/** Build a unique AI image URL from a descriptive, data-derived prompt. */
export function aiImage(prompt: string, w = 1200, h = 800): string {
  const clean = prompt.replace(/\s+/g, " ").trim().slice(0, 380);
  const seed = FNV(`${clean}|${w}x${h}`);
  const url = encodeURIComponent(`${clean}, ${STYLE}`);
  return `https://image.pollinations.ai/prompt/${url}?width=${w}&height=${h}&seed=${seed}&model=flux&nologo=true&enhance=true`;
}

/**
 * Turns the legacy comma-tag strings used by the fertilizer catalogs into a
 * natural-language prompt, keeping every tag so the result stays unique.
 */
export function aiImageFromTags(tags: string, w = 1200, h = 800): string {
  const words = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return aiImage(words.join(", "), w, h);
}
