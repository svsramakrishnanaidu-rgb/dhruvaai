import type { Crop } from "./types";
import img from "@/assets/crop-jowar.jpg";

const jowar: Crop = {
  slug: "jowar",
  name: "Jowar (Sorghum)",
  scientificName: "Sorghum bicolor",
  image: img,
  emoji: "🌾",
  category: "Millet",
  family: "Poaceae",
  description:
    "Millet cereal grown across Rayalaseema and Palnadu — thrives on rainfed black soils, drought-tolerant, and central to India's Millets 2023 revival.",
  durationDays: 115,
  localNames: { te: "Jonna", hi: "Jowar", ta: "Cholam", kn: "Jola" },
  tags: ["millet", "drought-tolerant", "rainfed", "fodder"],
  season: "Kharif (Jun–Oct) / Rabi (Oct–Feb)",
  suitableDistricts: [
    "Anantapur", "Kurnool", "Kadapa", "Nandyal", "Prakasam", "Palnadu",
    "Sri Sathya Sai", "Guntur", "Mahbubnagar",
  ],
  climate: "Semi-arid; tolerates 40°C heat and short droughts",
  temperature: "26–32°C",
  rainfall: "400–800 mm",
  soilType: "Medium to deep black cotton soil",
  soilPh: "5.5 – 8.5",
  waterNeed: "Low",
  profitPct: 38,
  yield: "12–16 quintals/acre",
  trending: true,
  landPrep: [
    { title: "Summer Ploughing", description: "Deep ploughing in April conserves monsoon moisture.", icon: "plough" },
    { title: "Two Harrowings", description: "Break clods; kill germinating weed seeds.", icon: "level" },
    { title: "FYM", description: "3 t/acre FYM before final harrowing.", icon: "compost" },
    { title: "Ridge Making", description: "45 cm ridges for kharif; flat sowing for rabi.", icon: "bed" },
  ],
  seedRate: "4 kg/acre (hybrid); 3 kg/acre (variety)",
  seedTreatment: "Thiram 3 g + Azospirillum 20 g per kg seed",
  spacing: "45 × 15 cm",
  sowingMethod: "Seed drill or behind plough, 3–4 cm deep, with onset of monsoon",
  irrigation: [
    "Predominantly rainfed",
    "One critical irrigation at boot stage if dry spell exceeds 20 days",
    "Second irrigation at grain-fill maximises yield 30%",
  ],
  fertilizer: [
    { name: "Urea", perAcreKg: 35, stage: "50% basal + 50% at knee-high" },
    { name: "DAP", perAcreKg: 35, stage: "Basal" },
    { name: "MOP", perAcreKg: 12, stage: "Basal" },
    { name: "Zinc Sulphate", perAcreKg: 10, stage: "Basal (zinc-deficient soils)" },
    { name: "FYM", perAcreKg: 3000, stage: "Pre-sowing" },
  ],
  weeds: [
    "Digitaria sanguinalis, Cyperus rotundus, Parthenium",
    "Atrazine 500 g/acre pre-emergence within 2 days",
    "Inter-cultivation at 20 and 40 DAS",
  ],
  diseases: [
    {
      name: "Grain Mould",
      symptoms: "Black/pink fungal growth on developing grains during rainy weather at maturity.",
      cause: "Fusarium, Curvularia complex; humid conditions at flowering.",
      organic: "Timely harvest + panicle bagging for seed crop.",
      chemical: "Propiconazole 1 ml/L at 50% flowering.",
      severity: 3,
    },
    {
      name: "Charcoal Rot",
      symptoms: "Stalk lodging near maturity; shredded pith with black sclerotia.",
      cause: "Macrophomina phaseolina; drought stress at grain-fill triggers.",
      organic: "Balanced potash + supplemental irrigation at grain-fill.",
      chemical: "Carbendazim seed treatment 2 g/kg.",
      severity: 4,
    },
  ],
  pests: [
    "Shoot fly — seed treatment with Imidacloprid 5 g/kg + timely sowing",
    "Stem borer — release Trichogramma 40,000/acre at 20 DAS",
    "Ear head bug — Malathion 5% dust 8 kg/acre at flowering",
  ],
  harvesting: "Harvest ear heads when grains are hard and moisture is ~20%; sun-dry for 4 days.",
  storage: "Dry to 12% moisture; store in gunny bags on wooden pallets; check for weevils monthly.",
  marketPrice: {
    unit: "₹/quintal",
    price: 3210,
    msp: 3180,
    trend: [
      { day: "Mon", price: 3120 },
      { day: "Tue", price: 3150 },
      { day: "Wed", price: 3170 },
      { day: "Thu", price: 3190 },
      { day: "Fri", price: 3210 },
      { day: "Sat", price: 3230 },
      { day: "Sun", price: 3245 },
    ],
  },
  rotation: [
    { crop: "Red Gram", season: "Kharif (next year)", gapDays: 30, benefit: "Cereal-legume rotation restores N." },
    { crop: "Bengal Gram", season: "Rabi", gapDays: 15, benefit: "Utilises residual moisture, fixes N." },
    { crop: "Sunflower", season: "Rabi", gapDays: 20, benefit: "Different rooting depth balances soil." },
  ],
  tips: [
    "Adopt dual-purpose varieties (CSV-15, CSH-16) for grain + fodder.",
    "Foliar spray 2% urea at boot stage to boost grain weight.",
    "Bird-scaring is critical 10 days before harvest.",
  ],
  precautions: [
    "Do not sow if soil temperature exceeds 40°C — poor germination.",
    "Avoid late sowing in kharif — shoot-fly damage soars.",
  ],
  references: [
    { label: "ICAR — Indian Institute of Millets Research", url: "https://millets.res.in/" },
    { label: "YouTube: Sorghum Cultivation Package", url: "https://www.youtube.com/results?search_query=sorghum+cultivation+india" },
  ],
};

export default jowar;
