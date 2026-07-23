// Fertilizer Knowledge Center — image-first, richly typed encyclopedia.
// Every fertilizer has multiple deterministic Unsplash image queries so
// the UI can render galleries, comparisons, application-method visuals
// and deficiency imagery without server-side generation.

export type FertilizerCategory =
  | "Nitrogen"
  | "Phosphatic"
  | "Potassic"
  | "Complex NPK"
  | "Micronutrient"
  | "Secondary"
  | "Organic"
  | "Bio-fertilizer"
  | "Liquid / Water-soluble"
  | "Slow-release"
  | "Soil amendment";

export type Form = "Granule" | "Prill" | "Powder" | "Crystal" | "Liquid" | "Gel" | "Briquette";

export type Fertilizer = {
  slug: string;
  name: string;
  brand?: string;
  generic: string;
  category: FertilizerCategory;
  form: Form;
  formula: string;
  npk: { n: number; p: number; k: number };
  secondary?: Partial<Record<"S" | "Ca" | "Mg", number>>;
  micro?: Partial<Record<"Zn" | "Fe" | "B" | "Cu" | "Mn" | "Mo", number>>;
  color: string;
  price: { unit: string; inr: number }; // ₹ per unit
  subsidy?: string;
  shelfLifeMonths: number;
  storage: string;
  suitableCrops: string[];
  unsuitableCrops?: string[];
  suitableSoils: string[];
  applicationMethods: ApplicationMethod[];
  dosagePerAcreKg: { min: number; max: number };
  stage: string;
  benefits: string[];
  cautions: string[];
  mixing: string;
  manufacturers: string[];
  govApproved: boolean;
  images: {
    hero: string;
    packaging: string[];
    granules: string;
    application: string[];
    label: string;
    cropApplication: { crop: string; url: string }[];
    beforeAfter: { before: string; after: string };
    soil: string;
    root: string;
    deficiency: string;
    storage: string;
    safety: string;
    gallery: string[];
  };
};

export type ApplicationMethod =
  | "Broadcasting"
  | "Band placement"
  | "Side dressing"
  | "Drip fertigation"
  | "Sprinkler"
  | "Foliar spray"
  | "Seed treatment"
  | "Root drench"
  | "Drone spray"
  | "Basal";

// Deterministic content-based imagery.
// Primary source: LoremFlickr (Flickr photos matched to comma-separated tags,
// stable per `lock` seed). Fallback: Picsum with a stable seed so a broken
// tag combo still renders a picture instead of a grey box.
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619;
  return Math.abs(h | 0);
};
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s,]/g, "").trim().replace(/\s+/g, ",");
const img = (q: string, w = 1200, h = 800) => {
  const tags = slug(q);
  const lock = hash(`${tags}-${w}x${h}`);
  return `https://loremflickr.com/${w}/${h}/${tags}/all?lock=${lock}`;
};

const mk = (
  slugId: string,
  name: string,
  data: Omit<Fertilizer, "slug" | "name" | "images"> & { imageKeywords?: string[] },
): Fertilizer => {
  const kw = data.imageKeywords ?? [name.toLowerCase(), "fertilizer"];
  const key = kw[0];
  const soil = data.suitableSoils[0]?.toLowerCase() ?? "loam";
  const crop0 = data.suitableCrops[0]?.toLowerCase() ?? "crop";
  return {
    slug: slugId,
    name,
    ...data,
    images: {
      hero: img(`${key},fertilizer,bag,agriculture`),
      packaging: [
        img(`${key},fertilizer,bag,package`),
        img(`${key},sack,warehouse,farm`),
        img(`${key},fertilizer,retail,shop`),
        img(`${key},bulk,bag,storage`),
      ],
      granules: img(`${key},${data.form.toLowerCase()},macro,closeup`),
      application: [
        img(`${key},field,application,farmer`),
        img(`tractor,fertilizer,spreader,field`),
        img(`fertilizer,broadcasting,farm,worker`),
        img(`drip,irrigation,fertigation,${crop0}`),
        img(`foliar,spray,${crop0},farm`),
      ],
      label: img(`fertilizer,label,${key},bag,package`),
      cropApplication: data.suitableCrops.slice(0, 6).map((c) => ({
        crop: c,
        url: img(`${c.toLowerCase()},crop,field,healthy,${key}`),
      })),
      beforeAfter: {
        before: img(`${crop0},yellow,leaves,deficiency,unhealthy`),
        after: img(`${crop0},green,healthy,field,harvest`),
      },
      soil: img(`${soil},soil,texture,farm,agriculture`),
      root: img(`plant,root,system,soil,healthy`),
      deficiency: img(`${key},nutrient,deficiency,leaf,plant`),
      storage: img(`fertilizer,warehouse,storage,bags,shed`),
      safety: img(`farmer,safety,gloves,mask,fertilizer`),
      gallery: [
        img(`${key},farm,india,agriculture`),
        img(`${key},agriculture,closeup,detail`),
        img(`${key},${data.category.toLowerCase()},farming`),
        img(`fertilizer,drone,spray,precision,agriculture`),
        img(`hand,holding,fertilizer,granules,soil`),
        img(`${crop0},harvest,yield,${key}`),
        img(`${soil},field,plowed,${crop0}`),
        img(`agriculture,laboratory,soil,test,${key}`),
      ],
    },
  };
};

