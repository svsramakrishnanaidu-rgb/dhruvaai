import type { Crop } from "./types";
import img from "@/assets/crop-bengal-gram.jpg";

const bengalGram: Crop = {
  slug: "bengal-gram",
  name: "Bengal Gram (Chickpea)",
  scientificName: "Cicer arietinum",
  image: img,
  emoji: "🌰",
  category: "Pulse",
  family: "Fabaceae",
  description:
    "Rabi chickpea — a low-water, protein-rich winter crop. AP's Kurnool, Nandyal and Prakasam belts lead the state's chana production on residual soil moisture.",
  durationDays: 105,
  localNames: { te: "Sanagalu", hi: "Chana", ta: "Kadalai", kn: "Kadale" },
  tags: ["rainfed", "nitrogen-fixer", "drought-tolerant"],
  season: "Rabi (Oct–Feb)",
  suitableDistricts: [
    "Kurnool", "Nandyal", "Prakasam", "Anantapur", "Kadapa", "Guntur",
    "Palnadu", "Sri Sathya Sai", "Annamayya",
  ],
  climate: "Cool dry winter; frost sensitive at flowering",
  temperature: "15–29°C",
  rainfall: "400–600 mm (residual moisture)",
  soilType: "Well-drained black cotton or sandy loam",
  soilPh: "6.0 – 8.0",
  waterNeed: "Low",
  profitPct: 44,
  yield: "8–10 quintals/acre",
  trending: false,
  landPrep: [
    { title: "Stubble Removal", description: "Clear residues of the preceding kharif crop.", icon: "broom" },
    { title: "One Ploughing", description: "A single ploughing after harvest conserves moisture.", icon: "plough" },
    { title: "Fine Tilth", description: "One harrowing for a rough seedbed — do not pulverise.", icon: "level" },
    { title: "FYM", description: "2 t/acre FYM only if soil is very light.", icon: "compost" },
  ],
  seedRate: "25–30 kg/acre (desi); 35 kg/acre (kabuli)",
  seedTreatment: "Rhizobium + PSB 20 g/kg + Trichoderma 4 g/kg",
  spacing: "30 × 10 cm (rows × plants)",
  sowingMethod: "Seed drill 5–7 cm deep on residual moisture, 2nd–3rd week of October",
  irrigation: [
    "Rainfed if soil moisture is adequate at sowing",
    "One irrigation at branching (25–30 DAS) if dry",
    "Second irrigation at pod-formation (55–60 DAS) — avoid at flowering",
  ],
  fertilizer: [
    { name: "Urea", perAcreKg: 10, stage: "Basal" },
    { name: "DAP", perAcreKg: 30, stage: "Basal" },
    { name: "MOP", perAcreKg: 10, stage: "Basal" },
    { name: "Sulphur", perAcreKg: 60, stage: "Basal (Gypsum form)" },
    { name: "Rhizobium biofertilizer", perAcreKg: 1, stage: "Seed inoculation" },
  ],
  weeds: [
    "Chenopodium album, Cyperus rotundus, Phalaris minor",
    "Pendimethalin 1 L/acre pre-emergence",
    "One hand-weeding at 30–35 DAS",
  ],
  diseases: [
    {
      name: "Fusarium Wilt",
      symptoms: "Yellowing and drooping of lower leaves; black stem base on splitting.",
      cause: "Fusarium oxysporum f.sp. ciceris; favoured by warm dry soil.",
      organic: "Trichoderma viride 4 g/kg seed + neem cake 200 kg/acre.",
      chemical: "Carbendazim 2 g/kg seed treatment.",
      severity: 4,
    },
    {
      name: "Ascochyta Blight",
      symptoms: "Circular brown lesions with concentric rings on leaves and pods.",
      cause: "Ascochyta rabiei; cool humid weather triggers epidemic.",
      organic: "Bordeaux mixture 1% foliar spray.",
      chemical: "Mancozeb 2 g/L at first symptom.",
      severity: 3,
    },
  ],
  pests: [
    "Pod borer (Helicoverpa) — HaNPV 200 LE/acre or Emamectin benzoate 80 g/acre",
    "Cutworm — Chlorpyriphos 800 ml/acre soil drench at seedling",
  ],
  harvesting: "Harvest when 90% pods turn straw-yellow and leaves drop; thresh at 12% moisture.",
  storage: "Dry to 9%; store in air-tight bins with 2 tablets of aluminium phosphide per tonne.",
  marketPrice: {
    unit: "₹/quintal",
    price: 5710,
    msp: 5650,
    trend: [
      { day: "Mon", price: 5590 },
      { day: "Tue", price: 5620 },
      { day: "Wed", price: 5660 },
      { day: "Thu", price: 5680 },
      { day: "Fri", price: 5710 },
      { day: "Sat", price: 5740 },
      { day: "Sun", price: 5760 },
    ],
  },
  rotation: [
    { crop: "Jowar", season: "Kharif", gapDays: 20, benefit: "Uses fixed N; breaks wilt cycle." },
    { crop: "Cotton", season: "Kharif", gapDays: 25, benefit: "Legume before cotton reduces N cost." },
    { crop: "Bajra", season: "Kharif", gapDays: 20, benefit: "Improves cereal yield on residual N." },
  ],
  tips: [
    "Pinch tops at 30 DAS to encourage side branches and 15% more pods.",
    "Foliar spray 2% urea + 0.5% KCl at pod-fill for grain plumpness.",
    "Avoid ploughing when soil is wet — destroys mycorrhiza.",
  ],
  precautions: [
    "Do not irrigate at flowering — causes flower drop.",
    "Never sow before mid-October in dry belts — heat stress kills seedlings.",
  ],
  references: [
    { label: "ICAR — IIPR Chickpea", url: "https://iipr.icar.gov.in/" },
    { label: "YouTube: Chickpea Rabi Cultivation", url: "https://www.youtube.com/results?search_query=chickpea+cultivation+india" },
  ],
};

export default bengalGram;
