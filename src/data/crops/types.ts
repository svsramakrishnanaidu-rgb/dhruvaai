export type FertilizerDose = { name: string; perAcreKg: number; stage: string };
export type Disease = {
  name: string;
  symptoms: string;
  cause: string;
  organic: string;
  chemical: string;
  severity: number; // 1-5
};
export type LandPrepStep = { title: string; description: string; icon: string };
export type RotationItem = { crop: string; season: string; gapDays: number; benefit: string };
export type MarketPoint = { day: string; price: number };

export type CropCategory =
  | "Cereal"
  | "Pulse"
  | "Millet"
  | "Oilseed"
  | "Cash"
  | "Horticulture"
  | "Spice"
  | "Vegetable"
  | "Fruit"
  | "Plantation"
  | "Fodder"
  | "Flower"
  | "Medicinal";

export type LocalNames = Partial<{
  te: string; // Telugu
  hi: string; // Hindi
  ta: string; // Tamil
  kn: string; // Kannada
  ml: string; // Malayalam
  en: string; // English alt
}>;

export type Crop = {
  slug: string;
  name: string;
  scientificName: string;
  image: string;
  emoji: string;
  season: string;
  suitableDistricts: string[];
  climate: string;
  temperature: string;
  rainfall: string;
  soilType: string;
  soilPh: string;
  waterNeed: "Low" | "Medium" | "High";
  profitPct: number;
  yield: string;
  trending: boolean;
  landPrep: LandPrepStep[];
  seedRate: string;
  seedTreatment: string;
  spacing: string;
  sowingMethod: string;
  irrigation: string[];
  fertilizer: FertilizerDose[];
  weeds: string[];
  diseases: Disease[];
  pests: string[];
  harvesting: string;
  storage: string;
  marketPrice: { unit: string; price: number; msp: number; trend: MarketPoint[] };
  rotation: RotationItem[];
  tips: string[];
  precautions: string[];
  references: { label: string; url: string }[];

  // Optional taxonomy / discovery fields (safe to omit on legacy crops)
  category?: CropCategory;
  family?: string;
  description?: string;
  durationDays?: number;
  localNames?: LocalNames;
  tags?: string[]; // e.g. "cash", "export", "organic-friendly", "drought-tolerant"
};