// ── Nitrogenous ────────────────────────────────────────────────
export const FERTILIZERS: Fertilizer[] = [
  mk("urea", "Urea", {
    generic: "Urea 46-0-0", brand: "IFFCO Urea", category: "Nitrogen", form: "Prill",
    formula: "CO(NH₂)₂", npk: { n: 46, p: 0, k: 0 }, color: "White",
    price: { unit: "45 kg bag", inr: 266 }, subsidy: "Neem-coated, subsidized",
    shelfLifeMonths: 24, storage: "Cool, dry, sealed away from moisture",
    suitableCrops: ["Rice", "Wheat", "Maize", "Sugarcane", "Cotton"],
    suitableSoils: ["Loamy", "Alluvial", "Black"],
    applicationMethods: ["Broadcasting", "Side dressing", "Drip fertigation", "Foliar spray"],
    dosagePerAcreKg: { min: 40, max: 120 }, stage: "Tillering / vegetative",
    benefits: ["Highest N% in solid form", "Rapid greening", "Water-soluble"],
    cautions: ["Losses via volatilization if surface-applied", "Do not mix with alkaline fertilizers"],
    mixing: "Never mix with DAP or SSP >24h before use.",
    manufacturers: ["IFFCO", "KRIBHCO", "NFL", "RCF"], govApproved: true,
    imageKeywords: ["urea"],
  }),
  mk("ammonium-sulphate", "Ammonium Sulphate", {
    generic: "AS 21-0-0-24S", category: "Nitrogen", form: "Crystal",
    formula: "(NH₄)₂SO₄", npk: { n: 21, p: 0, k: 0 }, secondary: { S: 24 }, color: "Off-white",
    price: { unit: "50 kg bag", inr: 950 }, shelfLifeMonths: 36,
    storage: "Dry ventilated shed", suitableCrops: ["Tea", "Coffee", "Potato", "Onion", "Chilli"],
    suitableSoils: ["Alkaline", "Calcareous"], applicationMethods: ["Broadcasting", "Basal", "Side dressing"],
    dosagePerAcreKg: { min: 40, max: 100 }, stage: "Basal + top-dress",
    benefits: ["Supplies N + Sulphur", "Acidifying — good for alkaline soils"],
    cautions: ["Not for acidic soils"], mixing: "Compatible with SSP.",
    manufacturers: ["GSFC", "FACT", "Coromandel"], govApproved: true,
    imageKeywords: ["ammonium sulphate crystal"],
  }),
  mk("can", "Calcium Ammonium Nitrate (CAN)", {
    generic: "CAN 25-0-0", category: "Nitrogen", form: "Granule",
    formula: "5Ca(NO₃)₂·NH₄NO₃·10H₂O", npk: { n: 25, p: 0, k: 0 }, secondary: { Ca: 8 },
    color: "Light grey", price: { unit: "50 kg bag", inr: 1150 }, shelfLifeMonths: 24,
    storage: "Away from combustibles", suitableCrops: ["Vegetables", "Fruits", "Grapes"],
    suitableSoils: ["Acidic", "Neutral"], applicationMethods: ["Broadcasting", "Drip fertigation", "Basal"],
    dosagePerAcreKg: { min: 30, max: 80 }, stage: "Vegetative to flowering",
    benefits: ["Instant N availability", "Calcium co-supply prevents blossom-end rot"],
    cautions: ["Oxidizer — segregate from fuels"], mixing: "Do not mix with SSP.",
    manufacturers: ["Deepak Fertilizers", "YARA"], govApproved: true,
    imageKeywords: ["calcium nitrate granule"],
  }),

  // ── Phosphatic ────────────────────────────────────────────────
  mk("dap", "DAP", {
    generic: "Di-Ammonium Phosphate 18-46-0", brand: "IFFCO DAP", category: "Phosphatic", form: "Granule",
    formula: "(NH₄)₂HPO₄", npk: { n: 18, p: 46, k: 0 }, color: "Dark brown",
    price: { unit: "50 kg bag", inr: 1350 }, subsidy: "NBS-subsidised",
    shelfLifeMonths: 24, storage: "Dry, sealed, off the floor",
    suitableCrops: ["Rice", "Wheat", "Pulses", "Oilseeds", "Cotton"],
    suitableSoils: ["Neutral", "Alkaline"], applicationMethods: ["Basal", "Band placement", "Broadcasting"],
    dosagePerAcreKg: { min: 40, max: 60 }, stage: "Basal at sowing",
    benefits: ["High P + starter N", "Strong root establishment"],
    cautions: ["Do not surface-broadcast on flooded fields"],
    mixing: "Do not mix with urea for storage >24h.",
    manufacturers: ["IFFCO", "Coromandel", "PPL", "RCF"], govApproved: true,
    imageKeywords: ["DAP granule"],
  }),
  mk("ssp", "Single Super Phosphate", {
    generic: "SSP 0-16-0-11S", category: "Phosphatic", form: "Granule",
    formula: "Ca(H₂PO₄)₂·CaSO₄", npk: { n: 0, p: 16, k: 0 }, secondary: { S: 11, Ca: 20 },
    color: "Grey-brown", price: { unit: "50 kg bag", inr: 425 }, subsidy: "Yes (NBS)",
    shelfLifeMonths: 18, storage: "Dry", suitableCrops: ["Pulses", "Oilseeds", "Groundnut", "Potato"],
    suitableSoils: ["All except strongly alkaline"], applicationMethods: ["Basal", "Broadcasting"],
    dosagePerAcreKg: { min: 80, max: 150 }, stage: "Basal",
    benefits: ["Cheapest P source", "Supplies Sulphur + Calcium"],
    cautions: ["Bulky — high transport cost"], mixing: "OK with FYM.",
    manufacturers: ["Rama Phosphates", "Coromandel", "Liberty"], govApproved: true,
    imageKeywords: ["superphosphate granule"],
  }),
  mk("rock-phosphate", "Rock Phosphate", {
    generic: "RP 0-20-0", category: "Phosphatic", form: "Powder",
    formula: "Ca₃(PO₄)₂", npk: { n: 0, p: 20, k: 0 }, color: "Grey",
    price: { unit: "50 kg bag", inr: 400 }, shelfLifeMonths: 60,
    storage: "Bulk shed", suitableCrops: ["Legumes", "Tea", "Coffee"],
    suitableSoils: ["Acidic"], applicationMethods: ["Broadcasting", "Basal"],
    dosagePerAcreKg: { min: 100, max: 200 }, stage: "Pre-sowing",
    benefits: ["Slow-release P for acidic soils", "Long residual effect"],
    cautions: ["Ineffective on alkaline soils"], mixing: "Blend with FYM for solubilisation.",
    manufacturers: ["RSMML", "Jhamarkotra"], govApproved: true,
    imageKeywords: ["rock phosphate mine"],
  }),

  // ── Potassic ────────────────────────────────────────────────
  mk("mop", "Muriate of Potash", {
    generic: "MOP 0-0-60", category: "Potassic", form: "Crystal",
    formula: "KCl", npk: { n: 0, p: 0, k: 60 }, color: "Pink-red",
    price: { unit: "50 kg bag", inr: 1700 }, subsidy: "NBS-subsidised",
    shelfLifeMonths: 36, storage: "Sealed, moisture-free",
    suitableCrops: ["Banana", "Sugarcane", "Cotton", "Potato", "Coconut"],
    unsuitableCrops: ["Tobacco (Cl-sensitive)"],
    suitableSoils: ["Loamy", "Alluvial"], applicationMethods: ["Basal", "Broadcasting", "Drip fertigation"],
    dosagePerAcreKg: { min: 25, max: 60 }, stage: "Basal + tuberisation / boll",
    benefits: ["Cheapest K source", "Enhances drought tolerance & sugar content"],
    cautions: ["Chloride harmful to tobacco, some fruit"], mixing: "Compatible with most fertilizers.",
    manufacturers: ["IPL", "Canpotex (imports)"], govApproved: true,
    imageKeywords: ["potassium chloride"],
  }),
  mk("sop", "Sulphate of Potash", {
    generic: "SOP 0-0-50-18S", category: "Potassic", form: "Crystal",
    formula: "K₂SO₄", npk: { n: 0, p: 0, k: 50 }, secondary: { S: 18 },
    color: "White", price: { unit: "50 kg bag", inr: 3400 }, shelfLifeMonths: 36,
    storage: "Dry", suitableCrops: ["Tobacco", "Grapes", "Tomato", "Chilli", "Citrus"],
    suitableSoils: ["Saline", "Alkaline"], applicationMethods: ["Drip fertigation", "Foliar spray", "Basal"],
    dosagePerAcreKg: { min: 20, max: 50 }, stage: "Flowering & fruit set",
    benefits: ["Chloride-free K", "Improves fruit quality & shelf life"],
    cautions: ["Costlier than MOP"], mixing: "Fully water-soluble grade available.",
    manufacturers: ["Coromandel", "Haifa", "SQM"], govApproved: true,
    imageKeywords: ["potassium sulphate"],
  }),

  // ── Complex NPK ────────────────────────────────────────────────
  mk("npk-10-26-26", "NPK 10-26-26", {
    generic: "Complex", brand: "Coromandel Gromor", category: "Complex NPK", form: "Granule",
    formula: "Blend", npk: { n: 10, p: 26, k: 26 }, color: "Grey-brown",
    price: { unit: "50 kg bag", inr: 1470 }, subsidy: "NBS", shelfLifeMonths: 24,
    storage: "Dry", suitableCrops: ["Cotton", "Chilli", "Sugarcane", "Groundnut", "Pulses"],
    suitableSoils: ["All"], applicationMethods: ["Basal", "Band placement"],
    dosagePerAcreKg: { min: 50, max: 100 }, stage: "Basal at sowing",
    benefits: ["Balanced P + K starter", "Boosts flowering & yield"],
    cautions: [], mixing: "Do not mix with urea for storage.",
    manufacturers: ["Coromandel", "IFFCO", "GSFC"], govApproved: true,
    imageKeywords: ["NPK complex granule"],
  }),
  mk("npk-12-32-16", "NPK 12-32-16", {
    generic: "Complex", category: "Complex NPK", form: "Granule",
    formula: "Blend", npk: { n: 12, p: 32, k: 16 }, color: "Brown",
    price: { unit: "50 kg bag", inr: 1490 }, subsidy: "NBS", shelfLifeMonths: 24,
    storage: "Dry", suitableCrops: ["Paddy", "Wheat", "Maize", "Vegetables"],
    suitableSoils: ["All"], applicationMethods: ["Basal", "Broadcasting"],
    dosagePerAcreKg: { min: 50, max: 100 }, stage: "Basal",
    benefits: ["High-P starter blend", "Widely available"],
    cautions: [], mixing: "-", manufacturers: ["IFFCO", "GSFC"], govApproved: true,
    imageKeywords: ["NPK 12-32-16"],
  }),
  mk("npk-20-20-0-13", "NPK 20-20-0-13S", {
    generic: "Complex", category: "Complex NPK", form: "Granule",
    formula: "Blend", npk: { n: 20, p: 20, k: 0 }, secondary: { S: 13 }, color: "Grey",
    price: { unit: "50 kg bag", inr: 1230 }, subsidy: "NBS", shelfLifeMonths: 24,
    storage: "Dry", suitableCrops: ["Oilseeds", "Pulses", "Cotton"],
    suitableSoils: ["Sulphur-deficient"], applicationMethods: ["Basal"],
    dosagePerAcreKg: { min: 60, max: 100 }, stage: "Basal",
    benefits: ["N-P-S ideal for oilseeds"], cautions: [], mixing: "-",
    manufacturers: ["GSFC", "FACT"], govApproved: true,
    imageKeywords: ["20-20 fertilizer"],
  }),

  // ── Micronutrients ────────────────────────────────────────────────
  mk("zinc-sulphate", "Zinc Sulphate", {
    generic: "ZnSO₄·7H₂O 21% Zn", category: "Micronutrient", form: "Crystal",
    formula: "ZnSO₄·7H₂O", npk: { n: 0, p: 0, k: 0 }, micro: { Zn: 21 }, color: "White",
    price: { unit: "25 kg bag", inr: 1600 }, shelfLifeMonths: 36, storage: "Sealed",
    suitableCrops: ["Rice", "Wheat", "Maize", "Citrus"], suitableSoils: ["Alkaline", "Sandy"],
    applicationMethods: ["Basal", "Foliar spray", "Drip fertigation"],
    dosagePerAcreKg: { min: 8, max: 10 }, stage: "Basal + 30 DAS spray",
    benefits: ["Corrects khaira / white-bud", "Boosts grain filling"],
    cautions: ["Do not mix with phosphates"], mixing: "Foliar 0.5% + urea 1%.",
    manufacturers: ["Aries Agro", "IFFCO"], govApproved: true, imageKeywords: ["zinc sulphate crystal"],
  }),
  mk("ferrous-sulphate", "Ferrous Sulphate", {
    generic: "FeSO₄·7H₂O 19% Fe", category: "Micronutrient", form: "Crystal",
    formula: "FeSO₄·7H₂O", npk: { n: 0, p: 0, k: 0 }, micro: { Fe: 19 }, color: "Blue-green",
    price: { unit: "25 kg bag", inr: 750 }, shelfLifeMonths: 24, storage: "Airtight",
    suitableCrops: ["Groundnut", "Citrus", "Grapes", "Rice"], suitableSoils: ["Calcareous", "Alkaline"],
    applicationMethods: ["Foliar spray", "Drip fertigation"],
    dosagePerAcreKg: { min: 4, max: 8 }, stage: "On chlorosis symptoms",
    benefits: ["Restores green colour", "Corrects lime-induced chlorosis"],
    cautions: ["Oxidises rapidly in soil"], mixing: "Foliar 0.5% + citric acid 0.1%.",
    manufacturers: ["Aries Agro", "Coromandel"], govApproved: true, imageKeywords: ["ferrous sulphate"],
  }),
  mk("borax", "Borax", {
    generic: "Na₂B₄O₇·10H₂O 11% B", category: "Micronutrient", form: "Powder",
    formula: "Na₂B₄O₇·10H₂O", npk: { n: 0, p: 0, k: 0 }, micro: { B: 11 }, color: "White",
    price: { unit: "25 kg bag", inr: 2400 }, shelfLifeMonths: 60, storage: "Dry",
    suitableCrops: ["Cauliflower", "Groundnut", "Mango", "Cotton"], suitableSoils: ["Sandy", "Leached"],
    applicationMethods: ["Basal", "Foliar spray"],
    dosagePerAcreKg: { min: 4, max: 6 }, stage: "Basal + pre-flowering",
    benefits: ["Prevents browning, hollow stem", "Improves seed set"],
    cautions: ["Toxic beyond 10 kg/acre"], mixing: "Foliar 0.2%.",
    manufacturers: ["Borax India", "Aries Agro"], govApproved: true, imageKeywords: ["borax powder"],
  }),
  mk("copper-sulphate", "Copper Sulphate", {
    generic: "CuSO₄·5H₂O 24% Cu", category: "Micronutrient", form: "Crystal",
    formula: "CuSO₄·5H₂O", npk: { n: 0, p: 0, k: 0 }, micro: { Cu: 24 }, color: "Blue",
    price: { unit: "25 kg bag", inr: 3800 }, shelfLifeMonths: 60, storage: "Sealed",
    suitableCrops: ["Cereals", "Vegetables", "Fruits"], suitableSoils: ["Peaty", "Sandy"],
    applicationMethods: ["Foliar spray", "Seed treatment"],
    dosagePerAcreKg: { min: 2, max: 4 }, stage: "Vegetative",
    benefits: ["Enzyme activator", "Also acts as fungicide component"],
    cautions: ["Phytotoxic above 0.3%"], mixing: "Bordeaux mixture 1%.",
    manufacturers: ["Sulphur Mills", "Aries"], govApproved: true, imageKeywords: ["copper sulphate crystal"],
  }),
  mk("manganese-sulphate", "Manganese Sulphate", {
    generic: "MnSO₄ 30.5% Mn", category: "Micronutrient", form: "Crystal",
    formula: "MnSO₄·H₂O", npk: { n: 0, p: 0, k: 0 }, micro: { Mn: 30 }, color: "Pale pink",
    price: { unit: "25 kg bag", inr: 2100 }, shelfLifeMonths: 36, storage: "Dry",
    suitableCrops: ["Sugarbeet", "Wheat", "Soybean"], suitableSoils: ["High pH"],
    applicationMethods: ["Foliar spray", "Basal"],
    dosagePerAcreKg: { min: 4, max: 8 }, stage: "Tillering",
    benefits: ["Corrects grey-speck", "Photosynthesis co-factor"],
    cautions: [], mixing: "Foliar 0.5%.",
    manufacturers: ["Aries Agro"], govApproved: true, imageKeywords: ["manganese sulphate"],
  }),
  mk("sodium-molybdate", "Sodium Molybdate", {
    generic: "Na₂MoO₄ 39% Mo", category: "Micronutrient", form: "Crystal",
    formula: "Na₂MoO₄·2H₂O", npk: { n: 0, p: 0, k: 0 }, micro: { Mo: 39 }, color: "White",
    price: { unit: "1 kg", inr: 2200 }, shelfLifeMonths: 60, storage: "Sealed",
    suitableCrops: ["Legumes", "Cauliflower", "Citrus"], suitableSoils: ["Acidic"],
    applicationMethods: ["Seed treatment", "Foliar spray"],
    dosagePerAcreKg: { min: 0.1, max: 0.3 }, stage: "Seed / pre-flowering",
    benefits: ["Nitrogen fixation cofactor", "Prevents whip-tail in cauliflower"],
    cautions: ["Very small doses required"], mixing: "Seed dressing 1 g/kg.",
    manufacturers: ["Aries Agro"], govApproved: true, imageKeywords: ["sodium molybdate"],
  }),

  // ── Secondary ────────────────────────────────────────────────
  mk("gypsum", "Gypsum", {
    generic: "CaSO₄·2H₂O", category: "Secondary", form: "Powder",
    formula: "CaSO₄·2H₂O", npk: { n: 0, p: 0, k: 0 }, secondary: { Ca: 22, S: 17 }, color: "White",
    price: { unit: "50 kg bag", inr: 320 }, shelfLifeMonths: 60, storage: "Dry",
    suitableCrops: ["Groundnut", "Oilseeds", "Onion"], suitableSoils: ["Sodic", "Saline"],
    applicationMethods: ["Broadcasting", "Basal"],
    dosagePerAcreKg: { min: 100, max: 250 }, stage: "Pre-sowing / pegging",
    benefits: ["Reclaims sodic soil", "Boosts pod filling in groundnut"],
    cautions: [], mixing: "-", manufacturers: ["FCI", "Rama"], govApproved: true,
    imageKeywords: ["gypsum powder"],
  }),
  mk("magnesium-sulphate", "Magnesium Sulphate", {
    generic: "MgSO₄·7H₂O", category: "Secondary", form: "Crystal",
    formula: "MgSO₄·7H₂O", npk: { n: 0, p: 0, k: 0 }, secondary: { Mg: 9.8, S: 13 }, color: "White",
    price: { unit: "50 kg bag", inr: 1600 }, shelfLifeMonths: 36, storage: "Sealed",
    suitableCrops: ["Coconut", "Potato", "Tomato", "Chilli"], suitableSoils: ["Sandy", "Acidic"],
    applicationMethods: ["Foliar spray", "Drip fertigation", "Basal"],
    dosagePerAcreKg: { min: 20, max: 40 }, stage: "Vegetative to flowering",
    benefits: ["Corrects interveinal chlorosis", "Chlorophyll cofactor"],
    cautions: [], mixing: "Foliar 1%.", manufacturers: ["Aries", "SQM"], govApproved: true,
    imageKeywords: ["epsom salt crystal"],
  }),
  mk("bentonite-sulphur", "Bentonite Sulphur", {
    generic: "90% S", category: "Secondary", form: "Granule",
    formula: "S + Bentonite", npk: { n: 0, p: 0, k: 0 }, secondary: { S: 90 }, color: "Yellow",
    price: { unit: "25 kg bag", inr: 1200 }, shelfLifeMonths: 36, storage: "Dry",
    suitableCrops: ["Oilseeds", "Pulses", "Onion"], suitableSoils: ["S-deficient"],
    applicationMethods: ["Basal", "Broadcasting"],
    dosagePerAcreKg: { min: 8, max: 12 }, stage: "Basal",
    benefits: ["Concentrated S", "Slow-release, low volatilisation"],
    cautions: [], mixing: "-", manufacturers: ["Coromandel", "Deepak"], govApproved: true,
    imageKeywords: ["bentonite sulphur granule"],
  }),

  // ── Water-soluble / Liquid ────────────────────────────────────────────────
  mk("wsf-19-19-19", "WSF 19-19-19", {
    generic: "Water-soluble NPK", category: "Liquid / Water-soluble", form: "Crystal",
    formula: "Blend", npk: { n: 19, p: 19, k: 19 }, color: "White",
    price: { unit: "25 kg bag", inr: 4200 }, shelfLifeMonths: 24, storage: "Sealed",
    suitableCrops: ["Vegetables", "Fruits", "Horticulture"], suitableSoils: ["All"],
    applicationMethods: ["Drip fertigation", "Foliar spray"],
    dosagePerAcreKg: { min: 2, max: 5 }, stage: "Vegetative",
    benefits: ["Balanced, 100% soluble", "Ideal for fertigation"],
    cautions: [], mixing: "0.5-1% foliar.", manufacturers: ["Yara", "SQM", "Coromandel"], govApproved: true,
    imageKeywords: ["water soluble fertilizer"],
  }),
  mk("wsf-13-0-45", "WSF 13-0-45", {
    generic: "Potassium Nitrate", category: "Liquid / Water-soluble", form: "Crystal",
    formula: "KNO₃", npk: { n: 13, p: 0, k: 45 }, color: "White",
    price: { unit: "25 kg bag", inr: 3800 }, shelfLifeMonths: 36, storage: "Sealed",
    suitableCrops: ["Grapes", "Tomato", "Capsicum", "Banana"], suitableSoils: ["All"],
    applicationMethods: ["Drip fertigation", "Foliar spray"],
    dosagePerAcreKg: { min: 2, max: 5 }, stage: "Fruit development",
    benefits: ["K + nitrate N for quality", "Boosts sugar & colour"],
    cautions: ["Oxidizer"], mixing: "Compatible with most WSF.",
    manufacturers: ["Haifa", "SQM"], govApproved: true, imageKeywords: ["potassium nitrate"],
  }),
  mk("wsf-0-52-34", "WSF 0-52-34", {
    generic: "Mono-Potassium Phosphate (MKP)", category: "Liquid / Water-soluble", form: "Crystal",
    formula: "KH₂PO₄", npk: { n: 0, p: 52, k: 34 }, color: "White",
    price: { unit: "25 kg bag", inr: 5600 }, shelfLifeMonths: 36, storage: "Sealed",
    suitableCrops: ["Grapes", "Pomegranate", "Vegetables"], suitableSoils: ["All"],
    applicationMethods: ["Foliar spray", "Drip fertigation"],
    dosagePerAcreKg: { min: 1, max: 3 }, stage: "Flowering & fruit set",
    benefits: ["High P + K, chloride-free", "Improves flowering"],
    cautions: [], mixing: "0.5-1% foliar.",
    manufacturers: ["Haifa", "Coromandel"], govApproved: true, imageKeywords: ["MKP fertilizer"],
  }),
  mk("wsf-12-61-0", "WSF 12-61-0", {
    generic: "Mono-Ammonium Phosphate (MAP)", category: "Liquid / Water-soluble", form: "Crystal",
    formula: "NH₄H₂PO₄", npk: { n: 12, p: 61, k: 0 }, color: "White",
    price: { unit: "25 kg bag", inr: 4600 }, shelfLifeMonths: 36, storage: "Sealed",
    suitableCrops: ["Vegetables", "Cereals nursery"], suitableSoils: ["All"],
    applicationMethods: ["Drip fertigation", "Foliar spray"],
    dosagePerAcreKg: { min: 2, max: 4 }, stage: "Early growth",
    benefits: ["Highest P WSF", "Root booster"], cautions: [], mixing: "-",
    manufacturers: ["Haifa"], govApproved: true, imageKeywords: ["MAP fertilizer crystal"],
  }),
  mk("calcium-nitrate-liq", "Calcium Nitrate Liquid", {
    generic: "Ca(NO₃)₂ 8% Ca 15.5% N", category: "Liquid / Water-soluble", form: "Liquid",
    formula: "Ca(NO₃)₂", npk: { n: 15, p: 0, k: 0 }, secondary: { Ca: 19 }, color: "Clear",
    price: { unit: "1 L", inr: 180 }, shelfLifeMonths: 24, storage: "Cool",
    suitableCrops: ["Tomato", "Capsicum", "Apple", "Grape"], suitableSoils: ["Acidic", "Sandy"],
    applicationMethods: ["Drip fertigation", "Foliar spray"],
    dosagePerAcreKg: { min: 2, max: 4 }, stage: "Fruiting",
    benefits: ["Prevents blossom-end rot", "Improves firmness & shelf life"],
    cautions: [], mixing: "Do not mix with sulphates or phosphates.",
    manufacturers: ["Yara", "Haifa"], govApproved: true, imageKeywords: ["calcium nitrate liquid"],
  }),

  // ── Organic ────────────────────────────────────────────────
  mk("vermicompost", "Vermicompost", {
    generic: "Earthworm compost", category: "Organic", form: "Granule",
    formula: "Organic", npk: { n: 1.5, p: 1.0, k: 1.5 }, color: "Dark brown",
    price: { unit: "50 kg bag", inr: 450 }, shelfLifeMonths: 12, storage: "Shaded, moist",
    suitableCrops: ["All"], suitableSoils: ["All"],
    applicationMethods: ["Basal", "Broadcasting"],
    dosagePerAcreKg: { min: 800, max: 2000 }, stage: "Pre-sowing",
    benefits: ["Improves soil structure", "Rich in microbes & humic acid"],
    cautions: [], mixing: "Blend with rock phosphate.",
    manufacturers: ["Local units", "Krishi Vigyan Kendra"], govApproved: true,
    imageKeywords: ["vermicompost"],
  }),
  mk("fym", "Farm Yard Manure", {
    generic: "Cattle manure", category: "Organic", form: "Powder",
    formula: "Organic", npk: { n: 0.5, p: 0.2, k: 0.5 }, color: "Dark brown",
    price: { unit: "1 tonne", inr: 1200 }, shelfLifeMonths: 24, storage: "Composting yard",
    suitableCrops: ["All"], suitableSoils: ["All"],
    applicationMethods: ["Broadcasting", "Basal"],
    dosagePerAcreKg: { min: 4000, max: 10000 }, stage: "Pre-sowing 3-4 weeks",
    benefits: ["Long-term fertility", "Boosts microbial activity"],
    cautions: ["Well-decomposed only"], mixing: "-",
    manufacturers: ["Farm-produced"], govApproved: true, imageKeywords: ["farm yard manure"],
  }),
  mk("neem-cake", "Neem Cake", {
    generic: "Azadirachta indica cake", category: "Organic", form: "Powder",
    formula: "Organic", npk: { n: 5, p: 1, k: 2 }, color: "Brown",
    price: { unit: "50 kg bag", inr: 750 }, shelfLifeMonths: 12, storage: "Dry",
    suitableCrops: ["Sugarcane", "Cotton", "Vegetables"], suitableSoils: ["All"],
    applicationMethods: ["Basal", "Broadcasting"],
    dosagePerAcreKg: { min: 100, max: 200 }, stage: "Basal",
    benefits: ["Nematicidal", "Nitrification inhibitor — slows urea loss"],
    cautions: [], mixing: "Blend with urea.",
    manufacturers: ["Neem India Products"], govApproved: true, imageKeywords: ["neem cake"],
  }),
  mk("castor-cake", "Castor Cake", {
    generic: "Castor oil cake", category: "Organic", form: "Powder",
    formula: "Organic", npk: { n: 4.3, p: 1.8, k: 1.3 }, color: "Grey-green",
    price: { unit: "50 kg bag", inr: 650 }, shelfLifeMonths: 12, storage: "Dry",
    suitableCrops: ["Vegetables", "Fruits", "Ornamentals"], suitableSoils: ["All"],
    applicationMethods: ["Basal"],
    dosagePerAcreKg: { min: 100, max: 200 }, stage: "Basal",
    benefits: ["Slow-release N", "Improves soil texture"],
    cautions: ["Ricin toxic if ingested"], mixing: "-",
    manufacturers: ["Local mills"], govApproved: true, imageKeywords: ["castor cake"],
  }),
  mk("poultry-manure", "Poultry Manure", {
    generic: "Composted chicken litter", category: "Organic", form: "Powder",
    formula: "Organic", npk: { n: 3, p: 2.5, k: 1.8 }, color: "Dark brown",
    price: { unit: "1 tonne", inr: 2500 }, shelfLifeMonths: 12, storage: "Composting shed",
    suitableCrops: ["Vegetables", "Maize", "Fruits"], suitableSoils: ["All"],
    applicationMethods: ["Broadcasting", "Basal"],
    dosagePerAcreKg: { min: 1000, max: 2500 }, stage: "Pre-sowing",
    benefits: ["Rapid nutrient release", "High P content"],
    cautions: ["Salmonella risk if raw"], mixing: "Compost 30 days before use.",
    manufacturers: ["Poultry farms"], govApproved: true, imageKeywords: ["poultry manure compost"],
  }),
  mk("green-manure-sunhemp", "Green Manure — Sunhemp", {
    generic: "Crotalaria juncea", category: "Organic", form: "Powder",
    formula: "Live biomass", npk: { n: 2.5, p: 0.5, k: 2 }, color: "Green",
    price: { unit: "1 kg seed", inr: 80 }, shelfLifeMonths: 6, storage: "Dry seed",
    suitableCrops: ["Rice", "Sugarcane", "Cotton"], suitableSoils: ["All except waterlogged"],
    applicationMethods: ["Broadcasting"],
    dosagePerAcreKg: { min: 15, max: 20 }, stage: "40-50 days before main crop",
    benefits: ["Adds 60-80 kg N/acre", "Improves organic carbon"],
    cautions: [], mixing: "-",
    manufacturers: ["Seed suppliers"], govApproved: true, imageKeywords: ["sunhemp field"],
  }),

  // ── Bio-fertilizers ────────────────────────────────────────────────
  mk("rhizobium", "Rhizobium Culture", {
    generic: "N-fixing biofertilizer", category: "Bio-fertilizer", form: "Liquid",
    formula: "Rhizobium spp.", npk: { n: 0, p: 0, k: 0 }, color: "Brown liquid",
    price: { unit: "1 L", inr: 250 }, shelfLifeMonths: 6, storage: "Cool 4-15°C",
    suitableCrops: ["Pulses", "Groundnut", "Soybean"], suitableSoils: ["All except acidic <5"],
    applicationMethods: ["Seed treatment"],
    dosagePerAcreKg: { min: 0.2, max: 0.5 }, stage: "Seed dressing",
    benefits: ["Fixes 40-60 kg N/acre", "Reduces urea dose by 25%"],
    cautions: ["Do not mix with fungicides"], mixing: "10 mL/kg seed with jaggery slurry.",
    manufacturers: ["IARI", "NBAIM"], govApproved: true, imageKeywords: ["rhizobium bacteria"],
  }),
  mk("azotobacter", "Azotobacter", {
    generic: "Free-living N fixer", category: "Bio-fertilizer", form: "Liquid",
    formula: "Azotobacter chroococcum", npk: { n: 0, p: 0, k: 0 }, color: "Brown",
    price: { unit: "1 L", inr: 220 }, shelfLifeMonths: 6, storage: "Cool",
    suitableCrops: ["Non-legumes", "Cereals", "Vegetables"], suitableSoils: ["Neutral"],
    applicationMethods: ["Seed treatment", "Root drench"],
    dosagePerAcreKg: { min: 0.2, max: 0.5 }, stage: "Seed / seedling",
    benefits: ["Fixes 20 kg N/acre", "Produces growth hormones"],
    cautions: [], mixing: "10 mL/kg seed.",
    manufacturers: ["IIHR", "NBAIM"], govApproved: true, imageKeywords: ["azotobacter"],
  }),
  mk("psb", "Phosphate Solubilising Bacteria", {
    generic: "PSB", category: "Bio-fertilizer", form: "Liquid",
    formula: "Bacillus megaterium", npk: { n: 0, p: 0, k: 0 }, color: "Brown",
    price: { unit: "1 L", inr: 220 }, shelfLifeMonths: 6, storage: "Cool",
    suitableCrops: ["All"], suitableSoils: ["Alkaline", "Calcareous"],
    applicationMethods: ["Seed treatment", "Basal"],
    dosagePerAcreKg: { min: 0.2, max: 1 }, stage: "Seed / basal",
    benefits: ["Solubilises fixed P", "Cuts DAP need by 25%"],
    cautions: [], mixing: "With FYM.",
    manufacturers: ["IARI"], govApproved: true, imageKeywords: ["PSB bacteria fertilizer"],
  }),
  mk("mycorrhiza", "Mycorrhiza (VAM)", {
    generic: "Arbuscular mycorrhizal fungi", category: "Bio-fertilizer", form: "Powder",
    formula: "Glomus spp.", npk: { n: 0, p: 0, k: 0 }, color: "Grey",
    price: { unit: "5 kg", inr: 500 }, shelfLifeMonths: 12, storage: "Dry cool",
    suitableCrops: ["Horticulture", "Fruits", "Vegetables"], suitableSoils: ["All"],
    applicationMethods: ["Seed treatment", "Basal"],
    dosagePerAcreKg: { min: 2, max: 4 }, stage: "Planting",
    benefits: ["Extends root reach 100×", "Boosts P, Zn, water uptake"],
    cautions: ["Avoid fungicides"], mixing: "In planting pit.",
    manufacturers: ["TERI", "KAN Biosys"], govApproved: true, imageKeywords: ["mycorrhiza root"],
  }),
  mk("azospirillum", "Azospirillum", {
    generic: "Associative N fixer", category: "Bio-fertilizer", form: "Liquid",
    formula: "Azospirillum brasilense", npk: { n: 0, p: 0, k: 0 }, color: "Brown",
    price: { unit: "1 L", inr: 230 }, shelfLifeMonths: 6, storage: "Cool",
    suitableCrops: ["Rice", "Sorghum", "Maize", "Sugarcane"], suitableSoils: ["All"],
    applicationMethods: ["Seed treatment", "Root drench"],
    dosagePerAcreKg: { min: 0.2, max: 0.5 }, stage: "Nursery / transplant",
    benefits: ["Fixes N + secretes IAA", "Improves root proliferation"],
    cautions: [], mixing: "Dip roots 30 min.",
    manufacturers: ["TNAU", "IIRR"], govApproved: true, imageKeywords: ["azospirillum"],
  }),
  mk("trichoderma", "Trichoderma viride", {
    generic: "Bio-fungicide + bio-fertilizer", category: "Bio-fertilizer", form: "Powder",
    formula: "Trichoderma viride", npk: { n: 0, p: 0, k: 0 }, color: "Green powder",
    price: { unit: "1 kg", inr: 350 }, shelfLifeMonths: 12, storage: "Cool dry",
    suitableCrops: ["All"], suitableSoils: ["All"],
    applicationMethods: ["Seed treatment", "Basal", "Root drench"],
    dosagePerAcreKg: { min: 1, max: 2 }, stage: "Nursery + soil",
    benefits: ["Controls Fusarium, Pythium", "Enhances root vigour"],
    cautions: ["Do not mix with fungicides"], mixing: "4 g/kg seed.",
    manufacturers: ["NBAIR", "T. Stanes"], govApproved: true, imageKeywords: ["trichoderma green"],
  }),

  // ── Slow-release / Coated ────────────────────────────────────────────────
  mk("neem-coated-urea", "Neem-coated Urea", {
    generic: "Slow-release N 46%", category: "Slow-release", form: "Prill",
    formula: "Urea + neem oil", npk: { n: 46, p: 0, k: 0 }, color: "Yellow-green",
    price: { unit: "45 kg bag", inr: 266 }, subsidy: "Mandatory in India",
    shelfLifeMonths: 12, storage: "Sealed", suitableCrops: ["Rice", "Wheat", "Sugarcane"],
    suitableSoils: ["All"], applicationMethods: ["Broadcasting", "Basal", "Side dressing"],
    dosagePerAcreKg: { min: 40, max: 120 }, stage: "As per urea",
    benefits: ["10-15% higher N use efficiency", "Suppresses nitrification & termites"],
    cautions: [], mixing: "-", manufacturers: ["IFFCO", "NFL"], govApproved: true,
    imageKeywords: ["neem coated urea"],
  }),
  mk("sulphur-coated-urea", "Sulphur-coated Urea", {
    generic: "SCU 37-0-0-14S", category: "Slow-release", form: "Prill",
    formula: "Urea + S coating", npk: { n: 37, p: 0, k: 0 }, secondary: { S: 14 }, color: "Yellow",
    price: { unit: "50 kg bag", inr: 1400 }, shelfLifeMonths: 24, storage: "Sealed",
    suitableCrops: ["Turf", "Sugarcane", "Cotton"], suitableSoils: ["S-deficient"],
    applicationMethods: ["Basal", "Broadcasting"],
    dosagePerAcreKg: { min: 40, max: 100 }, stage: "Single basal",
    benefits: ["Season-long N release", "Fewer applications"],
    cautions: [], mixing: "-", manufacturers: ["NFL"], govApproved: true,
    imageKeywords: ["sulphur coated urea"],
  }),
  mk("polymer-coated-urea", "Polymer-coated Urea", {
    generic: "PCU 44-0-0", category: "Slow-release", form: "Prill",
    formula: "Urea + polymer film", npk: { n: 44, p: 0, k: 0 }, color: "Pale blue",
    price: { unit: "25 kg bag", inr: 2100 }, shelfLifeMonths: 24, storage: "Sealed",
    suitableCrops: ["Horticulture", "Turf"], suitableSoils: ["All"],
    applicationMethods: ["Basal"],
    dosagePerAcreKg: { min: 20, max: 60 }, stage: "Single basal",
    benefits: ["Controlled release 90-180 days", "Reduces leaching"],
    cautions: [], mixing: "-", manufacturers: ["Yara", "ICL"], govApproved: true,
    imageKeywords: ["polymer coated urea"],
  }),
  mk("nano-urea", "Nano Urea Liquid", {
    generic: "IFFCO Nano Urea 4% N", category: "Slow-release", form: "Liquid",
    formula: "Urea nanoparticles", npk: { n: 4, p: 0, k: 0 }, color: "White liquid",
    price: { unit: "500 mL", inr: 240 }, shelfLifeMonths: 24, storage: "Cool",
    suitableCrops: ["All"], suitableSoils: ["All"],
    applicationMethods: ["Foliar spray", "Drone spray"],
    dosagePerAcreKg: { min: 0.5, max: 1 }, stage: "Tillering + panicle",
    benefits: ["Replaces one urea top-dress", "80% absorption efficiency"],
    cautions: ["Do not mix with alkaline pesticides"], mixing: "4 mL/L water.",
    manufacturers: ["IFFCO"], govApproved: true, imageKeywords: ["nano urea bottle"],
  }),
  mk("nano-dap", "Nano DAP Liquid", {
    generic: "IFFCO Nano DAP 8% N 16% P", category: "Slow-release", form: "Liquid",
    formula: "NP nanoparticles", npk: { n: 8, p: 16, k: 0 }, color: "White liquid",
    price: { unit: "500 mL", inr: 600 }, shelfLifeMonths: 24, storage: "Cool",
    suitableCrops: ["All"], suitableSoils: ["All"],
    applicationMethods: ["Seed treatment", "Foliar spray"],
    dosagePerAcreKg: { min: 0.5, max: 1 }, stage: "Seed + early growth",
    benefits: ["Replaces one DAP bag", "Boosts root & tillering"],
    cautions: [], mixing: "5 mL/L water.",
    manufacturers: ["IFFCO"], govApproved: true, imageKeywords: ["nano DAP bottle"],
  }),

  // ── Soil amendments ────────────────────────────────────────────────
  mk("lime", "Agricultural Lime", {
    generic: "CaCO₃", category: "Soil amendment", form: "Powder",
    formula: "CaCO₃", npk: { n: 0, p: 0, k: 0 }, secondary: { Ca: 40 }, color: "White",
    price: { unit: "50 kg bag", inr: 220 }, shelfLifeMonths: 60, storage: "Dry",
    suitableCrops: ["All on acidic soils"], suitableSoils: ["Acidic"],
    applicationMethods: ["Broadcasting"],
    dosagePerAcreKg: { min: 200, max: 800 }, stage: "3 weeks pre-sowing",
    benefits: ["Raises pH", "Adds Ca"], cautions: [], mixing: "-",
    manufacturers: ["Local"], govApproved: true, imageKeywords: ["agricultural lime"],
  }),
  mk("dolomite", "Dolomite", {
    generic: "CaMg(CO₃)₂", category: "Soil amendment", form: "Powder",
    formula: "CaMg(CO₃)₂", npk: { n: 0, p: 0, k: 0 }, secondary: { Ca: 22, Mg: 13 }, color: "White-grey",
    price: { unit: "50 kg bag", inr: 260 }, shelfLifeMonths: 60, storage: "Dry",
    suitableCrops: ["Tea", "Coffee", "Rubber"], suitableSoils: ["Acidic"],
    applicationMethods: ["Broadcasting"],
    dosagePerAcreKg: { min: 200, max: 600 }, stage: "Pre-sowing",
    benefits: ["Corrects pH + Mg deficiency"], cautions: [], mixing: "-",
    manufacturers: ["Local"], govApproved: true, imageKeywords: ["dolomite powder"],
  }),
  mk("humic-acid", "Humic Acid", {
    generic: "Potassium humate 12%", category: "Soil amendment", form: "Powder",
    formula: "Humate", npk: { n: 0, p: 0, k: 8 }, color: "Black",
    price: { unit: "1 kg", inr: 380 }, shelfLifeMonths: 36, storage: "Sealed",
    suitableCrops: ["All"], suitableSoils: ["Degraded", "Sandy"],
    applicationMethods: ["Drip fertigation", "Foliar spray", "Root drench"],
    dosagePerAcreKg: { min: 1, max: 3 }, stage: "Any",
    benefits: ["Boosts CEC", "Chelates micronutrients"], cautions: [], mixing: "Compatible with WSF.",
    manufacturers: ["Aries", "Bhagirathi"], govApproved: true, imageKeywords: ["humic acid granules"],
  }),
  mk("seaweed-extract", "Seaweed Extract", {
    generic: "Ascophyllum nodosum 10%", category: "Organic", form: "Liquid",
    formula: "Kelp extract", npk: { n: 1, p: 0.5, k: 5 }, color: "Dark brown",
    price: { unit: "1 L", inr: 550 }, shelfLifeMonths: 24, storage: "Cool",
    suitableCrops: ["Horticulture", "Vegetables", "Fruits"], suitableSoils: ["All"],
    applicationMethods: ["Foliar spray", "Drip fertigation"],
    dosagePerAcreKg: { min: 0.5, max: 1 }, stage: "Flowering & fruiting",
    benefits: ["Natural cytokinins & auxins", "Boosts stress tolerance"],
    cautions: [], mixing: "3 mL/L foliar.",
    manufacturers: ["PI Industries", "Acadian"], govApproved: true, imageKeywords: ["seaweed extract"],
  }),
];

