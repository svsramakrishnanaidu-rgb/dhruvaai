// Crop-wise fertilizer organisation layer.
// Maps every major Indian crop (and crop group) to the fertilizers in the
// knowledge center, then buckets them into curated shelves + a stage-wise
// nutrition schedule. Pure derivation — no crop data is mutated or merged.

import { aiImage } from "@/lib/fert-image";
import {
  FERTILIZERS_ALL,
  type Fertilizer,
  type FertilizerCategory,
} from "./fertilizers";

export type CropGroup =
  | "Cereal"
  | "Pulse"
  | "Millet"
  | "Oilseed"
  | "Cash"
  | "Vegetable"
  | "Fruit"
  | "Spice"
  | "Plantation"
  | "Medicinal";

export type FertCrop = {
  slug: string;
  name: string;
  emoji: string;
  group: CropGroup;
  /** Terms matched against `suitableCrops` of each fertilizer. */
  aliases: string[];
  /** Season / duration hint shown on the crop page. */
  season: string;
  /** Indicative full-season NPK requirement in kg per acre. */
  npkPerAcre: { n: number; p: number; k: number };
  note: string;
};

// ── Content-derived imagery ───────────────────────────────────────────────
// Every image prompt is built from the crop's own data (name, group, season,
// NPK need) plus the section it illustrates, so no two cards repeat a photo.

export function cropHeroImage(crop: FertCrop): string {
  return aiImage(
    `${crop.name} ${crop.group.toLowerCase()} crop field in India during ${crop.season}, farmer applying fertilizer, healthy canopy, wide cinematic landscape`,
    1600,
    900,
  );
}

export function cropCardImage(crop: FertCrop): string {
  return aiImage(
    `close up of healthy ${crop.name} ${crop.group.toLowerCase()} crop in an Indian farm, ${crop.npkPerAcre.n}-${crop.npkPerAcre.p}-${crop.npkPerAcre.k} nutrition, sunlit rows`,
    800,
    600,
  );
}

export function stageImage(crop: FertCrop, stage: string, nutrients: string): string {
  return aiImage(
    `${crop.name} crop at ${stage} stage (${nutrients}) in an Indian field, fertilizer being applied at this growth stage, agronomy documentary photo`,
    900,
    600,
  );
}

export function comboImage(crop: FertCrop, title: string, when: string): string {
  return aiImage(
    `fertilizer combination "${title}" for ${crop.name} applied ${when}, bags and granules laid out beside the ${crop.name} field, Indian agriculture`,
    900,
    600,
  );
}

export function shelfImage(crop: FertCrop, title: string): string {
  return aiImage(
    `${title} fertilizers for ${crop.name} — assorted product bags and granules on a wooden bench at an Indian agri input store, ${crop.group.toLowerCase()} crop visible behind`,
    1200,
    500,
  );
}

export function avoidImage(crop: FertCrop): string {
  return aiImage(
    `warning sign beside a ${crop.name} field in India about unsuitable fertilizer use, damaged leaf tips, caution agronomy photo`,
    1200,
    500,
  );
}

/** Universal terms — fertilizers tagged with these suit almost any crop. */
const UNIVERSAL = ["all", "horticulture", "crops"];

const GROUP_TERMS: Record<CropGroup, string[]> = {
  Cereal: ["cereal", "cereals", "non-legume", "non-legumes"],
  Pulse: ["pulse", "pulses", "legume", "legumes"],
  Millet: ["millet", "millets", "cereal", "cereals"],
  Oilseed: ["oilseed", "oilseeds"],
  Cash: ["cash crop"],
  Vegetable: ["vegetable", "vegetables"],
  Fruit: ["fruit", "fruits"],
  Spice: ["spice", "spices", "vegetables"],
  Plantation: ["plantation"],
  Medicinal: ["medicinal", "aromatic", "horticulture"],
};

