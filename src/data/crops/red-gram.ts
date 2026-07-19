import type { Crop } from "./types";
import img from "@/assets/crop-red-gram.jpg";

const redGram: Crop = {
  slug: "red-gram",
  name: "Red Gram (Tur / Arhar)",
  scientificName: "Cajanus cajan",
  image: img,
  emoji: "🫘",
  category: "Pulse",
  family: "Fabaceae",
  description:
    "Kharif pigeon pea — Andhra Pradesh's flagship pulse, especially across Rayalaseema and Palnadu. Deep tap root makes it a natural drought-hedge and soil-nitrogen builder.",
  durationDays: 165,
  localNames: { te: "Kandulu", hi: "Arhar / Tur", ta: "Thuvarai", kn: "Togari" },
  tags: ["drought-tolerant", "nitrogen-fixer", "rainfed"],
  season: "Kharif (Jun–Feb)",
  suitableDistricts: [
    "Anantapur", "Kurnool", "Kadapa", "Prakasam", "Guntur", "Palnadu",
    "Nandyal", "Sri Sathya Sai", "Annamayya", "Mahbubnagar",
  ],
  climate: "Warm semi-arid; needs clear dry weather at pod fill",
  temperature: "20–35°C",
  rainfall: "600–900 mm",
  soilType: "Well-drained loam / medium black; avoid waterlogging",
  soilPh: "6.5 – 7.5",
  waterNeed: "Low",
  profitPct: 48,
  yield: "6–8 quintals/acre",
  trending: true,
  landPrep: [
    { title: "Summer Ploughing", description: "One deep ploughing in April–May exposes larvae of pod-borer.", icon: "plough" },
    { title: "Harrowing", description: "Two harrowings to break clods and level the field.", icon: "level" },
    { title: "FYM Application", description: "Apply 4 t/acre well-rotted FYM 15 days before sowing.", icon: "compost" },
    { title: "Ridge & Furrow", description: "Form ridges 150 cm apart for medium-duration varieties.", icon: "bed" },
  ],
  seedRate: "5–6 kg/acre (sole crop); 2 kg/acre in intercrop",
  seedTreatment: "Rhizobium + PSB culture 20 g/kg seed + Trichoderma 4 g/kg",
  spacing: "150 × 20 cm (sole); paired-row with jowar/bajra recommended",
  sowingMethod: "Dibbling behind plough after first monsoon shower, 3–4 cm deep",
  irrigation: [
    "Rainfed in most districts; 1 protective irrigation at flowering if dry spell exceeds 15 days",
    "Second protective irrigation at pod-fill stage boosts yield 25%",
    "Drain excess rainwater within 24 hours — waterlogging kills the crop",
  ],
  fertilizer: [
    { name: "Urea", perAcreKg: 12, stage: "Basal" },
    { name: "DAP", perAcreKg: 40, stage: "Basal" },
    { name: "MOP (Potash)", perAcreKg: 15, stage: "Basal" },
    { name: "Sulphur (Gypsum)", perAcreKg: 80, stage: "Basal — critical for oil-content" },
    { name: "FYM", perAcreKg: 4000, stage: "15 days pre-sowing" },
    { name: "Rhizobium biofertilizer", perAcreKg: 1, stage: "Seed inoculation" },
  ],
  weeds: [
    "Cyperus rotundus, Digera arvensis, Parthenium",
    "Pendimethalin 1.3 L/acre pre-emergence within 3 days of sowing",
    "One hand-weeding at 30 DAS + inter-cultivation at 45 DAS",
  ],
  diseases: [
    {
      name: "Fusarium Wilt",
      symptoms: "Sudden wilting, browning of vascular bundle when stem is split.",
      cause: "Fusarium udum soil-borne fungus; worse in continuous cropping.",
      organic: "Seed treatment with Trichoderma viride 4 g/kg + neem cake 100 kg/acre.",
      chemical: "Carbendazim 2 g/kg seed treatment.",
      severity: 4,
    },
    {
      name: "Sterility Mosaic",
      symptoms: "Bushy stunted plants with pale mosaic leaves and no flowers.",
      cause: "Pigeon pea sterility mosaic virus spread by eriophyid mite.",
      organic: "Rogue and destroy infected plants; spray neem oil 5 ml/L.",
      chemical: "Fenazaquin 2 ml/L against the mite vector.",
      severity: 3,
    },
  ],
  pests: [
    "Pod borer (Helicoverpa armigera) — pheromone trap 4/acre + Emamectin benzoate 80 g/acre",
    "Pod fly — Spinosad 45 SC 60 ml/acre at 50% flowering",
    "Plume moth — Neem seed kernel extract 5% at bud stage",
  ],
  harvesting: "Harvest when 75% pods turn brown; thresh after 4–5 days of sun-drying.",
  storage: "Grain moisture 9–10%; store with neem leaves or 3 g Deltamethrin dust per quintal.",
  marketPrice: {
    unit: "₹/quintal",
    price: 7250,
    msp: 7000,
    trend: [
      { day: "Mon", price: 7100 },
      { day: "Tue", price: 7180 },
      { day: "Wed", price: 7220 },
      { day: "Thu", price: 7200 },
      { day: "Fri", price: 7250 },
      { day: "Sat", price: 7280 },
      { day: "Sun", price: 7310 },
    ],
  },
  rotation: [
    { crop: "Bajra", season: "Kharif (next year)", gapDays: 30, benefit: "Cereal-legume rotation breaks wilt cycle." },
    { crop: "Sunflower", season: "Rabi", gapDays: 20, benefit: "Uses residual nitrogen efficiently." },
    { crop: "Groundnut", season: "Kharif (next year)", gapDays: 30, benefit: "Both legumes — never in same year." },
  ],
  tips: [
    "Nip terminal buds at 45 DAS to encourage lateral branching and 20% more pods.",
    "Intercrop with jowar in 2:1 ratio for insurance income.",
    "Adopt short-duration varieties (ICPL-87119) if monsoon is late.",
  ],
  precautions: [
    "Never grow pigeon pea after pigeon pea — wilt inoculum builds up.",
    "Avoid heavy nitrogen — encourages vegetative growth over pods.",
  ],
  references: [
    { label: "ICAR — Indian Institute of Pulses Research", url: "https://iipr.icar.gov.in/" },
    { label: "YouTube: Red Gram Cultivation (Telugu)", url: "https://www.youtube.com/results?search_query=red+gram+cultivation+telugu" },
  ],
};

export default redGram;