// ── Nutrient encyclopedia entries (image-first) ────────────────────────────
export type NutrientEntry = {
  key: string;
  name: string;
  role: "Macro" | "Secondary" | "Micro";
  symbol: string;
  color: string;
  function: string;
  deficiencySymptoms: string;
  excess: string;
  sources: string[];
  images: { healthy: string; deficient: string; recovery: string; diagram: string };
};

const nimg = (q: string) => img(`${q}`);

export const NUTRIENTS: NutrientEntry[] = [
  { key: "n", name: "Nitrogen", role: "Macro", symbol: "N", color: "#22c55e",
    function: "Chlorophyll, protein, vegetative growth.",
    deficiencySymptoms: "Uniform yellowing of older leaves, stunted growth.",
    excess: "Excess vegetative growth, delayed flowering, lodging.",
    sources: ["Urea", "CAN", "Ammonium Sulphate", "Nano Urea"],
    images: { healthy: nimg("green healthy crop field"), deficient: nimg("nitrogen deficiency yellow leaf"), recovery: nimg("green rice paddy"), diagram: nimg("nitrogen cycle diagram") } },
  { key: "p", name: "Phosphorus", role: "Macro", symbol: "P", color: "#f97316",
    function: "Root development, energy transfer (ATP), flowering.",
    deficiencySymptoms: "Purple/reddish tint on older leaves, weak roots.",
    excess: "Induces Zn & Fe deficiency.",
    sources: ["DAP", "SSP", "MAP", "MKP"],
    images: { healthy: nimg("strong plant roots"), deficient: nimg("phosphorus deficient purple leaf"), recovery: nimg("healthy plant flowering"), diagram: nimg("phosphorus uptake root") } },
  { key: "k", name: "Potassium", role: "Macro", symbol: "K", color: "#a855f7",
    function: "Water regulation, enzyme activation, disease resistance.",
    deficiencySymptoms: "Leaf-margin scorch on older leaves, weak stems.",
    excess: "Reduced Mg & Ca uptake.",
    sources: ["MOP", "SOP", "Potassium Nitrate"],
    images: { healthy: nimg("healthy corn leaf"), deficient: nimg("potassium deficient leaf edge burn"), recovery: nimg("banana healthy plant"), diagram: nimg("stomata water regulation") } },
  { key: "ca", name: "Calcium", role: "Secondary", symbol: "Ca", color: "#e5e7eb",
    function: "Cell wall structure, membrane integrity.",
    deficiencySymptoms: "Blossom-end rot, tip burn in new leaves.",
    excess: "Locks up P, Mg, K.",
    sources: ["Gypsum", "CAN", "Calcium Nitrate", "Lime"],
    images: { healthy: nimg("tomato fruit healthy"), deficient: nimg("blossom end rot tomato"), recovery: nimg("firm tomato harvest"), diagram: nimg("cell wall structure") } },
  { key: "mg", name: "Magnesium", role: "Secondary", symbol: "Mg", color: "#84cc16",
    function: "Chlorophyll core atom, enzyme activator.",
    deficiencySymptoms: "Interveinal chlorosis on older leaves.",
    excess: "Rare; may induce Ca deficiency.",
    sources: ["Magnesium Sulphate", "Dolomite"],
    images: { healthy: nimg("green vine leaves"), deficient: nimg("magnesium deficiency interveinal chlorosis"), recovery: nimg("grape vineyard"), diagram: nimg("chlorophyll molecule") } },
  { key: "s", name: "Sulphur", role: "Secondary", symbol: "S", color: "#eab308",
    function: "Amino acid & oil synthesis (esp. oilseeds).",
    deficiencySymptoms: "Uniform yellowing of young leaves.",
    excess: "Soil acidification.",
    sources: ["Bentonite Sulphur", "Ammonium Sulphate", "SSP", "Gypsum"],
    images: { healthy: nimg("mustard flower field"), deficient: nimg("sulphur deficient leaf pale"), recovery: nimg("groundnut plant"), diagram: nimg("sulphur amino acid") } },
  { key: "zn", name: "Zinc", role: "Micro", symbol: "Zn", color: "#38bdf8",
    function: "Enzyme cofactor, auxin synthesis.",
    deficiencySymptoms: "Interveinal chlorosis, small leaves, khaira in rice.",
    excess: "Rare.",
    sources: ["Zinc Sulphate"],
    images: { healthy: nimg("healthy rice paddy"), deficient: nimg("zinc deficiency khaira rice"), recovery: nimg("green rice tillering"), diagram: nimg("zinc plant enzyme") } },
  { key: "fe", name: "Iron", role: "Micro", symbol: "Fe", color: "#f43f5e",
    function: "Chlorophyll synthesis, electron transport.",
    deficiencySymptoms: "Interveinal chlorosis on young leaves.",
    excess: "Bronzing in flooded soils.",
    sources: ["Ferrous Sulphate", "Fe-EDTA"],
    images: { healthy: nimg("green citrus leaf"), deficient: nimg("iron chlorosis leaf yellow"), recovery: nimg("citrus grove"), diagram: nimg("iron chlorophyll") } },
  { key: "b", name: "Boron", role: "Micro", symbol: "B", color: "#f472b6",
    function: "Cell division, pollen viability.",
    deficiencySymptoms: "Hollow stem in cauliflower, cracked fruit.",
    excess: "Leaf-tip burn.",
    sources: ["Borax", "Solubor"],
    images: { healthy: nimg("cauliflower healthy"), deficient: nimg("boron deficient hollow stem"), recovery: nimg("cauliflower harvest"), diagram: nimg("boron pollen") } },
  { key: "cu", name: "Copper", role: "Micro", symbol: "Cu", color: "#c2410c",
    function: "Enzyme cofactor, lignin synthesis.",
    deficiencySymptoms: "Wilting young leaves, dieback in citrus.",
    excess: "Root damage.",
    sources: ["Copper Sulphate"],
    images: { healthy: nimg("wheat healthy"), deficient: nimg("copper deficiency wheat"), recovery: nimg("wheat spike"), diagram: nimg("copper enzyme") } },
  { key: "mn", name: "Manganese", role: "Micro", symbol: "Mn", color: "#a3a3a3",
    function: "Photosynthesis, N metabolism.",
    deficiencySymptoms: "Grey-speck in oats, interveinal chlorosis.",
    excess: "Brown spots.",
    sources: ["Manganese Sulphate"],
    images: { healthy: nimg("soybean leaf"), deficient: nimg("manganese deficiency grey speck"), recovery: nimg("soybean field"), diagram: nimg("photosystem manganese") } },
  { key: "mo", name: "Molybdenum", role: "Micro", symbol: "Mo", color: "#94a3b8",
    function: "N-fixation & nitrate reduction cofactor.",
    deficiencySymptoms: "Whip-tail in cauliflower, poor nodulation.",
    excess: "Toxic to livestock via forage.",
    sources: ["Sodium Molybdate"],
    images: { healthy: nimg("legume root nodule"), deficient: nimg("cauliflower whip tail"), recovery: nimg("cauliflower field"), diagram: nimg("nitrogenase enzyme") } },
];

