import type { Crop } from "./types";
import rice from "./rice";
import cotton from "./cotton";
import groundnut from "./groundnut";
import maize from "./maize";

// Strict isolation: each crop has its own module. This registry only maps
// slug → crop; no cross-crop merging of arrays anywhere in the app.
export const CROPS: Record<string, Crop> = {
  rice,
  cotton,
  groundnut,
  maize,
};

export const CROP_LIST: Crop[] = [rice, cotton, groundnut, maize];

export type { Crop } from "./types";