export const FERT_CROPS: FertCrop[] = [
  { slug: "paddy", name: "Paddy (Rice)", emoji: "🌾", group: "Cereal", aliases: ["paddy", "rice"], season: "Kharif & Rabi · 120–145 days", npkPerAcre: { n: 48, p: 24, k: 24 }, note: "Split nitrogen in 3 doses; avoid nitrate forms in flooded fields." },
  { slug: "wheat", name: "Wheat", emoji: "🌾", group: "Cereal", aliases: ["wheat"], season: "Rabi · 120–140 days", npkPerAcre: { n: 48, p: 24, k: 16 }, note: "Apply first top-dress with the crown-root irrigation (21 DAS)." },
  { slug: "maize", name: "Maize", emoji: "🌽", group: "Cereal", aliases: ["maize", "corn"], season: "All seasons · 90–115 days", npkPerAcre: { n: 60, p: 24, k: 24 }, note: "Highly responsive to zinc — apply ZnSO₄ basally." },
  { slug: "barley", name: "Barley", emoji: "🌾", group: "Cereal", aliases: ["barley"], season: "Rabi · 110–130 days", npkPerAcre: { n: 32, p: 16, k: 12 }, note: "Lower N than wheat to prevent lodging." },
  { slug: "jowar", name: "Jowar (Sorghum)", emoji: "🌾", group: "Millet", aliases: ["sorghum", "jowar"], season: "Kharif & Rabi · 100–120 days", npkPerAcre: { n: 32, p: 16, k: 12 }, note: "Drought tolerant — apply N only with adequate moisture." },
  { slug: "bajra", name: "Bajra (Pearl Millet)", emoji: "🌾", group: "Millet", aliases: ["bajra", "pearl millet", "millet"], season: "Kharif · 75–90 days", npkPerAcre: { n: 24, p: 12, k: 8 }, note: "Short duration — full P basal, N in two splits." },
  { slug: "ragi", name: "Ragi (Finger Millet)", emoji: "🌾", group: "Millet", aliases: ["ragi", "finger millet", "millet"], season: "Kharif · 100–120 days", npkPerAcre: { n: 20, p: 10, k: 10 }, note: "Responds well to FYM + biofertilizer combination." },
  { slug: "cotton", name: "Cotton", emoji: "🧵", group: "Cash", aliases: ["cotton"], season: "Kharif · 160–200 days", npkPerAcre: { n: 48, p: 24, k: 24 }, note: "Foliar KNO₃ at boll development lifts boll weight." },
  { slug: "sugarcane", name: "Sugarcane", emoji: "🎋", group: "Cash", aliases: ["sugarcane"], season: "Annual · 300–365 days", npkPerAcre: { n: 100, p: 34, k: 48 }, note: "Heavy feeder — earth up after each top-dress." },
  { slug: "groundnut", name: "Groundnut", emoji: "🥜", group: "Oilseed", aliases: ["groundnut", "peanut"], season: "Kharif & Rabi · 100–120 days", npkPerAcre: { n: 10, p: 16, k: 20 }, note: "Gypsum at pegging is non-negotiable for pod filling." },
  { slug: "soybean", name: "Soybean", emoji: "🫘", group: "Oilseed", aliases: ["soybean", "soya"], season: "Kharif · 90–110 days", npkPerAcre: { n: 8, p: 24, k: 16 }, note: "Seed-treat with Rhizobium; skip heavy N." },
  { slug: "mustard", name: "Mustard", emoji: "🌼", group: "Oilseed", aliases: ["mustard", "rapeseed", "oilseed"], season: "Rabi · 110–130 days", npkPerAcre: { n: 32, p: 16, k: 12 }, note: "Sulphur-hungry — 8 kg S/acre raises oil content." },
  { slug: "sunflower", name: "Sunflower", emoji: "🌻", group: "Oilseed", aliases: ["sunflower", "oilseed"], season: "Rabi & Summer · 90–110 days", npkPerAcre: { n: 24, p: 36, k: 24 }, note: "Boron spray at ray-floret stage prevents hollow seed." },
  { slug: "sesame", name: "Sesame", emoji: "🌱", group: "Oilseed", aliases: ["sesame", "til", "oilseed"], season: "Kharif & Summer · 80–95 days", npkPerAcre: { n: 16, p: 8, k: 8 }, note: "Light feeder — avoid excess nitrogen." },
  { slug: "castor", name: "Castor", emoji: "🌿", group: "Oilseed", aliases: ["castor", "oilseed"], season: "Kharif · 150–180 days", npkPerAcre: { n: 24, p: 16, k: 8 }, note: "Long duration — three N splits across spikes." },
  { slug: "red-gram", name: "Red Gram (Tur)", emoji: "🫛", group: "Pulse", aliases: ["red gram", "pigeon pea", "tur", "pulses"], season: "Kharif · 150–180 days", npkPerAcre: { n: 8, p: 20, k: 8 }, note: "Rhizobium + PSB seed treatment replaces starter N." },
  { slug: "bengal-gram", name: "Bengal Gram (Chana)", emoji: "🫘", group: "Pulse", aliases: ["bengal gram", "chickpea", "gram", "pulses"], season: "Rabi · 100–120 days", npkPerAcre: { n: 8, p: 20, k: 8 }, note: "Single basal dose; avoid top-dressing nitrogen." },
  { slug: "green-gram", name: "Green Gram (Moong)", emoji: "🫛", group: "Pulse", aliases: ["green gram", "moong", "pulses"], season: "All seasons · 60–75 days", npkPerAcre: { n: 8, p: 16, k: 8 }, note: "Two foliar sprays of 2% DAP at flowering." },
  { slug: "black-gram", name: "Black Gram (Urad)", emoji: "🫘", group: "Pulse", aliases: ["black gram", "urad", "pulses"], season: "Kharif & Rabi · 70–85 days", npkPerAcre: { n: 8, p: 16, k: 8 }, note: "Excellent rice-fallow crop with residual fertility." },
  { slug: "lentil", name: "Lentil (Masoor)", emoji: "🫘", group: "Pulse", aliases: ["lentil", "masoor", "pulses"], season: "Rabi · 105–120 days", npkPerAcre: { n: 8, p: 18, k: 8 }, note: "Molybdenum seed treatment boosts nodulation." },
  { slug: "coconut", name: "Coconut", emoji: "🥥", group: "Plantation", aliases: ["coconut", "plantation"], season: "Perennial", npkPerAcre: { n: 30, p: 20, k: 60 }, note: "Potassium is king — split into 2–3 doses a year." },
  { slug: "banana", name: "Banana", emoji: "🍌", group: "Fruit", aliases: ["banana", "fruits"], season: "Perennial · 11–14 months", npkPerAcre: { n: 80, p: 30, k: 100 }, note: "Fertigate weekly; K demand peaks at bunch emergence." },
  { slug: "mango", name: "Mango", emoji: "🥭", group: "Fruit", aliases: ["mango", "fruits"], season: "Perennial", npkPerAcre: { n: 40, p: 20, k: 40 }, note: "Post-harvest dose builds next season's flowering wood." },
  { slug: "citrus", name: "Citrus (Orange / Lemon)", emoji: "🍊", group: "Fruit", aliases: ["citrus", "orange", "lemon", "fruits"], season: "Perennial", npkPerAcre: { n: 36, p: 18, k: 36 }, note: "Chronic Fe & Zn chlorosis — chelate sprays twice a year." },
  { slug: "grapes", name: "Grapes", emoji: "🍇", group: "Fruit", aliases: ["grape", "grapes", "fruits"], season: "Perennial · 2 pruning cycles", npkPerAcre: { n: 40, p: 24, k: 60 }, note: "Water-soluble fertigation is standard practice." },
  { slug: "apple", name: "Apple", emoji: "🍎", group: "Fruit", aliases: ["apple", "fruits"], season: "Perennial · temperate", npkPerAcre: { n: 30, p: 20, k: 40 }, note: "Calcium sprays prevent bitter pit in storage." },
  { slug: "pomegranate", name: "Pomegranate", emoji: "🌺", group: "Fruit", aliases: ["pomegranate", "fruits"], season: "Perennial · 3 bahars", npkPerAcre: { n: 30, p: 20, k: 40 }, note: "Boron + calcium reduce fruit cracking." },
  { slug: "papaya", name: "Papaya", emoji: "🫒", group: "Fruit", aliases: ["papaya", "fruits"], season: "Perennial · 9–11 months to fruit", npkPerAcre: { n: 50, p: 25, k: 50 }, note: "Monthly small doses beat heavy quarterly doses." },
  { slug: "guava", name: "Guava", emoji: "🍐", group: "Fruit", aliases: ["guava", "fruits"], season: "Perennial", npkPerAcre: { n: 30, p: 16, k: 30 }, note: "Zinc spray corrects the common little-leaf disorder." },
  { slug: "tomato", name: "Tomato", emoji: "🍅", group: "Vegetable", aliases: ["tomato", "vegetables"], season: "All seasons · 110–140 days", npkPerAcre: { n: 40, p: 24, k: 40 }, note: "Calcium nitrate weekly stops blossom-end rot." },
  { slug: "chilli", name: "Chilli", emoji: "🌶️", group: "Spice", aliases: ["chilli", "chili", "capsicum", "vegetables"], season: "Kharif · 150–180 days", npkPerAcre: { n: 40, p: 24, k: 32 }, note: "Sulphur improves pungency and colour." },
  { slug: "onion", name: "Onion", emoji: "🧅", group: "Vegetable", aliases: ["onion", "vegetables"], season: "Kharif & Rabi · 110–130 days", npkPerAcre: { n: 40, p: 20, k: 32 }, note: "Stop nitrogen 30 days before harvest for storage life." },
  { slug: "potato", name: "Potato", emoji: "🥔", group: "Vegetable", aliases: ["potato", "vegetables"], season: "Rabi · 90–110 days", npkPerAcre: { n: 60, p: 32, k: 50 }, note: "Use SOP over MOP for chip-grade tuber quality." },
  { slug: "brinjal", name: "Brinjal", emoji: "🍆", group: "Vegetable", aliases: ["brinjal", "eggplant", "vegetables"], season: "All seasons · 150–180 days", npkPerAcre: { n: 40, p: 20, k: 32 }, note: "Long picking window — top-dress after every 3 harvests." },
  { slug: "okra", name: "Okra (Bhendi)", emoji: "🌿", group: "Vegetable", aliases: ["okra", "bhendi", "lady finger", "vegetables"], season: "Kharif & Summer · 90–110 days", npkPerAcre: { n: 32, p: 20, k: 24 }, note: "Frequent light N keeps pods tender." },
  { slug: "cabbage", name: "Cabbage", emoji: "🥬", group: "Vegetable", aliases: ["cabbage", "vegetables"], season: "Rabi · 90–110 days", npkPerAcre: { n: 48, p: 24, k: 32 }, note: "Boron deficiency causes hollow stem — apply basally." },
  { slug: "cauliflower", name: "Cauliflower", emoji: "🥦", group: "Vegetable", aliases: ["cauliflower", "vegetables"], season: "Rabi · 90–120 days", npkPerAcre: { n: 48, p: 24, k: 32 }, note: "Mo + B prevent whiptail and browning of curds." },
  { slug: "turmeric", name: "Turmeric", emoji: "🟡", group: "Spice", aliases: ["turmeric", "spices", "vegetables"], season: "Kharif · 240–270 days", npkPerAcre: { n: 40, p: 20, k: 40 }, note: "Mulch + FYM twice; K drives rhizome bulking." },
  { slug: "ginger", name: "Ginger", emoji: "🫚", group: "Spice", aliases: ["ginger", "spices", "vegetables"], season: "Kharif · 210–240 days", npkPerAcre: { n: 30, p: 20, k: 40 }, note: "Split K at 60, 90 and 120 DAP with earthing up." },
  { slug: "black-pepper", name: "Black Pepper", emoji: "⚫", group: "Spice", aliases: ["pepper", "spices", "plantation"], season: "Perennial", npkPerAcre: { n: 20, p: 12, k: 30 }, note: "Apply with the onset of monsoon around the vine basin." },
  { slug: "cardamom", name: "Cardamom", emoji: "🌿", group: "Spice", aliases: ["cardamom", "spices", "plantation"], season: "Perennial", npkPerAcre: { n: 30, p: 12, k: 36 }, note: "Shade-loving — use organic-heavy nutrition." },
  { slug: "tea", name: "Tea", emoji: "🍵", group: "Plantation", aliases: ["tea", "plantation"], season: "Perennial · plucking rounds", npkPerAcre: { n: 50, p: 12, k: 24 }, note: "Acid-loving; ammonium sources preferred over nitrate." },
  { slug: "coffee", name: "Coffee", emoji: "☕", group: "Plantation", aliases: ["coffee", "plantation"], season: "Perennial", npkPerAcre: { n: 40, p: 16, k: 40 }, note: "Three rounds: pre-monsoon, monsoon and post-monsoon." },
  { slug: "rubber", name: "Rubber", emoji: "🌳", group: "Plantation", aliases: ["rubber", "plantation"], season: "Perennial", npkPerAcre: { n: 24, p: 16, k: 16 }, note: "Apply in a shallow band along the drip circle." },
  { slug: "arecanut", name: "Arecanut", emoji: "🌴", group: "Plantation", aliases: ["arecanut", "plantation"], season: "Perennial", npkPerAcre: { n: 30, p: 16, k: 56 }, note: "High K need; two doses with basin irrigation." },
  { slug: "tobacco", name: "Tobacco", emoji: "🍂", group: "Cash", aliases: ["tobacco"], season: "Rabi · 120–140 days", npkPerAcre: { n: 24, p: 20, k: 40 }, note: "Chloride-sensitive — use SOP, never MOP." },
  { slug: "fodder", name: "Fodder Crops", emoji: "🌾", group: "Cereal", aliases: ["fodder", "turf", "cereals"], season: "Multi-cut", npkPerAcre: { n: 40, p: 16, k: 16 }, note: "Top-dress N after every cut." },
  { slug: "medicinal", name: "Medicinal & Aromatic Crops", emoji: "🌿", group: "Medicinal", aliases: ["medicinal", "aromatic", "horticulture"], season: "Varies", npkPerAcre: { n: 20, p: 12, k: 16 }, note: "Prefer organic and bio inputs to protect active compounds." },
];

