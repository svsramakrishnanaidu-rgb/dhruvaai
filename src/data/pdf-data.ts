// Encoded from the "Comprehensive Handbook of Crop Production across Major
// Indian Districts" PDF (3rd Advance Estimates 2025-26). Every figure here is
// lifted verbatim from the source document — never inferred.

export type MacroCategory = {
  category: string;
  season: string;
  areaLakhHa: number;
  outputLakhTonnes: number;
  zones: string;
};

export type DistrictRow = {
  state: string;
  district: string;
  crop: string;
  season: string;
  areaHa: number;
  productionMT: number;
  yieldKgHa: number;
};

/** §1 — Executive Summary */
export const EXECUTIVE = {
  scope: "3rd Advance Estimates (2025-26) & Consolidated Ministry Databases.",
  indexing:
    "Covers major production clusters across Rice, Wheat, Pulses, Oilseeds, and Commercial crops.",
  foodGrainProductionMT: 255.13, // × 10^6 MT (aka Lakh Tonnes in official reporting)
  formula: "Y = P / A",
  formulaLegend: [
    { symbol: "Y", meaning: "Agricultural yield (kg/ha)" },
    { symbol: "P", meaning: "Total crop production (Metric Tonnes)" },
    { symbol: "A", meaning: "Net cultivated area (Hectares)" },
  ],
};

/** §2 — Macro Crop Categories & National Volume Distribution */
export const MACRO: MacroCategory[] = [
  {
    category: "Rice (Paddy)",
    season: "Kharif / Summer",
    areaLakhHa: 446.7,
    outputLakhTonnes: 1540.24,
    zones: "Indo-Gangetic Plain, Krishna-Godavari Delta",
  },
  {
    category: "Wheat",
    season: "Rabi",
    areaLakhHa: 336.0,
    outputLakhTonnes: 1206.57,
    zones: "North-Western Plains, Central Black Soil",
  },
  {
    category: "Coarse Cereals (Maize/Nutri-Cereals)",
    season: "Kharif / Rabi",
    areaLakhHa: 144.08,
    outputLakhTonnes: 550.93,
    zones: "Semi-Arid Deccan, Western Drylands",
  },
  {
    category: "Pulses (Gram/Lentils)",
    season: "Rabi / Kharif",
    areaLakhHa: 28.17,
    outputLakhTonnes: 125.14,
    zones: "Central Plateau, Rainfed Vertisols",
  },
  {
    category: "Oilseeds (Mustard/Soybean)",
    season: "Rabi / Kharif",
    areaLakhHa: 41.15,
    outputLakhTonnes: 394.38,
    zones: "Malwa Plateau, Semiarid Rajasthan",
  },
  {
    category: "Total Food Grains Group",
    season: "Consolidated",
    areaLakhHa: 996.1,
    outputLakhTonnes: 3817.26,
    zones: "National Total Aggregation",
  },
];

