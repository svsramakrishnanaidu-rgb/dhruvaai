// Extended, image-first knowledge layer that augments every crop with
// growth-stage galleries, weed library, pest library and rich disease
// entries. Kept as a *separate module* so each individual crop file
// remains isolated. Lookups are by slug with graceful category fallback.

import type { Crop, CropCategory } from "./crops/types";
import { categoryOf } from "./crops";

export type GrowthStage = {
  key: string;
  label: string;
  days: string;
  description: string;
  image: string;
};

export type WeedEntry = {
  name: string;
  scientific: string;
  lifeCycle: "Annual" | "Biennial" | "Perennial";
  severity: 1 | 2 | 3 | 4 | 5;
  identify: string;
  cultural: string;
  mechanical: string;
  chemical: {
    activeIngredient: string;
    brands: string[];
    dose: string;
    timing: string;
    water: string;
    phi: string; // pre-harvest interval
    safety: string;
  };
  image: string;
};

export type PestEntry = {
  name: string;
  scientific: string;
  damage: string;
  lifecycle: string;
  severity: 1 | 2 | 3 | 4 | 5;
  organic: string;
  biological: string;
  chemical: { activeIngredient: string; brands: string[]; dose: string; timing: string; phi: string };
  image: string;
};

export type DiseaseDetail = {
  name: string;
  scientific: string;
  category: "Fungal" | "Bacterial" | "Viral" | "Nematode" | "Nutritional";
  stages: string; // early / middle / advanced
  spread: string;
  favorable: string;
  prevention: string;
  organic: string;
  biological: string;
  chemical: {
    activeIngredient: string;
    brands: string[];
    dose: string;
    schedule: string;
    reEntry: string;
    phi: string;
  };
  recovery: string;
  image: string;
};

export type CropExtras = {
  stages: GrowthStage[];
  weeds: WeedEntry[];
  pests: PestEntry[];
  diseases: DiseaseDetail[];
};

// Stock image pool by category — real, name-matching royalty-free imagery
// via Unsplash source (deterministic per keyword).
const img = (q: string) =>
  `https://source.unsplash.com/1200x800/?${encodeURIComponent(q)}`;

function stagesFor(crop: Crop): GrowthStage[] {
  const base = crop.name;
  return [
    { key: "seed", label: "Seed", days: "0", description: "Viable, treated seed ready for sowing.", image: img(`${base} seed`) },
    { key: "seedling", label: "Seedling", days: "5–20", description: "Cotyledons emerge; first true leaves appear.", image: img(`${base} seedling`) },
    { key: "vegetative", label: "Vegetative", days: "20–55", description: "Rapid canopy and root development.", image: img(`${base} plant field`) },
    { key: "flowering", label: "Flowering", days: "55–90", description: "Pollination and reproductive phase.", image: img(`${base} flower`) },
    { key: "fruiting", label: "Fruiting / Grain fill", days: "90–120", description: "Grain / fruit development and filling.", image: img(`${base} fruit`) },
    { key: "harvest", label: "Harvest", days: "120+", description: "Physiological maturity — ready for harvest.", image: img(`${base} harvest`) },
  ];
}