// ── Application methods ────────────────────────────────────────────────
export type MethodEntry = {
  key: ApplicationMethod;
  description: string;
  image: string;
  steps: string[];
  bestFor: string[];
};

export const METHODS: MethodEntry[] = [
  { key: "Broadcasting", description: "Uniform spread of fertilizer over the entire field surface before incorporation.", image: img("farmer broadcasting fertilizer"), steps: ["Weigh dose per plot", "Spread evenly by hand or spinner", "Lightly incorporate into topsoil", "Irrigate to activate"], bestFor: ["N & P basal in cereals"] },
  { key: "Band placement", description: "Fertilizer placed in a narrow band 5 cm beside and below the seed row.", image: img("seed drill fertilizer band"), steps: ["Set drill for 5 cm offset", "Load fertilizer hopper", "Sow & fertilize in one pass", "Cover soil"], bestFor: ["DAP & complex NPK at sowing"] },
  { key: "Side dressing", description: "Fertilizer applied along the row after crop establishment.", image: img("side dressing fertilizer maize"), steps: ["Open shallow furrow 8 cm from plant", "Drop measured dose", "Cover & irrigate"], bestFor: ["Urea top-dress in maize, cotton"] },
  { key: "Drip fertigation", description: "Water-soluble fertilizer injected into drip irrigation lines.", image: img("drip irrigation vegetable farm"), steps: ["Fill fertigation tank with WSF stock", "Inject during last 30 min of irrigation", "Flush lines with plain water"], bestFor: ["Horticulture, high-value crops"] },
  { key: "Sprinkler", description: "Fertilizer dissolved and delivered via sprinkler system.", image: img("sprinkler irrigation field"), steps: ["Dissolve fertilizer", "Inject via venturi", "Run rinse cycle"], bestFor: ["Turf, wheat"] },
  { key: "Foliar spray", description: "Dilute solution sprayed on leaves for rapid nutrient uptake.", image: img("foliar spray crop"), steps: ["Mix at 0.5-1% concentration", "Spray early morning / evening", "Cover both leaf surfaces"], bestFor: ["Micronutrients, quick correction"] },
  { key: "Seed treatment", description: "Coating seeds with biofertilizers or micronutrients before sowing.", image: img("seed treatment coating"), steps: ["Prepare slurry (jaggery + culture)", "Coat seeds uniformly", "Shade-dry 30 min", "Sow same day"], bestFor: ["Rhizobium, PSB, Trichoderma"] },
  { key: "Root drench", description: "Concentrated solution poured at the plant base.", image: img("root drench plant"), steps: ["Prepare 10-20 L solution per 100 plants", "Pour at base", "Follow with light irrigation"], bestFor: ["Transplants, orchards"] },
  { key: "Drone spray", description: "Precision aerial spray of nano and liquid fertilizers.", image: img("agriculture drone spraying"), steps: ["Map field via GPS", "Load nano fertilizer", "Set flight pattern", "Spray 25 L/ha"], bestFor: ["Nano Urea, Nano DAP"] },
  { key: "Basal", description: "Applied at or before sowing / transplanting as base dose.", image: img("basal fertilizer application"), steps: ["Broadcast dose", "Plough into topsoil 10 cm", "Sow / transplant"], bestFor: ["P & K, complex NPK"] },
];

