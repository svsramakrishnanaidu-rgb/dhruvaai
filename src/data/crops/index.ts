import type { Crop } from "./types";
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

// Strict isolation: each crop has its own module. This registry only maps
// slug → crop; no cross-crop merging of arrays anywhere in the app.
export const CROPS: Record<string, Crop> = {
  rice,
  cotton,
  groundnut,
  maize,
  chilli,
  turmeric,
  sugarcane,
  mango,
  tomato,
  banana,
};

export const CROP_LIST: Crop[] = [
  rice, cotton, groundnut, maize,
  chilli, turmeric, sugarcane, mango, tomato, banana,
];

/** Returns crops whose suitableDistricts include the given district (case-insensitive). */
export function cropsForDistrict(district: string): Crop[] {
  const d = district.toLowerCase();
  return CROP_LIST.filter((c) => c.suitableDistricts.some((x) => x.toLowerCase() === d));
}

export type { Crop } from "./types";
