/**
 * Intelligent image pipeline for DHRUVA.
 * Uses Pollinations AI (Flux model) for context-aware, high-quality imagery
 * across the entire application.
 */

interface ImageOptions {
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
}

/**
 * Generates a deterministic AI image URL based on tags and optional parameters.
 * Optimized for fast loading and context accuracy.
 */
export function getSmartImage(tags: string[], options: ImageOptions = {}): string {
  const { width = 1280, height = 720, seed = 42, nologo = true } = options;
  const prompt = encodeURIComponent(
    tags.join(", ") + ", high quality, agricultural photography, professional lighting, macro detail",
  );
  // NOTE: the correct image endpoint is image.pollinations.ai/prompt/*.
  // pollinations.ai/p/* returns an HTML page, which breaks <img> tags.
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    model: "flux",
    referrer: "krishsense",
  });
  if (nologo) params.set("nologo", "true");
  return `https://image.pollinations.ai/prompt/${prompt}?${params.toString()}`;
}

/**
 * Common image presets for different sections of the app.
 */
export const IMAGE_PRESETS = {
  crop: (name: string, stage: string = "mature") => 
    getSmartImage([name, stage, "farming field", "close up"], { seed: 123 }),
  
  disease: (crop: string, disease: string) => 
    getSmartImage([crop, disease, "symptoms", "infected plant", "macro photography"], { seed: 456 }),
  
  market: (commodity: string) => 
    getSmartImage([commodity, "agricultural mandi", "trading", "heaps of crop"], { seed: 789 }),
  
  weather: (condition: string) => 
    getSmartImage(["weather", condition, "agricultural landscape", "atmospheric lighting"], { seed: 101 }),
  
  fertilizer: (name: string) => 
    getSmartImage([name, "fertilizer granules", "packaging", "application in field"], { seed: 202 }),
};
