// Session-based memory for LEO — persists in sessionStorage.
import { useSyncExternalStore } from "react";

export type LeoMemory = {
  recentCrops: string[]; // slugs, most-recent first
  favorites: string[]; // slugs
  lastQuery?: string;
  seenDiseases: string[];
};

const KEY = "leo.memory.v1";
const DEFAULT: LeoMemory = { recentCrops: [], favorites: [], seenDiseases: [] };

let current: LeoMemory = DEFAULT;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) current = { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
}

function persist() {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(KEY, JSON.stringify(current)); } catch {}
  listeners.forEach((l) => l());
}

export const leoMemory = {
  get: () => current,
  recordCrop(slug: string) {
    const list = [slug, ...current.recentCrops.filter((s) => s !== slug)].slice(0, 8);
    current = { ...current, recentCrops: list };
    persist();
  },
  toggleFavorite(slug: string) {
    const fav = current.favorites.includes(slug)
      ? current.favorites.filter((s) => s !== slug)
      : [...current.favorites, slug];
    current = { ...current, favorites: fav };
    persist();
  },
  setLastQuery(q: string) {
    current = { ...current, lastQuery: q };
    persist();
  },
  recordDisease(name: string) {
    const list = [name, ...current.seenDiseases.filter((s) => s !== name)].slice(0, 6);
    current = { ...current, seenDiseases: list };
    persist();
  },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
};

export function useLeoMemory(): LeoMemory {
  return useSyncExternalStore(leoMemory.subscribe, () => current, () => DEFAULT);
}