// ── Soil types (image-first) ────────────────────────────────────────────────
export const SOILS = [
  { name: "Black (Regur)", image: img("black cotton soil"), ph: "7.5-8.5", fertilizerHint: "Low N, moderate P, needs micronutrients Zn & Fe." },
  { name: "Red", image: img("red soil field"), ph: "6.0-7.5", fertilizerHint: "Low N & P; responds to FYM + SSP + micronutrients." },
  { name: "Sandy", image: img("sandy soil"), ph: "6.0-7.5", fertilizerHint: "Split N applications, use organic matter." },
  { name: "Clay", image: img("clay soil"), ph: "6.5-7.5", fertilizerHint: "Slow-release N, watch waterlogging." },
  { name: "Loamy", image: img("loam soil farm"), ph: "6.0-7.0", fertilizerHint: "Ideal — balanced NPK." },
  { name: "Laterite", image: img("laterite soil"), ph: "5.0-6.5", fertilizerHint: "Acidic — add lime, boron, molybdenum." },
  { name: "Saline", image: img("saline soil"), ph: "8.0-9.0", fertilizerHint: "Gypsum + SOP; avoid MOP." },
  { name: "Alkaline", image: img("alkaline soil"), ph: "8.5-10", fertilizerHint: "Reclaim with gypsum, use acidifying fertilizers." },
  { name: "Acidic", image: img("acidic soil"), ph: "4.5-6.0", fertilizerHint: "Lime + rock phosphate." },
] as const;

