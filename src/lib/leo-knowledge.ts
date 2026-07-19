/**
 * Compact, live snapshot of website knowledge for LEO.
 * Small enough to fit in one prompt (< ~4 KB), but rich enough for
 * grounded, context-aware answers.
 *
 * Rebuilt on every ask() so any data updates propagate instantly — no
 * retraining or manual rebuild step.
 */
import { CROP_LIST, type Crop } from "@/data/crops";
import { profileFor } from "@/lib/district-profiles";

function cropDigest(c: Crop) {
  return {
    slug: c.slug,
    name: c.name,
    sci: c.scientificName,
    season: c.season,
    soil: c.soilType,
    water: c.waterNeed,
    yield: c.yield,
    localNames: c.localNames,
    topDiseases: (c.diseases || []).slice(0, 3).map((d) => d.name),
    topPests: (c.pests || []).slice(0, 3),
    keyFerts: (c.fertilizer || []).slice(0, 3).map((f) => `${f.name} ${f.perAcreKg}kg/ac (${f.stage})`),
    rotation: (c.rotation || []).slice(0, 3).map((r) => r.crop),
    price: c.marketPrice ? `₹${c.marketPrice.price}/${c.marketPrice.unit} (MSP ₹${c.marketPrice.msp})` : undefined,
    districts: (c.suitableDistricts || []).slice(0, 6),
  };
}

export function buildLeoKnowledge(opts: {
  district?: string;
  state?: string;
  recentCrops?: string[];
  favorites?: string[];
}) {
  const profile = opts.district ? profileFor(opts.district) : null;

  // Prioritise crops relevant to the user's district / recent / favourites
  // so the AI has the *most useful* subset in-prompt.
  const relevantSet = new Set<string>([
    ...(opts.recentCrops ?? []),
    ...(opts.favorites ?? []),
  ]);
  if (opts.district) {
    const dl = opts.district.toLowerCase();
    for (const c of CROP_LIST) {
      if (c.suitableDistricts?.some((x) => x.toLowerCase() === dl)) relevantSet.add(c.slug);
    }
  }

  const relevant = CROP_LIST.filter((c) => relevantSet.has(c.slug)).slice(0, 12);
  const others = CROP_LIST.filter((c) => !relevantSet.has(c.slug)).slice(0, 40);

  return {
    location: profile
      ? {
          district: profile.district,
          state: profile.state,
          climate: profile.climate,
          soil: profile.soil,
          soilPh: profile.soilPh,
          season: profile.season,
          weather: `${profile.tempC}°C, ${profile.sky}, humidity ${profile.humidity}%`,
          rainfall: `${profile.rainfallYtdMm}mm YTD (${profile.rainfallDeltaPct >= 0 ? "+" : ""}${profile.rainfallDeltaPct}% vs normal)`,
          alert: profile.seasonAlert,
          topDiseases: profile.topDiseases,
          schemes: profile.schemes,
          rotationHint: profile.rotationHint,
          priceModifier: profile.priceModifier,
        }
      : null,
    // Crop index (name + slug + local names) — helps the AI resolve any crop
    // mention across languages / dialects.
    cropIndex: CROP_LIST.map((c) => ({
      slug: c.slug,
      name: c.name,
      local: c.localNames,
    })),
    relevantCrops: relevant.map(cropDigest),
    otherCrops: others.map((c) => ({ slug: c.slug, name: c.name, season: c.season })),
    session: {
      recentCrops: opts.recentCrops ?? [],
      favorites: opts.favorites ?? [],
    },
  };
}
