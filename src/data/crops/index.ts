import type { Crop, CropCategory } from "./types";
import rice from "./rice";
import cotton from "./cotton";
import groundnut from "./groundnut";
import maize from "./maize";
import chilli from "./chilli";
import turmeric from "./turmeric";
import sugarcane from "./sugarcane";
import mango from "./mango";
import tomato from "./tomato";
import banana from "./banana";
import redGram from "./red-gram";
import bengalGram from "./bengal-gram";
import jowar from "./jowar";
import bajra from "./bajra";
import ragi from "./ragi";
import onion from "./onion";
import { BULK_CROPS } from "./bulk-crops";

// Strict isolation: each crop is its OWN object literal. This registry only
// maps slug → crop; no cross-crop merging of arrays anywhere in the app.
const CORE_LIST: Crop[] = [
  rice, cotton, groundnut, maize,
  chilli, turmeric, sugarcane, mango, tomato, banana,
  redGram, bengalGram, jowar, bajra, ragi, onion,
];

export const CROP_LIST: Crop[] = [...CORE_LIST, ...BULK_CROPS];

export const CROPS: Record<string, Crop> = Object.fromEntries(
  CROP_LIST.map((c) => [c.slug, c])
);

// Legacy crops without a `category` field get one derived here so filters
// remain consistent without editing every legacy file.
const LEGACY_CATEGORY: Record<string, CropCategory> = {
  rice: "Cereal",
  maize: "Cereal",
  cotton: "Cash",
  groundnut: "Oilseed",
  sugarcane: "Cash",
  chilli: "Spice",
  turmeric: "Spice",
  mango: "Fruit",
  banana: "Fruit",
  tomato: "Vegetable",
};

export function categoryOf(c: Crop): CropCategory {
  return c.category ?? LEGACY_CATEGORY[c.slug] ?? "Cereal";
}

/** Returns crops whose suitableDistricts include the given district (case-insensitive). */
export function cropsForDistrict(district: string): Crop[] {
  const d = district.toLowerCase();
  return CROP_LIST.filter((c) => c.suitableDistricts.some((x) => x.toLowerCase() === d));
}

export const CROP_CATEGORIES: CropCategory[] = [
  "Cereal", "Pulse", "Millet", "Oilseed",
  "Cash", "Horticulture", "Spice", "Vegetable",
  "Fruit", "Plantation", "Fodder", "Flower", "Medicinal",
];

export type { Crop, CropCategory } from "./types";