export const FERT_CROPS_BY_SLUG: Record<string, FertCrop> = Object.fromEntries(
  FERT_CROPS.map((c) => [c.slug, c]),
);

export const FERT_CROP_GROUPS: CropGroup[] = [
  "Cereal", "Millet", "Pulse", "Oilseed", "Vegetable",
  "Fruit", "Spice", "Plantation", "Cash", "Medicinal",
];

// ── Matching ──────────────────────────────────────────────────────────────

function tokens(crop: FertCrop): string[] {
  return [...crop.aliases, ...GROUP_TERMS[crop.group]].map((t) => t.toLowerCase());
}

function matchScore(f: Fertilizer, crop: FertCrop): number {
  const list = f.suitableCrops.map((c) => c.toLowerCase());
  const unsuitable = (f.unsuitableCrops ?? []).map((c) => c.toLowerCase());
  if (crop.aliases.some((a) => unsuitable.some((u) => u.includes(a)))) return -1;

  const exact = crop.aliases.some((a) => list.some((c) => c.includes(a)));
  if (exact) return 3;
  const group = GROUP_TERMS[crop.group].some((t) => list.some((c) => c.includes(t)));
  if (group) return 2;
  const universal = list.some((c) => UNIVERSAL.includes(c.trim()) || c.startsWith("all"));
  if (universal) return 1;
  return 0;
}

