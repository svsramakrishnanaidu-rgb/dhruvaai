/**
 * Andhra Pradesh — 26-district registry (post-2022 reorganisation).
 *
 * Each district exposes a curated list of crop slugs that are known to be
 * cultivated locally. This complements each crop's own `suitableDistricts`
 * array so /districts/$slug shows a rich gallery without editing every crop
 * module (strict per-crop data isolation stays intact).
 */
import { CROP_LIST, cropsForDistrict } from "@/data/crops";
import type { Crop } from "@/data/crops/types";

export type APDistrict = {
  slug: string;
  name: string;
  region: "Coastal" | "Rayalaseema" | "Uttarandhra";
  headquarters: string;
  soil: string;
  climate: string;
  crops: string[]; // crop slugs cultivated here
};

const D = (
  slug: string,
  name: string,
  region: APDistrict["region"],
  headquarters: string,
  soil: string,
  climate: string,
  crops: string[],
): APDistrict => ({ slug, name, region, headquarters, soil, climate, crops });

export const AP_DISTRICTS: APDistrict[] = [
  // Coastal
  D("srikakulam", "Srikakulam", "Uttarandhra", "Srikakulam", "Red loamy & coastal alluvium", "Warm humid; 1100 mm rainfall",
    ["rice", "ragi", "groundnut", "maize", "banana", "chilli", "turmeric"]),
  D("vizianagaram", "Vizianagaram", "Uttarandhra", "Vizianagaram", "Red loamy with laterite pockets", "Warm humid; hilly interior",
    ["rice", "ragi", "maize", "groundnut", "sugarcane", "mango", "turmeric"]),
  D("parvathipuram-manyam", "Parvathipuram Manyam", "Uttarandhra", "Parvathipuram", "Hilly red loam", "Cool sub-humid; tribal belt",
    ["ragi", "jowar", "red-gram", "maize", "turmeric", "banana"]),
  D("alluri-sitharama-raju", "Alluri Sitharama Raju", "Uttarandhra", "Paderu", "Forest laterite / red loam", "Cool, high altitude, high rainfall",
    ["ragi", "red-gram", "maize", "turmeric", "banana", "chilli"]),
  D("visakhapatnam", "Visakhapatnam", "Uttarandhra", "Visakhapatnam", "Red loam, coastal sand", "Tropical maritime; 1000 mm",
    ["rice", "sugarcane", "banana", "mango", "chilli", "groundnut"]),
  D("anakapalli", "Anakapalli", "Uttarandhra", "Anakapalli", "Deep black cotton + red loam", "Warm; sugar-belt",
    ["sugarcane", "rice", "banana", "maize", "ragi", "chilli"]),
  D("kakinada", "Kakinada", "Coastal", "Kakinada", "Coastal alluvium (delta)", "Hot humid; 1100 mm",
    ["rice", "sugarcane", "banana", "tomato", "chilli", "maize"]),
  D("east-godavari", "East Godavari", "Coastal", "Rajamahendravaram", "Godavari alluvium", "Delta; hot humid",
    ["rice", "sugarcane", "banana", "tomato", "chilli", "turmeric"]),
  D("konaseema", "Konaseema", "Coastal", "Amalapuram", "River delta alluvium", "Hot humid; coconut belt",
    ["rice", "banana", "sugarcane", "chilli", "tomato"]),
  D("west-godavari", "West Godavari", "Coastal", "Bhimavaram", "Godavari alluvium; rice bowl", "Hot humid; 1050 mm",
    ["rice", "sugarcane", "banana", "maize", "chilli", "turmeric"]),
  D("eluru", "Eluru", "Coastal", "Eluru", "Godavari-Krishna alluvium", "Hot humid",
    ["rice", "sugarcane", "banana", "maize", "chilli", "tomato"]),
  D("krishna", "Krishna", "Coastal", "Machilipatnam", "Krishna river alluvium", "Hot humid delta",
    ["rice", "sugarcane", "mango", "chilli", "banana", "tomato"]),
  D("ntr", "NTR", "Coastal", "Vijayawada", "Alluvium + red loam", "Hot; 900 mm",
    ["rice", "chilli", "cotton", "mango", "maize", "sugarcane"]),
  D("guntur", "Guntur", "Coastal", "Guntur", "Black cotton (deep)", "Hot dry; 850 mm",
    ["chilli", "cotton", "rice", "turmeric", "tomato", "bengal-gram", "red-gram"]),
  D("palnadu", "Palnadu", "Coastal", "Narasaraopet", "Black cotton", "Hot semi-arid",
    ["chilli", "cotton", "red-gram", "bengal-gram", "jowar", "maize"]),
  D("bapatla", "Bapatla", "Coastal", "Bapatla", "Coastal sandy loam", "Hot humid coast",
    ["rice", "chilli", "cotton", "tomato", "groundnut", "sugarcane"]),
  D("prakasam", "Prakasam", "Coastal", "Ongole", "Black cotton + red", "Hot semi-arid; 750 mm",
    ["cotton", "red-gram", "bengal-gram", "chilli", "tobacco", "jowar", "groundnut"]),
  D("nellore", "Sri Potti Sriramulu Nellore", "Coastal", "Nellore", "Coastal alluvium + red loam", "Hot humid",
    ["rice", "groundnut", "sugarcane", "chilli", "mango", "tomato"]),
  // Rayalaseema
  D("tirupati", "Tirupati", "Rayalaseema", "Tirupati", "Red sandy loam", "Warm semi-arid",
    ["groundnut", "rice", "sugarcane", "mango", "tomato", "chilli"]),
  D("chittoor", "Chittoor", "Rayalaseema", "Chittoor", "Red loam", "Warm semi-arid; mango belt",
    ["mango", "tomato", "groundnut", "sugarcane", "ragi", "banana"]),
  D("annamayya", "Annamayya", "Rayalaseema", "Rayachoti", "Red sandy loam", "Semi-arid",
    ["groundnut", "red-gram", "bengal-gram", "tomato", "mango", "ragi"]),
  D("kadapa", "YSR Kadapa", "Rayalaseema", "Kadapa", "Red sandy + black cotton", "Hot dry; 700 mm",
    ["groundnut", "red-gram", "banana", "bengal-gram", "cotton", "jowar", "onion"]),
  D("anantapur", "Ananthapuramu", "Rayalaseema", "Anantapur", "Red sandy loam (shallow)", "Hot arid; 550 mm — driest AP",
    ["groundnut", "red-gram", "bajra", "jowar", "bengal-gram", "onion", "ragi"]),
  D("sri-sathya-sai", "Sri Sathya Sai", "Rayalaseema", "Puttaparthi", "Red sandy loam", "Hot semi-arid",
    ["groundnut", "red-gram", "bajra", "bengal-gram", "onion", "mango"]),
  D("kurnool", "Kurnool", "Rayalaseema", "Kurnool", "Black cotton + red", "Hot semi-arid; 650 mm",
    ["cotton", "onion", "bengal-gram", "red-gram", "jowar", "groundnut", "chilli"]),
  D("nandyal", "Nandyal", "Rayalaseema", "Nandyal", "Black cotton + red loam", "Hot semi-arid",
    ["rice", "cotton", "onion", "bengal-gram", "red-gram", "chilli", "sugarcane"]),
];

export const AP_DISTRICT_BY_SLUG = Object.fromEntries(AP_DISTRICTS.map((d) => [d.slug, d]));

/** Resolve district → crop list, merging explicit picks with crops that name the district. */
export function cropsInAPDistrict(districtName: string): Crop[] {
  const entry = AP_DISTRICTS.find((d) => d.name.toLowerCase() === districtName.toLowerCase() || d.slug === districtName.toLowerCase());
  const explicit = entry ? entry.crops : [];
  const bySlug = new Map(CROP_LIST.map((c) => [c.slug, c]));
  const out: Crop[] = [];
  const seen = new Set<string>();
  for (const slug of explicit) {
    const c = bySlug.get(slug);
    if (c && !seen.has(c.slug)) { out.push(c); seen.add(c.slug); }
  }
  for (const c of cropsForDistrict(districtName)) {
    if (!seen.has(c.slug)) { out.push(c); seen.add(c.slug); }
  }
  return out;
}

export const AP_REGIONS: Array<APDistrict["region"]> = ["Coastal", "Rayalaseema", "Uttarandhra"];
