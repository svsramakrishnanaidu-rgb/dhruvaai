// District-derived environmental & market context. Every module that shows
// "live" weather / soil / rainfall / market / schemes reads through this file
// so switching the district in the navbar instantly re-renders the entire app.

import { DISTRICTS } from "@/data/pdf-data";

export type DistrictProfile = {
  district: string;
  state: string;
  climate: string;
  soil: string;
  soilPh: string;
  tempC: number;
  humidity: number;
  windKmh: number;
  sky: string;
  rainfallYtdMm: number;
  rainfallDeltaPct: number; // vs long-term average
  season: string;
  sunrise: string;
  sunset: string;
  priceModifier: number; // +/- % applied to national mandi price
  seasonAlert: string;
  topDiseases: string[]; // most relevant scouting priorities
  schemes: string[]; // state-scoped schemes (name only)
  rotationHint: string;
};

// Base profiles for districts explicitly named in the PDF + AP/TS clusters
// used elsewhere in the app. Anything not listed falls back to `DEFAULT_PROFILE`.
const PROFILES: Record<string, DistrictProfile> = {
  Guntur: {
    district: "Guntur", state: "Andhra Pradesh",
    climate: "Tropical semi-arid", soil: "Black cotton (Vertisol)", soilPh: "7.2–8.1",
    tempC: 32, humidity: 68, windKmh: 14, sky: "Partly cloudy",
    rainfallYtdMm: 812, rainfallDeltaPct: +12, season: "Kharif · Wk 6",
    sunrise: "06:04", sunset: "18:22", priceModifier: +0.06,
    seasonAlert: "High humidity — scout chilli for anthracnose; delay urea top-dress 3 days.",
    topDiseases: ["Anthracnose (Chilli)", "Bacterial blight (Cotton)"],
    schemes: ["Rythu Bharosa", "PM-KISAN", "PMFBY", "KCC"],
    rotationHint: "Cotton → Bengal Gram → Green Manure",
  },
  "West Godavari": {
    district: "West Godavari", state: "Andhra Pradesh",
    climate: "Deltaic humid tropical", soil: "Alluvial delta clay", soilPh: "6.5–7.5",
    tempC: 30, humidity: 82, windKmh: 10, sky: "Overcast, drizzle",
    rainfallYtdMm: 1180, rainfallDeltaPct: +18, season: "Rabi transplant",
    sunrise: "06:06", sunset: "18:24", priceModifier: +0.02,
    seasonAlert: "Standing water in canals — monitor rice for BLB; hold potash split.",
    topDiseases: ["Bacterial Leaf Blight (Rice)", "Sheath blight (Rice)"],
    schemes: ["Rythu Bharosa", "PM-KISAN", "PMFBY"],
    rotationHint: "Rice → Black Gram → Sesame",
  },
  Anantapur: {
    district: "Anantapur", state: "Andhra Pradesh",
    climate: "Arid rainshadow", soil: "Red sandy loam", soilPh: "6.8–7.4",
    tempC: 35, humidity: 42, windKmh: 18, sky: "Clear, hazy",
    rainfallYtdMm: 380, rainfallDeltaPct: -22, season: "Kharif drought watch",
    sunrise: "06:12", sunset: "18:26", priceModifier: -0.03,
    seasonAlert: "Rainfall −22% — prioritize drip & mulching; groundnut pod rot risk high.",
    topDiseases: ["Pod rot (Groundnut)", "Leaf miner (Groundnut)"],
    schemes: ["Rythu Bharosa", "PMKSY (Drip)", "PM-KISAN"],
    rotationHint: "Groundnut → Sorghum → Horse Gram",
  },
  Krishna: {
    district: "Krishna", state: "Andhra Pradesh",
    climate: "Humid tropical delta", soil: "Alluvial", soilPh: "6.8–7.6",
    tempC: 31, humidity: 78, windKmh: 12, sky: "Cloudy",
    rainfallYtdMm: 980, rainfallDeltaPct: +8, season: "Kharif · Wk 8",
    sunrise: "06:07", sunset: "18:25", priceModifier: +0.04,
    seasonAlert: "Mango panicles susceptible to hopper — deploy neem spray.",
    topDiseases: ["Mango hopper", "Rice blast"],
    schemes: ["Rythu Bharosa", "PMFBY", "PM-KISAN"],
    rotationHint: "Rice → Maize → Green Manure",
  },
  Chittoor: {
    district: "Chittoor", state: "Andhra Pradesh",
    climate: "Sub-humid", soil: "Red loam", soilPh: "6.4–7.0",
    tempC: 29, humidity: 62, windKmh: 11, sky: "Partly cloudy",
    rainfallYtdMm: 720, rainfallDeltaPct: -4, season: "Rabi vegetable",
    sunrise: "06:10", sunset: "18:28", priceModifier: +0.01,
    seasonAlert: "Tomato leaf curl virus active — install yellow sticky traps.",
    topDiseases: ["Tomato leaf curl", "Mango powdery mildew"],
    schemes: ["Rythu Bharosa", "MIDH", "PM-KISAN"],
    rotationHint: "Tomato → Marigold → Fingermillet",
  },
  Sangrur: {
    district: "Sangrur", state: "Punjab",
    climate: "Semi-arid subtropical", soil: "Alluvial loam (Indo-Gangetic)", soilPh: "7.4–8.2",
    tempC: 26, humidity: 55, windKmh: 9, sky: "Clear",
    rainfallYtdMm: 640, rainfallDeltaPct: +2, season: "Rabi wheat · tillering",
    sunrise: "06:52", sunset: "17:38", priceModifier: +0.05,
    seasonAlert: "Cold snap likely Wk 3 — first irrigation critical for wheat tillering.",
    topDiseases: ["Yellow rust (Wheat)", "Karnal bunt (Wheat)"],
    schemes: ["PM-KISAN", "Punjab Fasal Bima", "KCC", "PKVY"],
    rotationHint: "Wheat → Green Manure → Basmati",
  },
  Ludhiana: {
    district: "Ludhiana", state: "Punjab",
    climate: "Semi-arid subtropical", soil: "Alluvial loam", soilPh: "7.3–8.0",
    tempC: 27, humidity: 60, windKmh: 10, sky: "Clear",
    rainfallYtdMm: 680, rainfallDeltaPct: +5, season: "Kharif paddy · panicle",
    sunrise: "06:50", sunset: "17:40", priceModifier: +0.04,
    seasonAlert: "PAU advisory: begin last irrigation window; avoid stubble burn.",
    topDiseases: ["Bacterial Leaf Blight", "Stem borer"],
    schemes: ["PM-KISAN", "Fasal Bima", "SMAM"],
    rotationHint: "Paddy → Wheat → Summer Moong",
  },
  Banthinda: {
    district: "Banthinda", state: "Punjab",
    climate: "Semi-arid", soil: "Sandy alluvial", soilPh: "8.0–8.5",
    tempC: 33, humidity: 45, windKmh: 15, sky: "Hazy",
    rainfallYtdMm: 380, rainfallDeltaPct: -8, season: "Kharif cotton · flowering",
    sunrise: "06:48", sunset: "17:42", priceModifier: 0.0,
    seasonAlert: "Whitefly build-up in cotton belt — install yellow sticky traps 20/acre.",
    topDiseases: ["Whitefly", "Pink bollworm"],
    schemes: ["PM-KISAN", "SMAM (Drone)", "KCC"],
    rotationHint: "Cotton → Wheat → Mustard",
  },
  "Lakhimpur Kheri": {
    district: "Lakhimpur Kheri", state: "Uttar Pradesh",
    climate: "Humid subtropical Terai", soil: "Alluvial loam, high OC", soilPh: "6.8–7.6",
    tempC: 29, humidity: 74, windKmh: 8, sky: "Cloudy",
    rainfallYtdMm: 1120, rainfallDeltaPct: +6, season: "Sugarcane · grand growth",
    sunrise: "06:20", sunset: "17:55", priceModifier: +0.03,
    seasonAlert: "Top-borer risk peaks now — release Trichogramma cards weekly.",
    topDiseases: ["Top borer (Sugarcane)", "Red rot (Sugarcane)"],
    schemes: ["PM-KISAN", "Ganna Vikas", "SMAM"],
    rotationHint: "Sugarcane (ratoon) → Green Manure → Wheat",
  },
  Kolhapur: {
    district: "Kolhapur", state: "Maharashtra",
    climate: "Sub-humid deccan", soil: "Deep black cotton", soilPh: "6.8–7.8",
    tempC: 27, humidity: 72, windKmh: 10, sky: "Overcast",
    rainfallYtdMm: 1420, rainfallDeltaPct: +14, season: "Sugarcane · maturation",
    sunrise: "06:26", sunset: "18:08", priceModifier: +0.06,
    seasonAlert: "Waterlogging risk — open field drains before next depression.",
    topDiseases: ["Red rot", "Smut"],
    schemes: ["PM-KISAN", "MahaDBT", "PMFBY"],
    rotationHint: "Sugarcane → Soybean → Wheat",
  },
  Rajkot: {
    district: "Rajkot", state: "Gujarat",
    climate: "Semi-arid Saurashtra", soil: "Medium black", soilPh: "7.2–8.0",
    tempC: 31, humidity: 58, windKmh: 13, sky: "Clear",
    rainfallYtdMm: 620, rainfallDeltaPct: -6, season: "Kharif groundnut · pegging",
    sunrise: "06:38", sunset: "18:15", priceModifier: +0.02,
    seasonAlert: "Extended dry spell — irrigate at pegging & pod-fill; expect aflatoxin scout.",
    topDiseases: ["Tikka leaf spot", "Aflatoxin (storage)"],
    schemes: ["PM-KISAN", "Mukhyamantri Kisan Sahay", "PMKSY"],
    rotationHint: "Groundnut → Wheat → Fallow",
  },
  Barmer: {
    district: "Barmer", state: "Rajasthan",
    climate: "Hot desert (Thar)", soil: "Aeolian sandy", soilPh: "7.8–8.6",
    tempC: 38, humidity: 30, windKmh: 22, sky: "Clear, dusty",
    rainfallYtdMm: 220, rainfallDeltaPct: -18, season: "Kharif bajra · earhead",
    sunrise: "06:44", sunset: "18:32", priceModifier: -0.04,
    seasonAlert: "Downy mildew risk in bajra — foliar Metalaxyl if RH >70%.",
    topDiseases: ["Downy mildew (Bajra)", "Ergot"],
    schemes: ["PM-KISAN", "Mukhyamantri Krishak Sathi", "PMFBY"],
    rotationHint: "Bajra → Mustard → Fallow",
  },
  Belagavi: {
    district: "Belagavi", state: "Karnataka",
    climate: "Transitional deccan", soil: "Deep black to red loam", soilPh: "6.8–7.6",
    tempC: 26, humidity: 70, windKmh: 9, sky: "Cloudy",
    rainfallYtdMm: 1240, rainfallDeltaPct: +9, season: "Sugarcane · elongation",
    sunrise: "06:28", sunset: "18:12", priceModifier: +0.03,
    seasonAlert: "Early shoot borer alert — light trap 1/ha.",
    topDiseases: ["Shoot borer", "Grassy shoot"],
    schemes: ["PM-KISAN", "Raitha Suraksha", "PMFBY"],
    rotationHint: "Sugarcane → Soybean → Wheat",
  },
  Rohtas: {
    district: "Rohtas", state: "Bihar",
    climate: "Humid subtropical", soil: "Alluvial", soilPh: "6.8–7.4",
    tempC: 30, humidity: 78, windKmh: 8, sky: "Cloudy",
    rainfallYtdMm: 980, rainfallDeltaPct: +4, season: "Kharif paddy · panicle",
    sunrise: "05:42", sunset: "17:34", priceModifier: +0.01,
    seasonAlert: "Sheath blight active — silica + Hexaconazole schedule.",
    topDiseases: ["Sheath blight", "Rice blast"],
    schemes: ["PM-KISAN", "Bihar Fasal Sahayata", "KCC"],
    rotationHint: "Paddy → Wheat → Moong",
  },
};

export const DEFAULT_PROFILE: DistrictProfile = {
  district: "—", state: "—",
  climate: "Sub-humid tropical", soil: "Mixed loam", soilPh: "6.5–7.5",
  tempC: 28, humidity: 66, windKmh: 12, sky: "Partly cloudy",
  rainfallYtdMm: 780, rainfallDeltaPct: +4, season: "Kharif · Wk 6",
  sunrise: "06:12", sunset: "18:34", priceModifier: 0,
  seasonAlert: "General advisory — align sowing with monsoon onset; monitor pest scouting weekly.",
  topDiseases: [],
  schemes: ["PM-KISAN", "PMFBY", "KCC"],
  rotationHint: "Cereal → Legume → Oilseed",
};

export function profileFor(district: string): DistrictProfile {
  const hit = PROFILES[district];
  if (hit) return hit;
  // Fallback: try PDF row for the district to populate at least state.
  const row = DISTRICTS.find((d) => d.district === district);
  return {
    ...DEFAULT_PROFILE,
    district,
    state: row?.state ?? DEFAULT_PROFILE.state,
  };
}
