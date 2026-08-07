import type { Crop } from "./types";
import img from "@/assets/crop-rice.jpg";

const landPrep = [
  { title: "Field Cleaning", description: "Remove stubble, weeds and burn residue only if permitted.", icon: "broom" },
  { title: "Deep Ploughing", description: "Plough 15–20 cm deep 3–4 weeks before sowing.", icon: "plough" },
  { title: "Soil Testing", description: "Test for N, P, K, pH and micronutrients; target pH 5.5–6.5.", icon: "test" },
  { title: "Organic Compost", description: "Apply 8–10 tonnes/acre FYM or compost 15 days pre-transplant.", icon: "compost" },
  { title: "Puddling & Levelling", description: "Puddle with 5 cm standing water; level perfectly for uniform submergence.", icon: "level" },
  { title: "Bund & Bed Prep", description: "Repair bunds; make raised nursery beds 1.25 m wide.", icon: "bed" },
];

const rice: Crop = {
  slug: "rice",
  name: "Rice (Paddy)",
  localNames: { te: "వరి (Paddy)", hi: "चावल (Paddy)", ta: "நெல்", kn: "ಭತ್ತ", ml: "നെല്ല്" },
  tags: ["paddy", "dhana", "chawal", "annapoorna", "vari", "nellu", "vattu"],
  scientificName: "Oryza sativa",
  image: img,
  emoji: "🌾",
  season: "Kharif (Jun–Nov)",
  suitableDistricts: ["Krishna", "West Godavari", "East Godavari", "Guntur", "Nellore"],
  climate: "Hot & humid",
  temperature: "22–32°C",
  rainfall: "1000–1500 mm",
  soilType: "Clay, Clay-loam (water retentive)",
  soilPh: "5.5 – 6.5",
  waterNeed: "High",
  profitPct: 42,
  yield: "28–32 quintals/acre",
  trending: true,
  landPrep,
  seedRate: "8–10 kg/acre (transplanted); 25–30 kg/acre (direct)",
  seedTreatment: "Soak in 3% salt solution; treat with Carbendazim 2 g/kg",
  spacing: "20 × 15 cm (rows × plants)",
  sowingMethod: "Transplanting 21–25 day seedlings, 2 per hill",
  irrigation: [
    "Keep 2–5 cm standing water till panicle initiation",
    "Drain field at maximum tillering for 5 days",
    "Stop irrigation 10 days before harvest",
  ],
  fertilizer: [
    { name: "Urea", perAcreKg: 45, stage: "Basal + 2 top dress" },
    { name: "DAP", perAcreKg: 40, stage: "Basal" },
    { name: "MOP (Potash)", perAcreKg: 20, stage: "Basal" },
    { name: "Zinc Sulphate", perAcreKg: 10, stage: "Basal" },
    { name: "Gypsum", perAcreKg: 100, stage: "Land prep" },
    { name: "FYM / Compost", perAcreKg: 4000, stage: "15 days before transplant" },
  ],
  weeds: ["Echinochloa spp.", "Cyperus rotundus", "Apply Pretilachlor 500 ml/acre PE"],
  diseases: [
    {
      name: "Blast",
      symptoms: "Spindle-shaped lesions on leaves; neck rot on panicle.",
      cause: "Pyricularia oryzae fungus in humid weather.",
      organic: "Neem oil 5 ml/L spray at panicle initiation.",
      chemical: "Tricyclazole 75 WP @ 0.6 g/L.",
      severity: 4,
    },
    {
      name: "Bacterial Leaf Blight",
      symptoms: "Yellow water-soaked stripes along leaf margins.",
      cause: "Xanthomonas oryzae; spreads via irrigation water.",
      organic: "Panchagavya spray + copper hydroxide dust.",
      chemical: "Streptocycline 15 g + Copper oxychloride 500 g/acre.",
      severity: 3,
    },
    {
      name: "Sheath Blight",
      symptoms: "Oval greyish lesions on leaf sheath near water line.",
      cause: "Rhizoctonia solani; heavy N application worsens it.",
      organic: "Trichoderma viride 1 kg with FYM basal.",
      chemical: "Hexaconazole 5 EC @ 2 ml/L.",
      severity: 3,
    },
  ],
  pests: ["Stem borer — Cartap Hydrochloride 400 g/acre", "Brown Plant Hopper — Imidacloprid 40 ml/acre"],
  harvesting: "Harvest when 80% grains turn straw-yellow; moisture 20–22%.",
  storage: "Dry to 14% moisture; store in ventilated gunny bags on wooden pallets.",
  marketPrice: {
    unit: "₹/quintal",
    price: 2320,
    msp: 2300,
    trend: [
      { day: "Mon", price: 2280 },
      { day: "Tue", price: 2295 },
      { day: "Wed", price: 2310 },
      { day: "Thu", price: 2305 },
      { day: "Fri", price: 2320 },
      { day: "Sat", price: 2335 },
      { day: "Sun", price: 2340 },
    ],
  },
  rotation: [
    { crop: "Black Gram", season: "Rabi", gapDays: 15, benefit: "Fixes 40–60 kg N/acre; breaks disease cycle." },
    { crop: "Groundnut", season: "Rabi", gapDays: 20, benefit: "Restores soil structure and nitrogen." },
    { crop: "Maize", season: "Kharif (next)", gapDays: 25, benefit: "Different rooting depth reduces pest carryover." },
  ],
  tips: [
    "Adopt SRI (System of Rice Intensification) for 20% higher yield.",
    "Apply silica-rich rice-husk ash to strengthen stems against lodging.",
    "Monitor weekly for BPH with yellow sticky traps.",
  ],
  precautions: [
    "Avoid heavy nitrogen at flowering — invites BPH.",
    "Do not burn stubble — degrades soil biology.",
  ],
  references: [
    { label: "ICAR Rice Package of Practices", url: "https://icar-nrri.in/" },
    { label: "YouTube: SRI Paddy Cultivation", url: "https://www.youtube.com/results?search_query=SRI+paddy+cultivation" },
  ],
};

export default rice;
