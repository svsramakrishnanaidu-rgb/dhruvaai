// Real-world agronomic reference tables & formulas used by the Calculator hub.
// Values are sourced from ICAR, IARI, IIWM, FAO Irrigation & Drainage Paper 56,
// FAO/CGWB, and Government of India (Directorate of Marketing & Inspection, MoAFW)
// public references. Marked in the UI as "Data sources".

export type CropCalcRef = {
  slug: string;
  name: string;
  // Seed rate: kg per acre (ICAR package of practices average)
  seedRatePerAcre: [number, number];
  spacingCm: string;
  // Nutrient recommendation: kg NPK per acre (ICAR general recommendation)
  npkPerAcre: { N: number; P: number; K: number };
  // FAO-56 crop coefficients (mid-season Kc)
  kcMid: number;
  // Total seasonal water requirement (mm) — FAO / IIWM
  seasonalWaterMm: [number, number];
  durationDays: number;
  // National average yield in kg/acre (Agricultural Statistics at a Glance)
  avgYieldPerAcre: number;
  // MSP / market reference price (₹/quintal) - FY25 GoI where applicable
  msp: number;
  // Typical variable cost of cultivation (₹/acre) — CACP CoP reports
  costPerAcre: number;
};

export const CROP_REFS: CropCalcRef[] = [
  { slug: "rice", name: "Rice (Paddy)", seedRatePerAcre: [8, 12], spacingCm: "20×15", npkPerAcre: { N: 48, P: 24, K: 24 }, kcMid: 1.2, seasonalWaterMm: [1100, 1500], durationDays: 130, avgYieldPerAcre: 1620, msp: 2300, costPerAcre: 32000 },
  { slug: "wheat", name: "Wheat", seedRatePerAcre: [40, 50], spacingCm: "22.5 rows", npkPerAcre: { N: 48, P: 24, K: 16 }, kcMid: 1.15, seasonalWaterMm: [450, 650], durationDays: 130, avgYieldPerAcre: 1420, msp: 2425, costPerAcre: 28000 },
  { slug: "maize", name: "Maize", seedRatePerAcre: [8, 10], spacingCm: "60×20", npkPerAcre: { N: 60, P: 24, K: 20 }, kcMid: 1.2, seasonalWaterMm: [500, 800], durationDays: 100, avgYieldPerAcre: 1200, msp: 2225, costPerAcre: 24000 },
  { slug: "cotton", name: "Cotton", seedRatePerAcre: [1.5, 2], spacingCm: "90×60", npkPerAcre: { N: 40, P: 20, K: 20 }, kcMid: 1.15, seasonalWaterMm: [700, 1300], durationDays: 180, avgYieldPerAcre: 180, msp: 7521, costPerAcre: 42000 },
  { slug: "groundnut", name: "Groundnut", seedRatePerAcre: [45, 50], spacingCm: "30×10", npkPerAcre: { N: 8, P: 16, K: 16 }, kcMid: 1.15, seasonalWaterMm: [500, 700], durationDays: 110, avgYieldPerAcre: 700, msp: 7263, costPerAcre: 26000 },
  { slug: "sugarcane", name: "Sugarcane", seedRatePerAcre: [1600, 2000], spacingCm: "90 rows", npkPerAcre: { N: 100, P: 32, K: 32 }, kcMid: 1.25, seasonalWaterMm: [1800, 2500], durationDays: 360, avgYieldPerAcre: 32000, msp: 340, costPerAcre: 60000 },
  { slug: "soybean", name: "Soybean", seedRatePerAcre: [30, 32], spacingCm: "45×5", npkPerAcre: { N: 12, P: 32, K: 16 }, kcMid: 1.15, seasonalWaterMm: [450, 700], durationDays: 100, avgYieldPerAcre: 480, msp: 5328, costPerAcre: 22000 },
  { slug: "red-gram", name: "Red Gram (Tur)", seedRatePerAcre: [6, 8], spacingCm: "60×20", npkPerAcre: { N: 10, P: 20, K: 10 }, kcMid: 1.1, seasonalWaterMm: [400, 550], durationDays: 160, avgYieldPerAcre: 320, msp: 7550, costPerAcre: 20000 },
  { slug: "bengal-gram", name: "Bengal Gram (Chana)", seedRatePerAcre: [30, 35], spacingCm: "30×10", npkPerAcre: { N: 8, P: 16, K: 8 }, kcMid: 1.0, seasonalWaterMm: [300, 400], durationDays: 105, avgYieldPerAcre: 450, msp: 5650, costPerAcre: 18000 },
  { slug: "chilli", name: "Chilli", seedRatePerAcre: [0.4, 0.5], spacingCm: "60×45", npkPerAcre: { N: 40, P: 20, K: 20 }, kcMid: 1.05, seasonalWaterMm: [600, 1000], durationDays: 160, avgYieldPerAcre: 800, msp: 0, costPerAcre: 55000 },
  { slug: "tomato", name: "Tomato", seedRatePerAcre: [0.15, 0.2], spacingCm: "60×45", npkPerAcre: { N: 50, P: 20, K: 20 }, kcMid: 1.15, seasonalWaterMm: [400, 800], durationDays: 120, avgYieldPerAcre: 8000, msp: 0, costPerAcre: 45000 },
  { slug: "onion", name: "Onion", seedRatePerAcre: [3, 4], spacingCm: "15×10", npkPerAcre: { N: 40, P: 20, K: 32 }, kcMid: 1.05, seasonalWaterMm: [350, 550], durationDays: 130, avgYieldPerAcre: 6000, msp: 0, costPerAcre: 40000 },
  { slug: "turmeric", name: "Turmeric", seedRatePerAcre: [800, 1000], spacingCm: "45×15", npkPerAcre: { N: 24, P: 24, K: 40 }, kcMid: 1.05, seasonalWaterMm: [1200, 1500], durationDays: 270, avgYieldPerAcre: 2400, msp: 0, costPerAcre: 65000 },
  { slug: "banana", name: "Banana", seedRatePerAcre: [1200, 1500], spacingCm: "180×180", npkPerAcre: { N: 80, P: 24, K: 120 }, kcMid: 1.1, seasonalWaterMm: [1800, 2200], durationDays: 365, avgYieldPerAcre: 14000, msp: 0, costPerAcre: 90000 },
  { slug: "mango", name: "Mango (bearing)", seedRatePerAcre: [40, 50], spacingCm: "10×10 m", npkPerAcre: { N: 40, P: 16, K: 40 }, kcMid: 0.85, seasonalWaterMm: [800, 1200], durationDays: 365, avgYieldPerAcre: 3000, msp: 0, costPerAcre: 35000 },
  { slug: "bajra", name: "Bajra (Pearl Millet)", seedRatePerAcre: [1.5, 2], spacingCm: "45×15", npkPerAcre: { N: 32, P: 16, K: 8 }, kcMid: 1.0, seasonalWaterMm: [350, 500], durationDays: 90, avgYieldPerAcre: 620, msp: 2625, costPerAcre: 14000 },
  { slug: "jowar", name: "Jowar (Sorghum)", seedRatePerAcre: [4, 5], spacingCm: "45×15", npkPerAcre: { N: 32, P: 16, K: 8 }, kcMid: 1.05, seasonalWaterMm: [400, 550], durationDays: 110, avgYieldPerAcre: 480, msp: 3371, costPerAcre: 15000 },
  { slug: "ragi", name: "Ragi (Finger Millet)", seedRatePerAcre: [4, 5], spacingCm: "30×10", npkPerAcre: { N: 20, P: 8, K: 8 }, kcMid: 1.0, seasonalWaterMm: [400, 550], durationDays: 120, avgYieldPerAcre: 700, msp: 4290, costPerAcre: 14000 },
];

