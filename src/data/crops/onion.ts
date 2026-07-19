import type { Crop } from "./types";
import img from "@/assets/crop-onion.jpg";

const onion: Crop = {
  slug: "onion",
  name: "Onion",
  scientificName: "Allium cepa",
  image: img,
  emoji: "🧅",
  category: "Vegetable",
  family: "Amaryllidaceae",
  description:
    "AP's premier rabi vegetable — Kurnool and Nandyal alone contribute a large share of India's onion supply. High-value, storage-friendly, export-grade with proper cure.",
  durationDays: 140,
  localNames: { te: "Ullipaya", hi: "Pyaz", ta: "Vengayam", kn: "Nirulli" },
  tags: ["cash", "vegetable", "export", "irrigated"],
  season: "Rabi (Oct–Mar) / Kharif (Jun–Nov)",
  suitableDistricts: [
    "Kurnool", "Nandyal", "Anantapur", "Kadapa", "Prakasam", "Guntur",
    "Sri Sathya Sai", "Palnadu", "Annamayya",
  ],
  climate: "Cool at bulb formation, warm dry at maturity — long day sensitive",
  temperature: "15–30°C",
  rainfall: "650–750 mm",
  soilType: "Well-drained sandy loam / medium black; avoid heavy clay",
  soilPh: "6.0 – 7.5",
  waterNeed: "Medium",
  profitPct: 62,
  yield: "80–120 quintals/acre",
  trending: true,
  landPrep: [
    { title: "Deep Ploughing", description: "One deep ploughing followed by 3 harrowings for fine tilth.", icon: "plough" },
    { title: "FYM", description: "10 t/acre FYM broadcast 20 days pre-transplant.", icon: "compost" },
    { title: "Raised Beds", description: "Beds 1.2 m wide × 15 cm high, spaced 30 cm.", icon: "bed" },
    { title: "Drip Layout", description: "Inline drip laterals every 30 cm on beds.", icon: "level" },
  ],
  seedRate: "3–4 kg/acre (nursery-raised); 4–5 kg/acre direct-seeded",
  seedTreatment: "Thiram 3 g + Carbendazim 1 g per kg seed",
  spacing: "15 × 10 cm (rows × plants)",
  sowingMethod: "Raise nursery 45–50 days; transplant robust seedlings on beds",
  irrigation: [
    "Irrigate every 7 days in cool weather, 4–5 days in hot",
    "Withhold water 15 days before harvest to induce curing",
    "Drip fertigation gives 30% water saving and cleaner bulbs",
  ],
  fertilizer: [
    { name: "Urea", perAcreKg: 50, stage: "1/3 basal + 2/3 in 3 splits (30/45/60 DAT)" },
    { name: "DAP", perAcreKg: 50, stage: "Basal" },
    { name: "MOP", perAcreKg: 30, stage: "1/2 basal + 1/2 at bulb-swelling" },
    { name: "Sulphur", perAcreKg: 20, stage: "Basal — critical for pungency & keeping quality" },
    { name: "Zinc Sulphate", perAcreKg: 10, stage: "Basal" },
    { name: "FYM", perAcreKg: 10000, stage: "20 days pre-transplant" },
  ],
  weeds: [
    "Cyperus rotundus, Chenopodium, Portulaca",
    "Oxyfluorfen 200 ml/acre pre-emergence 3 days after transplant",
    "Two hand-weedings at 25 and 50 DAT",
  ],
  diseases: [
    {
      name: "Purple Blotch",
      symptoms: "Small water-soaked spots enlarging to purple concentric lesions.",
      cause: "Alternaria porri; warm humid weather with dew.",
      organic: "Bordeaux mixture 1% spray at first symptom.",
      chemical: "Mancozeb 2 g/L or Tebuconazole 1 ml/L.",
      severity: 4,
    },
    {
      name: "Basal Rot",
      symptoms: "Yellowing of leaves and pinkish rot of basal plate.",
      cause: "Fusarium oxysporum f.sp. cepae; soil-borne.",
      organic: "Trichoderma-fortified FYM + 3-year crop rotation.",
      chemical: "Carbendazim drench 2 g/L at neck of the plant.",
      severity: 3,
    },
  ],
  pests: [
    "Thrips — Fipronil 5 SC 60 ml/acre + sticker; alternate with Spinosad 60 ml/acre",
    "Onion maggot — Chlorpyriphos 20 EC 1 L/acre soil drench",
  ],
  harvesting: "Harvest when 50–70% tops fall over; lift bulbs and windrow-cure 5 days.",
  storage: "Cure bulbs to 12% neck moisture; store in ventilated bamboo/wire cages up to 4 months.",
  marketPrice: {
    unit: "₹/quintal",
    price: 2280,
    msp: 0,
    trend: [
      { day: "Mon", price: 2100 },
      { day: "Tue", price: 2160 },
      { day: "Wed", price: 2200 },
      { day: "Thu", price: 2240 },
      { day: "Fri", price: 2280 },
      { day: "Sat", price: 2320 },
      { day: "Sun", price: 2350 },
    ],
  },
  rotation: [
    { crop: "Red Gram", season: "Kharif (next year)", gapDays: 30, benefit: "Legume rebuilds N; breaks thrips cycle." },
    { crop: "Maize", season: "Kharif", gapDays: 25, benefit: "Non-Allium crop breaks basal-rot cycle." },
    { crop: "Bengal Gram", season: "Rabi (next year)", gapDays: 30, benefit: "Alternate rabi legume." },
  ],
  tips: [
    "Choose rose-onion varieties (Krishnapuram) for the export market.",
    "Foliar spray 0.5% ZnSO4 + 0.2% Boron at bulb initiation.",
    "Grade & pack in ventilated 25 kg jute bags for premium price.",
  ],
  precautions: [
    "Never irrigate at maturity — bulbs will split and rot.",
    "Do not use fresh FYM — increases weed & disease pressure.",
  ],
  references: [
    { label: "ICAR — Directorate of Onion & Garlic Research", url: "https://dogr.icar.gov.in/" },
    { label: "YouTube: Kurnool Onion Cultivation", url: "https://www.youtube.com/results?search_query=onion+cultivation+kurnool" },
  ],
};

export default onion;
