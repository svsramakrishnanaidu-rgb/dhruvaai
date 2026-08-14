import { getSmartImage } from "./smart-image";

interface ImageOptions {
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
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