export const REF_BY_SLUG: Record<string, CropCalcRef> = Object.fromEntries(
  CROP_REFS.map((c) => [c.slug, c]),
);

// Straight-fertilizer nutrient content (%) — Fertilizer Control Order (FCO) 1985
export const FERT_NUTRIENT = {
  urea: { N: 46, P: 0, K: 0, label: "Urea (46-0-0)" },
  dap: { N: 18, P: 46, K: 0, label: "DAP (18-46-0)" },
  mop: { N: 0, P: 0, K: 60, label: "MOP / Muriate of Potash (0-0-60)" },
  ssp: { N: 0, P: 16, K: 0, label: "SSP (0-16-0)" },
  "20-20-0-13": { N: 20, P: 20, K: 0, label: "20-20-0-13S" },
} as const;

// Solve straight-fertilizer bag plan for a given N/P/K demand (kg).
export function solveFertilizerPlan(demand: { N: number; P: number; K: number }) {
  // Priority order: DAP supplies P first, then Urea tops up remaining N, MOP supplies K.
  const dapKg = demand.P > 0 ? (demand.P * 100) / FERT_NUTRIENT.dap.P : 0;
  const nFromDap = (dapKg * FERT_NUTRIENT.dap.N) / 100;
  const remainN = Math.max(0, demand.N - nFromDap);
  const ureaKg = (remainN * 100) / FERT_NUTRIENT.urea.N;
  const mopKg = demand.K > 0 ? (demand.K * 100) / FERT_NUTRIENT.mop.K : 0;
  return {
    urea: Math.round(ureaKg),
    dap: Math.round(dapKg),
    mop: Math.round(mopKg),
  };
}

// Land conversion
export const AREA_TO_ACRE: Record<string, number> = {
  acre: 1,
  hectare: 2.4711,
  bigha: 0.4, // regional avg
  guntha: 0.025,
  cent: 0.01,
  sqm: 1 / 4046.86,
  sqft: 1 / 43560,
};

// ETc water calculation using FAO-56 Kc method.
// waterMm = Kc * ET0 * days
export function waterRequirement(kc: number, et0mm: number, days: number) {
  const mm = kc * et0mm * days;
  const litresPerAcre = mm * 4046.86; // 1 mm across 1 m² = 1 L → over 1 acre
  return { mm: Math.round(mm), litresPerAcre: Math.round(litresPerAcre) };
}

// Pesticide dilution — active ingredient basis.
// dose_g_per_litre * spray_L = product_g needed
export function pesticideDose(opts: {
  productConcPct: number; // % a.i. in product
  recAiGperAcre: number; // recommended a.i. g/acre
  sprayVolLperAcre: number; // total spray solution L/acre
}) {
  const productG = (opts.recAiGperAcre * 100) / opts.productConcPct;
  const dosePerL = productG / opts.sprayVolLperAcre;
  return {
    productPerAcreG: Math.round(productG),
    productPerLitreMlOrG: Math.round(dosePerL * 100) / 100,
  };
}
