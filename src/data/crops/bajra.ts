import type { Crop } from "./types";
import img from "@/assets/crop-bajra.jpg";

const bajra: Crop = {
  slug: "bajra",
  name: "Bajra (Pearl Millet)",
  scientificName: "Pennisetum glaucum",
  image: img,
  emoji: "🌾",
  category: "Millet",
  family: "Poaceae",
  description:
    "The most drought-hardy cereal in the Rayalaseema dry belt — matures in under 90 days on 350 mm rainfall, and delivers grain plus dry fodder.",
  durationDays: 85,
  localNames: { te: "Sajjalu", hi: "Bajra", ta: "Kambu", kn: "Sajje" },
  tags: ["millet", "drought-tolerant", "rainfed", "short-duration"],
  season: "Kharif (Jul–Oct)",
  suitableDistricts: [
    "Anantapur", "Kurnool", "Kadapa", "Sri Sathya Sai", "Nandyal",
    "Annamayya", "Prakasam",
  ],
  climate: "Hot semi-arid; tolerates 42°C and saline soils",
  temperature: "25–35°C",
  rainfall: "350–600 mm",
  soilType: "Light sandy loam to red soil; tolerates poor fertility",
  soilPh: "6.0 – 8.5",
  waterNeed: "Low",
  profitPct: 35,
  yield: "10–14 quintals/acre",
  trending: true,
  landPrep: [
    { title: "One Ploughing", description: "A single ploughing after pre-monsoon shower.", icon: "plough" },
    { title: "Harrowing", description: "One harrowing to create rough seedbed.", icon: "level" },
    { title: "FYM", description: "2 t/acre FYM broadcast before harrowing.", icon: "compost" },
    { title: "Flat Sowing", description: "Flat sowing in light soils; slight ridges on heavier soils.", icon: "bed" },
  ],
  seedRate: "1.5 kg/acre (hybrid); 2 kg/acre (variety)",
  seedTreatment: "Metalaxyl 3 g/kg (against downy mildew) + Azospirillum 20 g/kg",
  spacing: "45 × 15 cm",
  sowingMethod: "Seed drill 2–3 cm deep with onset of monsoon (late June–July)",
  irrigation: [
    "Rainfed in most tracts",
    "One protective irrigation at boot stage in prolonged dry spells",
    "Second irrigation at grain-fill in irrigated summer bajra",
  ],
  fertilizer: [
    { name: "Urea", perAcreKg: 25, stage: "50% basal + 50% at 25 DAS" },
    { name: "DAP", perAcreKg: 25, stage: "Basal" },
    { name: "MOP", perAcreKg: 8, stage: "Basal" },
    { name: "FYM", perAcreKg: 2000, stage: "Pre-sowing" },
  ],
  weeds: [
    "Cyperus rotundus, Digitaria, Cynodon dactylon",
    "Atrazine 400 g/acre pre-emergence",
    "One inter-cultivation at 20 DAS",
  ],
  diseases: [
    {
      name: "Downy Mildew (Green Ear)",
      symptoms: "Malformed leafy panicles; yellow streaks with downy growth underside.",
      cause: "Sclerospora graminicola; soil-borne oospores.",
      organic: "Rogue infected plants; crop rotation with legumes for 2 years.",
      chemical: "Seed treatment Metalaxyl 3 g/kg + foliar Metalaxyl 2 g/L.",
      severity: 4,
    },
    {
      name: "Ergot",
      symptoms: "Sticky honeydew from florets, later replaced by dark sclerotia.",
      cause: "Claviceps fusiformis; humid weather at flowering.",
      organic: "Deep summer ploughing to bury sclerotia; timely sowing.",
      chemical: "Mancozeb 2 g/L at 50% flowering.",
      severity: 3,
    },
  ],
  pests: [
    "Shoot fly — timely sowing + Imidacloprid 5 g/kg seed treatment",
    "Ear head caterpillar — Emamectin benzoate 80 g/acre at ear emergence",
    "Grasshopper — Carbaryl 5% dust 10 kg/acre",
  ],
  harvesting: "Harvest when ear heads turn brown and grains harden; cut, cure 4 days, then thresh.",
  storage: "Dry to 10% moisture; store with neem leaves; check monthly for storage insects.",
  marketPrice: {
    unit: "₹/quintal",
    price: 2620,
    msp: 2625,
    trend: [
      { day: "Mon", price: 2540 },
      { day: "Tue", price: 2560 },
      { day: "Wed", price: 2585 },
      { day: "Thu", price: 2600 },
      { day: "Fri", price: 2620 },
      { day: "Sat", price: 2640 },
      { day: "Sun", price: 2655 },
    ],
  },
  rotation: [
    { crop: "Bengal Gram", season: "Rabi", gapDays: 15, benefit: "Fixes N on residual moisture." },
    { crop: "Groundnut", season: "Kharif (next year)", gapDays: 30, benefit: "Cereal-legume rotation." },
    { crop: "Sunflower", season: "Rabi", gapDays: 20, benefit: "Diversifies soil-nutrient use." },
  ],
  tips: [
    "Choose ICMH varieties for downy-mildew resistance.",
    "Foliar spray 1% urea + 0.5% ZnSO4 at booting for grain plumpness.",
    "Ratoon crop possible in irrigated summer sowing.",
  ],
  precautions: [
    "Never sow before soil moisture is adequate — germination is patchy.",
    "Avoid excess nitrogen — encourages lodging in windy areas.",
  ],
  references: [
    { label: "AICRP on Pearl Millet — ICAR", url: "https://millets.res.in/" },
    { label: "YouTube: Bajra Cultivation Guide", url: "https://www.youtube.com/results?search_query=bajra+pearl+millet+cultivation" },
  ],
};

export default bajra;