// ── Merge extended catalog (brand grades, WSF, chelated micros, biofert,
//    organic manures, slow-release, hydroponic, boron/silicon/sulphur) ──
import { FERTILIZERS_EXTRA } from "./fertilizers-extended";
import heroUrea from "@/assets/fert-hero-urea.jpg";
import heroDap from "@/assets/fert-hero-dap.jpg";
import heroNpk from "@/assets/fert-hero-npk.jpg";
import heroMop from "@/assets/fert-hero-mop.jpg";
import heroWsf from "@/assets/fert-hero-wsf.jpg";
import heroOrganic from "@/assets/fert-hero-organic.jpg";
import heroBio from "@/assets/fert-hero-bio.jpg";
import heroNano from "@/assets/fert-hero-nano.jpg";

export const FERTILIZERS_ALL: Fertilizer[] = [...FERTILIZERS, ...FERTILIZERS_EXTRA];

// ── Helpers ────────────────────────────────────────────────
export const FERTILIZERS_BY_SLUG: Record<string, Fertilizer> =
  Object.fromEntries(FERTILIZERS_ALL.map((f) => [f.slug, f]));

export const CATEGORIES: FertilizerCategory[] = [
  "Nitrogen", "Phosphatic", "Potassic", "Complex NPK", "Micronutrient",
  "Secondary", "Organic", "Bio-fertilizer", "Liquid / Water-soluble", "Slow-release", "Soil amendment",
];