export type Matched = { f: Fertilizer; score: number };

export function fertilizersForFertCrop(crop: FertCrop): Matched[] {
  return FERTILIZERS_ALL
    .map((f) => ({ f, score: matchScore(f, crop) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || a.f.name.localeCompare(b.f.name));
}

export function unsuitableForFertCrop(crop: FertCrop): Fertilizer[] {
  const toks = crop.aliases.map((a) => a.toLowerCase());
  return FERTILIZERS_ALL.filter((f) =>
    (f.unsuitableCrops ?? []).some((u) => toks.some((t) => u.toLowerCase().includes(t))),
  );
}

// ── Curated shelves ───────────────────────────────────────────────────────

const byCat = (m: Matched[], cats: FertilizerCategory[]) =>
  m.filter((x) => cats.includes(x.f.category));

export type Shelf = {
  key: string;
  title: string;
  subtitle: string;
  image: string;
  items: Fertilizer[];
};

export function shelvesFor(crop: FertCrop): Shelf[] {
  const m = fertilizersForFertCrop(crop);
  const specific = m.filter((x) => x.score >= 2);
  const pool = specific.length >= 6 ? specific : m;

  const priced = [...pool].sort((a, b) => a.f.price.inr - b.f.price.inr);
  const macro = byCat(pool, ["Complex NPK", "Nitrogen", "Phosphatic", "Potassic"]);

  const shelves: Omit<Shelf, "image">[] = [
    {
      key: "best",
      title: "Best-selling for this crop",
      subtitle: "The staples most farmers buy for this crop every season.",
      items: macro.filter((x) => x.f.govApproved).slice(0, 8).map((x) => x.f),
    },
    {
      key: "gov",
      title: "Government-recommended & subsidised",
      subtitle: "Products under the Nutrient Based Subsidy / FCO-approved list.",
      items: pool.filter((x) => x.f.govApproved && !!x.f.subsidy).slice(0, 8).map((x) => x.f),
    },
    {
      key: "organic",
      title: "Organic recommendations",
      subtitle: "Manures, composts and soil conditioners for residue-free farming.",
      items: byCat(m, ["Organic", "Soil amendment"]).slice(0, 8).map((x) => x.f),
    },
    {
      key: "bio",
      title: "Biofertilizers",
      subtitle: "Living inoculants that fix nitrogen and mobilise locked nutrients.",
      items: byCat(m, ["Bio-fertilizer"]).slice(0, 8).map((x) => x.f),
    },
    {
      key: "micro",
      title: "Micronutrients",
      subtitle: "Zn, Fe, B, Cu, Mn and Mo correctives for this crop's known deficiencies.",
      items: byCat(m, ["Micronutrient", "Secondary"]).slice(0, 8).map((x) => x.f),
    },
    {
      key: "new",
      title: "Recently launched",
      subtitle: "Nano, water-soluble and controlled-release products entering the market.",
      items: byCat(m, ["Liquid / Water-soluble", "Slow-release"]).slice(0, 8).map((x) => x.f),
    },
    {
      key: "premium",
      title: "Premium options",
      subtitle: "Higher-cost, higher-efficiency nutrition for commercial growers.",
      items: [...priced].reverse().slice(0, 6).map((x) => x.f),
    },
    {
      key: "budget",
      title: "Budget-friendly options",
      subtitle: "Lowest cost per unit of nutrient for the same job.",
      items: priced.slice(0, 6).map((x) => x.f),
    },
    {
      key: "alt",
      title: "Alternative options",
      subtitle: "Swap-in products when your usual grade is out of stock.",
      items: m.filter((x) => x.score === 1).slice(0, 8).map((x) => x.f),
    },
  ];

  return shelves
    .filter((s) => s.items.length > 0)
    .map((s) => ({ ...s, image: shelfImage(crop, s.title) }));
}

// ── Stage-wise nutrition schedule ─────────────────────────────────────────

export type StagePlan = {
  stage: string;
  window: string;
  goal: string;
  nutrients: string;
  image: string;
  picks: Fertilizer[];
};

type StageSpec = { stage: string; window: string; goal: string; nutrients: string; cats: FertilizerCategory[] };

const PERENNIAL: CropGroup[] = ["Fruit", "Plantation"];

function stageSpecs(crop: FertCrop): StageSpec[] {
  if (PERENNIAL.includes(crop.group)) {
    return [
      { stage: "Planting / Pit filling", window: "At planting", goal: "Build a fertile root zone before the sapling goes in.", nutrients: "Organic matter + P", cats: ["Organic", "Soil amendment", "Phosphatic"] },
      { stage: "Establishment", window: "Year 1–2", goal: "Fast canopy and root frame.", nutrients: "Balanced NPK", cats: ["Complex NPK", "Bio-fertilizer"] },
      { stage: "Pre-flowering", window: "6–8 weeks before bloom", goal: "Strong flower initiation.", nutrients: "P & K forward", cats: ["Phosphatic", "Potassic", "Liquid / Water-soluble"] },
      { stage: "Flowering & fruit set", window: "Bloom to marble stage", goal: "Retain flowers, reduce drop.", nutrients: "B, Ca, K", cats: ["Micronutrient", "Secondary", "Liquid / Water-soluble"] },
      { stage: "Fruit development", window: "Marble to sizing", goal: "Size, weight and sugar.", nutrients: "K dominant", cats: ["Potassic", "Liquid / Water-soluble"] },
      { stage: "Maturity & harvest", window: "Last 3–4 weeks", goal: "Colour, firmness, shelf life.", nutrients: "K + Ca, stop N", cats: ["Potassic", "Secondary"] },
      { stage: "Post-harvest recovery", window: "Immediately after harvest", goal: "Rebuild reserves for next season.", nutrients: "N + organic matter", cats: ["Nitrogen", "Organic", "Bio-fertilizer"] },
    ];
  }
  return [
    { stage: "Seed treatment", window: "Day 0", goal: "Protect the seed and inoculate the root zone.", nutrients: "Bio-inoculants", cats: ["Bio-fertilizer"] },
    { stage: "Land preparation", window: "7–10 days before sowing", goal: "Raise organic carbon and correct soil reaction.", nutrients: "Organic matter, Ca, S", cats: ["Organic", "Soil amendment", "Secondary"] },
    { stage: "Basal / Sowing", window: "At sowing or transplanting", goal: "Full P, part K and starter N in the root zone.", nutrients: "N-P-K basal", cats: ["Complex NPK", "Phosphatic"] },
    { stage: "Germination & seedling", window: "7–20 DAS", goal: "Uniform stand and early root push.", nutrients: "Starter P + Zn", cats: ["Phosphatic", "Micronutrient"] },
    { stage: "Vegetative growth", window: "20–40 DAS", goal: "Build canopy and tillers / branches.", nutrients: "Nitrogen top-dress", cats: ["Nitrogen"] },
    { stage: "Tillering / Branching", window: "35–55 DAS", goal: "Maximise productive tillers or branches.", nutrients: "N + K", cats: ["Nitrogen", "Potassic"] },
    { stage: "Flowering", window: "50–70 DAS", goal: "Pollination, flower retention.", nutrients: "B, K, foliar NPK", cats: ["Micronutrient", "Liquid / Water-soluble"] },
    { stage: "Fruit / Pod / Boll formation", window: "65–90 DAS", goal: "Set and hold the yield sinks.", nutrients: "K + Ca + B", cats: ["Potassic", "Secondary", "Liquid / Water-soluble"] },
    { stage: "Grain filling", window: "85–110 DAS", goal: "Fill and harden grain, lift test weight.", nutrients: "K + foliar N", cats: ["Potassic", "Liquid / Water-soluble"] },
    { stage: "Maturity", window: "Final 2 weeks", goal: "Even ripening — nitrogen is stopped.", nutrients: "None / K only", cats: ["Potassic"] },
    { stage: "Post-harvest soil recovery", window: "After harvest", goal: "Replace what the crop removed.", nutrients: "Organic + bio", cats: ["Organic", "Bio-fertilizer", "Soil amendment"] },
  ];
}

export function scheduleFor(crop: FertCrop): StagePlan[] {
  const m = fertilizersForFertCrop(crop);
  return stageSpecs(crop).map((s) => {
    const picks = m
      .filter((x) => s.cats.includes(x.f.category))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.f);
    return {
      stage: s.stage,
      window: s.window,
      goal: s.goal,
      nutrients: s.nutrients,
      image: stageImage(crop, s.stage, s.nutrients),
      picks,
    };
  });
}

// ── AI-style combination engine ───────────────────────────────────────────

export type Combo = {
  title: string;
  when: string;
  image: string;
  items: Fertilizer[];
  why: string;
};

export function combosFor(crop: FertCrop): Combo[] {
  const m = fertilizersForFertCrop(crop);
  const pick = (cats: FertilizerCategory[], n = 1) =>
    m.filter((x) => cats.includes(x.f.category)).sort((a, b) => b.score - a.score).slice(0, n).map((x) => x.f);

  const combos: Omit<Combo, "image">[] = [
    {
      title: "Basal power pack",
      when: "At sowing / planting",
      items: [...pick(["Complex NPK"]), ...pick(["Organic", "Soil amendment"]), ...pick(["Bio-fertilizer"])],
      why: `Puts the full phosphorus requirement (~${crop.npkPerAcre.p} kg P₂O₅/acre) in the root zone while organic carbon and inoculants keep it plant-available instead of getting fixed by the soil.`,
    },
    {
      title: "Vegetative surge",
      when: "20–40 days after sowing",
      items: [...pick(["Nitrogen"]), ...pick(["Micronutrient"])],
      why: `Splits the ${crop.npkPerAcre.n} kg N/acre requirement so the canopy builds fast without lodging, with zinc covering the most common Indian soil deficiency.`,
    },
    {
      title: "Reproductive booster",
      when: "Flowering to fruit / grain set",
      items: [...pick(["Liquid / Water-soluble"]), ...pick(["Micronutrient"]), ...pick(["Secondary"])],
      why: "Foliar potassium and boron at flowering cut flower drop and improve set — the single highest-return spray of the season.",
    },
    {
      title: "Yield finisher",
      when: "Grain filling / fruit sizing",
      items: [...pick(["Potassic"]), ...pick(["Liquid / Water-soluble"])],
      why: `Potassium drives translocation into the ${crop.group === "Cereal" || crop.group === "Millet" ? "grain" : "harvested part"}, lifting weight and quality grade.`,
    },
  ];
  return combos
    .filter((c) => c.items.length > 0)
    .map((c) => ({ ...c, image: comboImage(crop, c.title, c.when) }));
}
