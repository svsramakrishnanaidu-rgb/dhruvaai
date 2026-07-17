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
};