/** §3 — District-Wise & State Crop Production Matrix */
export const DISTRICTS: DistrictRow[] = [
  { state: "Punjab", district: "Sangrur", crop: "Wheat", season: "Rabi", areaHa: 290000, productionMT: 1510000, yieldKgHa: 5207 },
  { state: "Punjab", district: "Ludhiana", crop: "Rice (Paddy)", season: "Kharif", areaHa: 255000, productionMT: 1180000, yieldKgHa: 4627 },
  { state: "Punjab", district: "Banthinda", crop: "Cotton", season: "Kharif", areaHa: 95000, productionMT: 68000, yieldKgHa: 715 },
  { state: "Uttar Pradesh", district: "Lakhimpur Kheri", crop: "Sugarcane", season: "Annual", areaHa: 220000, productionMT: 15400000, yieldKgHa: 70000 },
  { state: "Uttar Pradesh", district: "Gorakhpur", crop: "Rice", season: "Kharif", areaHa: 165000, productionMT: 430000, yieldKgHa: 2606 },
  { state: "Uttar Pradesh", district: "Agra", crop: "Mustard", season: "Rabi", areaHa: 110000, productionMT: 198000, yieldKgHa: 1800 },
  { state: "Madhya Pradesh", district: "Hoshangabad", crop: "Wheat", season: "Rabi", areaHa: 310000, productionMT: 1480000, yieldKgHa: 4774 },
  { state: "Madhya Pradesh", district: "Ujjain", crop: "Soybean", season: "Kharif", areaHa: 420000, productionMT: 510000, yieldKgHa: 1214 },
  { state: "Madhya Pradesh", district: "Vidisha", crop: "Gram (Chickpea)", season: "Rabi", areaHa: 210000, productionMT: 265000, yieldKgHa: 1262 },
  { state: "Andhra Pradesh", district: "West Godavari", crop: "Rice", season: "Kharif/Rabi", areaHa: 240000, productionMT: 1120000, yieldKgHa: 4666 },
  { state: "Andhra Pradesh", district: "Guntur", crop: "Chilli & Cotton", season: "Kharif", areaHa: 180000, productionMT: 210000, yieldKgHa: 1166 },
  { state: "Andhra Pradesh", district: "Anantapur", crop: "Groundnut", season: "Kharif", areaHa: 350000, productionMT: 185000, yieldKgHa: 528 },
  { state: "West Bengal", district: "Bardhaman", crop: "Rice (Aman)", season: "Kharif", areaHa: 320000, productionMT: 1080000, yieldKgHa: 3375 },
  { state: "West Bengal", district: "Nadia", crop: "Jute", season: "Kharif", areaHa: 92000, productionMT: 245000, yieldKgHa: 2663 },
  { state: "Maharashtra", district: "Kolhapur", crop: "Sugarcane", season: "Annual", areaHa: 145000, productionMT: 11800000, yieldKgHa: 81379 },
  { state: "Maharashtra", district: "Amravati", crop: "Cotton", season: "Kharif", areaHa: 280000, productionMT: 165000, yieldKgHa: 589 },
  { state: "Maharashtra", district: "Latur", crop: "Soybean", season: "Kharif", areaHa: 295000, productionMT: 340000, yieldKgHa: 1152 },
  { state: "Gujarat", district: "Rajkot", crop: "Groundnut", season: "Kharif", areaHa: 260000, productionMT: 480000, yieldKgHa: 1846 },
  { state: "Gujarat", district: "Anand", crop: "Tobacco / Paddy", season: "Semi-Annual", areaHa: 85000, productionMT: 195000, yieldKgHa: 2294 },
  { state: "Rajasthan", district: "Sri Ganganagar", crop: "Wheat & Mustard", season: "Rabi", areaHa: 275000, productionMT: 690000, yieldKgHa: 2509 },
  { state: "Rajasthan", district: "Barmer", crop: "Bajra (Pearl Millet)", season: "Kharif", areaHa: 480000, productionMT: 240000, yieldKgHa: 500 },
  { state: "Karnataka", district: "Havery", crop: "Maize", season: "Kharif", areaHa: 185000, productionMT: 560000, yieldKgHa: 3027 },
  { state: "Karnataka", district: "Belagavi", crop: "Sugarcane", season: "Annual", areaHa: 210000, productionMT: 16200000, yieldKgHa: 77142 },
  { state: "Bihar", district: "Rohtas", crop: "Rice (Paddy)", season: "Kharif", areaHa: 195000, productionMT: 640000, yieldKgHa: 3282 },
];

/** §4 — Spatial Structural Challenges & Yield Optimization (verbatim) */
export const CHALLENGES = {
  gap: "Productivity gap between primary irrigated command regions (e.g., Sangrur, West Godavari) and rainfed vulnerable drylands (e.g., Anantapur, Barmer) remains prominent.",
  interventions: [
    "Micro-distribution of precision inputs",
    "Expansion of solarized micro-irrigation systems",
    "Real-time mandi price integration via UPAg",
    "Localized district risk mitigation against macroclimate variations",
  ],
};

/** §5 — References */
export const REFERENCES = [
  { name: "Ministry of Agriculture & Farmers Welfare, Government of India", tag: "DA&FW Dashboards" },
  { name: "Unified Portal for Agricultural Statistics (UPAg)", tag: "Data Systems, 2025-26" },
  { name: "National Data and Analytics Platform (NDAP)", tag: "NITI Aayog" },
  { name: "ICRISAT District Level Database", tag: "DLD Initiative Metrics" },
];

// ---------- Derived KPIs ----------
export const KPIS = {
  states: new Set(DISTRICTS.map((d) => d.state)).size,
  districts: DISTRICTS.length,
  crops: new Set(DISTRICTS.map((d) => d.crop)).size,
  totalProductionMT: DISTRICTS.reduce((a, d) => a + d.productionMT, 0),
  totalAreaHa: DISTRICTS.reduce((a, d) => a + d.areaHa, 0),
  avgYield: Math.round(
    DISTRICTS.reduce((a, d) => a + d.yieldKgHa, 0) / DISTRICTS.length,
  ),
  highest: DISTRICTS.reduce((a, d) => (d.yieldKgHa > a.yieldKgHa ? d : a), DISTRICTS[0]),
  lowest: DISTRICTS.reduce((a, d) => (d.yieldKgHa < a.yieldKgHa ? d : a), DISTRICTS[0]),
  topProducer: DISTRICTS.reduce((a, d) => (d.productionMT > a.productionMT ? d : a), DISTRICTS[0]),
};