const GENERIC_WEEDS: Record<CropCategory | "default", WeedEntry[]> = {
  Cereal: [
    {
      name: "Barnyard grass", scientific: "Echinochloa crus-galli", lifeCycle: "Annual", severity: 5,
      identify: "Purple-tinged stem base, no ligule, flat panicle.",
      cultural: "Certified seed, stale seedbed, dense planting.",
      mechanical: "Hand-weeding 20 & 40 DAS.",
      chemical: { activeIngredient: "Bispyribac-sodium 10% SC", brands: ["Nominee Gold", "Adora"], dose: "100 ml/acre", timing: "15–20 DAT", water: "150 L/acre", phi: "60 days", safety: "Wear mask & gloves; avoid drift." },
      image: img("barnyard grass weed"),
    },
    {
      name: "Purple nutsedge", scientific: "Cyperus rotundus", lifeCycle: "Perennial", severity: 4,
      identify: "Triangular stem, shiny dark-green leaves, underground tubers.",
      cultural: "Deep summer ploughing to expose tubers.",
      mechanical: "Repeated hoeing every 15 days.",
      chemical: { activeIngredient: "Halosulfuron-methyl 75% WG", brands: ["Sempra"], dose: "36 g/acre", timing: "20–25 DAS", water: "150 L/acre", phi: "50 days", safety: "Avoid contact with skin & eyes." },
      image: img("nutsedge weed"),
    },
  ],
  Pulse: [
    {
      name: "Wild jute", scientific: "Corchorus olitorius", lifeCycle: "Annual", severity: 3,
      identify: "Serrated leaves, small yellow flowers, fibrous stem.",
      cultural: "Crop rotation with cereals.",
      mechanical: "Inter-culture at 25 & 45 DAS.",
      chemical: { activeIngredient: "Imazethapyr 10% SL", brands: ["Pursuit"], dose: "400 ml/acre", timing: "15–20 DAS", water: "200 L/acre", phi: "60 days", safety: "Wear PPE; do not spray in wind." },
      image: img("wild jute weed"),
    },
  ],
  Millet: [
    {
      name: "Goose grass", scientific: "Eleusine indica", lifeCycle: "Annual", severity: 3,
      identify: "Silvery-white base, flat prostrate growth.",
      cultural: "Line sowing with narrow spacing.",
      mechanical: "Blade harrow at 20 DAS.",
      chemical: { activeIngredient: "Atrazine 50% WP", brands: ["Atrataf"], dose: "500 g/acre", timing: "PRE-emergence", water: "200 L/acre", phi: "N/A", safety: "Do not use on light soils." },
      image: img("goose grass weed"),
    },
  ],
  Oilseed: [
    {
      name: "Lambsquarter", scientific: "Chenopodium album", lifeCycle: "Annual", severity: 4,
      identify: "Mealy-white young leaves, diamond-shaped.",
      cultural: "Timely sowing; smother crops.",
      mechanical: "Two hand weedings.",
      chemical: { activeIngredient: "Pendimethalin 30% EC", brands: ["Stomp"], dose: "1 L/acre", timing: "PRE-emergence 0–3 DAS", water: "200 L/acre", phi: "N/A", safety: "Stains skin & clothes." },
      image: img("Chenopodium album weed"),
    },
  ],
  Cash: [
    {
      name: "Wild sorghum", scientific: "Sorghum halepense", lifeCycle: "Perennial", severity: 5,
      identify: "Tall grass with rhizomes; reddish panicles.",
      cultural: "Prevent rhizome spread; clean equipment.",
      mechanical: "Rhizome removal by deep ploughing.",
      chemical: { activeIngredient: "Glyphosate 41% SL", brands: ["Roundup"], dose: "1 L/acre", timing: "Directed spray", water: "150 L/acre", phi: "N/A", safety: "Non-selective; shield crop." },
      image: img("Johnson grass weed"),
    },
  ],
  Horticulture: [],
  Spice: [
    { name: "Bermuda grass", scientific: "Cynodon dactylon", lifeCycle: "Perennial", severity: 4, identify: "Wiry stolons, small spikes forming a cross.", cultural: "Mulch with straw 5 cm thick.", mechanical: "Hand pull with rhizomes.", chemical: { activeIngredient: "Quizalofop-ethyl 5% EC", brands: ["Targa Super"], dose: "400 ml/acre", timing: "3–5 leaf stage", water: "200 L/acre", phi: "45 days", safety: "Grass-selective; safe on broadleaf crops." }, image: img("bermuda grass weed") },
  ],
  Vegetable: [
    { name: "Pigweed", scientific: "Amaranthus viridis", lifeCycle: "Annual", severity: 4, identify: "Red-tinged stem, alternate ovate leaves.", cultural: "Stale seedbed 10 days before sowing.", mechanical: "Hoe at 15 & 30 DAT.", chemical: { activeIngredient: "Oxyfluorfen 23.5% EC", brands: ["Goal"], dose: "400 ml/acre", timing: "PRE-emergence", water: "200 L/acre", phi: "60 days", safety: "Avoid overlap; may cause bleaching." }, image: img("Amaranthus weed") },
  ],
  Fruit: [],
  Plantation: [],
  Fodder: [],
  Flower: [],
  Medicinal: [],
  default: [],
};

