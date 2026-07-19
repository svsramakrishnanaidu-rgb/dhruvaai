import type { Crop } from "./types";
import img from "@/assets/crop-ragi.jpg";

const ragi: Crop = {
  slug: "ragi",
  name: "Ragi (Finger Millet)",
  scientificName: "Eleusine coracana",
  image: img,
  emoji: "🌾",
  category: "Millet",
  family: "Poaceae",
  description:
    "Nutri-cereal packed with calcium and iron — grown across the hilly Alluri, Vizianagaram and Parvathipuram tracts and the Chittoor plateau. Short duration, drought-hardy, and premium priced.",
  durationDays: 120,
  localNames: { te: "Ragulu / Chodi", hi: "Mandua", ta: "Kelvaragu", kn: "Ragi" },
  tags: ["millet", "nutri-cereal", "rainfed", "hilly"],
  season: "Kharif (Jun–Oct)",
  suitableDistricts: [
    "Alluri Sitharama Raju", "Vizianagaram", "Parvathipuram Manyam",
    "Srikakulam", "Chittoor", "Anakapalli", "Annamayya", "Anantapur",
  ],
  climate: "Cool tropical; grows well up to 2000 m altitude",
  temperature: "20–30°C",
  rainfall: "500–900 mm",
  soilType: "Red loamy or hilly upland soil; well-drained",
  soilPh: "5.0 – 8.2",
  waterNeed: "Low",
  profitPct: 46,
  yield: "8–12 quintals/acre",
  trending: true,
  landPrep: [
    { title: "Field Cleaning", description: "Clear weeds and stubble; solar exposure kills pests.", icon: "broom" },
    { title: "Two Ploughings", description: "Two cross-ploughings 3 weeks before sowing.", icon: "plough" },
    { title: "FYM", description: "3 t/acre FYM at final harrowing.", icon: "compost" },
    { title: "Nursery Beds", description: "Raised beds 1 m wide for transplant seedlings.", icon: "bed" },
  ],
  seedRate: "3 kg/acre (transplanted); 5 kg/acre (broadcast)",
  seedTreatment: "Carbendazim 2 g/kg + Azospirillum 20 g/kg",
  spacing: "22 × 10 cm (transplanted)",
  sowingMethod: "Raise nursery; transplant 25-day seedlings in main field",
  irrigation: [
    "Rainfed; provide 1–2 protective irrigations at panicle initiation and grain-fill if dry",
    "Drain excess water within 24 hours — ragi cannot tolerate ponding",
  ],
  fertilizer: [
    { name: "Urea", perAcreKg: 20, stage: "Basal + top-dress at 25 DAT" },
    { name: "DAP", perAcreKg: 20, stage: "Basal" },
    { name: "MOP", perAcreKg: 8, stage: "Basal" },
    { name: "FYM", perAcreKg: 3000, stage: "Pre-sowing" },
  ],
  weeds: [
    "Cyperus, Echinochloa, Digitaria",
    "2,4-D 400 ml/acre at 20 DAT",
    "Two hand-weedings at 20 and 40 DAT",
  ],
  diseases: [
    {
      name: "Blast",
      symptoms: "Diamond-shaped lesions on leaves and neck rot on panicles.",
      cause: "Pyricularia grisea; humid, misty weather.",
      organic: "Neem oil 5 ml/L + Panchagavya 3% at panicle initiation.",
      chemical: "Tricyclazole 75 WP 0.6 g/L.",
      severity: 4,
    },
    {
      name: "Foot Rot",
      symptoms: "Rotting of stem base with mycelial white growth; lodging.",
      cause: "Sclerotium rolfsii; poor drainage.",
      organic: "Trichoderma harzianum enriched FYM 200 kg/acre.",
      chemical: "Carbendazim drench 2 g/L around base.",
      severity: 2,
    },
  ],
  pests: [
    "Pink stem borer — Fenvalerate 0.4% dust 8 kg/acre",
    "Ear head caterpillar — Emamectin benzoate 80 g/acre at ear emergence",
  ],
  harvesting: "Harvest ear heads when they turn brown; store heads separately from straw.",
  storage: "Grain moisture 12%; store in mud/earthen bins with neem leaves — traditional storage keeps 3 years.",
  marketPrice: {
    unit: "₹/quintal",
    price: 4340,
    msp: 4290,
    trend: [
      { day: "Mon", price: 4210 },
      { day: "Tue", price: 4250 },
      { day: "Wed", price: 4280 },
      { day: "Thu", price: 4310 },
      { day: "Fri", price: 4340 },
      { day: "Sat", price: 4370 },
      { day: "Sun", price: 4390 },
    ],
  },
  rotation: [
    { crop: "Red Gram", season: "Kharif (intercrop)", gapDays: 0, benefit: "Classic ragi + tur mixed cropping." },
    { crop: "Bengal Gram", season: "Rabi", gapDays: 15, benefit: "Uses residual moisture, fixes N." },
    { crop: "Groundnut", season: "Kharif (alternate year)", gapDays: 30, benefit: "Cereal-legume rotation." },
  ],
  tips: [
    "Transplanting yields 30% more than broadcasting.",
    "Foliar spray of 1% panchagavya boosts grain calcium.",
    "Adopt indigenous varieties for organic-premium markets.",
  ],
  precautions: [
    "Avoid waterlogged fields — root rot spreads rapidly.",
    "Do not delay transplanting beyond 30-day-old seedlings.",
  ],
  references: [
    { label: "AICRP on Small Millets — ICAR", url: "https://millets.res.in/" },
    { label: "YouTube: Ragi Cultivation Package", url: "https://www.youtube.com/results?search_query=ragi+finger+millet+cultivation" },
  ],
};

export default ragi;