export function fertilizersForCrop(cropName: string) {
  const c = cropName.toLowerCase();
  return FERTILIZERS_ALL.filter((f) => f.suitableCrops.some((x) => x.toLowerCase().includes(c)));
}

/**
 * Deterministic mapping of every fertilizer to one of the 8 AI-generated
 * hero images. Used by the index and hero cards for a premium, uniform look
 * while still keeping per-item photo galleries.
 */
export function heroAIFor(f: Fertilizer): string {
  const k = `${f.slug} ${f.name}`.toLowerCase();
  if (k.includes("nano")) return heroNano;
  if (k.includes("urea") && !k.includes("thio")) return heroUrea;
  if (k.includes("dap") || k.includes("map ") || k.includes("mono-ammonium")) return heroDap;
  if (k.includes("mop") || k.includes("muriate") || k.includes("potash chloride")) return heroMop;
  if (f.category === "Bio-fertilizer" || k.includes("azolla") || k.includes("bga") || k.includes("rhizobium")) return heroBio;
  if (f.category === "Organic" || f.category === "Soil amendment") return heroOrganic;
  if (f.category === "Liquid / Water-soluble" || f.form === "Crystal" || f.form === "Liquid") return heroWsf;
  if (f.category === "Complex NPK") return heroNpk;
  if (f.category === "Nitrogen") return heroUrea;
  if (f.category === "Phosphatic") return heroDap;
  if (f.category === "Potassic") return heroMop;
  return heroNpk;
}