const GENERIC_PESTS: Record<CropCategory | "default", PestEntry[]> = {
  Cereal: [
    { name: "Stem borer", scientific: "Scirpophaga incertulas", damage: "Dead-hearts in vegetative, white-ears at panicle.", lifecycle: "Egg → larva (25 d) → pupa → moth; 5 broods/yr.", severity: 5, organic: "Neem seed extract 5%.", biological: "Release Trichogramma japonicum @ 20k/acre 6×.", chemical: { activeIngredient: "Chlorantraniliprole 18.5% SC", brands: ["Coragen"], dose: "60 ml/acre", timing: "Egg-mass sighting", phi: "35 days" }, image: img("rice stem borer") },
    { name: "Brown planthopper", scientific: "Nilaparvata lugens", damage: "Hopper burn — circular patches of dried plants.", lifecycle: "Egg (7d) → nymph (14d) → adult; multiple broods.", severity: 5, organic: "Drain field for 3–4 days.", biological: "Encourage mirid bugs & spiders.", chemical: { activeIngredient: "Pymetrozine 50% WG", brands: ["Chess"], dose: "120 g/acre", timing: "At ETL 5/hill", phi: "21 days" }, image: img("planthopper insect") },
  ],
  Cash: [
    { name: "Pink bollworm", scientific: "Pectinophora gossypiella", damage: "Rosette flowers, damaged bolls.", lifecycle: "Egg → larva (14 d) → pupa → moth.", severity: 5, organic: "Pheromone traps 8/acre.", biological: "Trichogramma bactrae releases.", chemical: { activeIngredient: "Emamectin benzoate 5% SG", brands: ["Proclaim"], dose: "88 g/acre", timing: "Boll formation", phi: "7 days" }, image: img("bollworm cotton") },
  ],
  Vegetable: [
    { name: "Fruit borer", scientific: "Helicoverpa armigera", damage: "Round holes on fruit; larva inside.", lifecycle: "Egg → larva (18 d) → pupa → moth.", severity: 5, organic: "HaNPV 250 LE/acre.", biological: "Trichogramma chilonis 60k/acre.", chemical: { activeIngredient: "Flubendiamide 39.35% SC", brands: ["Fame"], dose: "40 ml/acre", timing: "Egg-lay", phi: "3 days" }, image: img("fruit borer larva") },
  ],
  Pulse: [
    { name: "Pod borer", scientific: "Maruca vitrata", damage: "Webbed flowers and bored pods.", lifecycle: "Egg → larva (14 d) → pupa → moth.", severity: 4, organic: "Neem oil 3% at flowering.", biological: "Bacillus thuringiensis 500 g/acre.", chemical: { activeIngredient: "Chlorantraniliprole 18.5% SC", brands: ["Coragen"], dose: "60 ml/acre", timing: "50% flowering", phi: "14 days" }, image: img("pod borer pulse") },
  ],
  Millet: [], Oilseed: [], Horticulture: [], Spice: [], Fruit: [], Plantation: [], Fodder: [], Flower: [], Medicinal: [],
  default: [],
};

function diseasesFrom(crop: Crop): DiseaseDetail[] {
  // Upgrade the crop's own disease list to the detailed schema using best-practice defaults.
  return crop.diseases.map((d) => ({
    name: d.name,
    scientific: "—",
    category: /virus/i.test(d.cause) ? "Viral" : /bacter/i.test(d.cause) ? "Bacterial" : /nemat/i.test(d.cause) ? "Nematode" : /deficien|nutrit/i.test(d.cause) ? "Nutritional" : "Fungal",
    stages: "Early: small lesions. Middle: coalescing spots. Advanced: defoliation / systemic damage.",
    spread: "Wind, rain-splash, contaminated tools and infected seed.",
    favorable: "High humidity (>80%), dense canopy, prolonged leaf wetness.",
    prevention: "Resistant varieties, spacing, sanitation, seed treatment, crop rotation.",
    organic: d.organic,
    biological: "Trichoderma viride @ 4 g/kg seed; Pseudomonas fluorescens foliar 0.5%.",
    chemical: {
      activeIngredient: d.chemical.split(/[,()]/)[0] || d.chemical,
      brands: ["Local formulations"],
      dose: "As per label",
      schedule: "2 sprays at 10-day interval on symptom appearance",
      reEntry: "24 hours",
      phi: "14 days",
    },
    recovery: "New flush appears in 10–15 days if applied early; severe cases need 2 sprays.",
    image: img(`${crop.name} ${d.name}`),
  }));
}

export function getCropExtras(crop: Crop): CropExtras {
  const cat = categoryOf(crop);
  return {
    stages: stagesFor(crop),
    weeds: GENERIC_WEEDS[cat] ?? GENERIC_WEEDS.default,
    pests: GENERIC_PESTS[cat] ?? GENERIC_PESTS.default,
    diseases: diseasesFrom(crop),
  };
}
