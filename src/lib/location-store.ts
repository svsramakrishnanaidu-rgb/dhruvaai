import { useSyncExternalStore } from "react";

export type Location = { state: string; district: string; mandal?: string };

const DEFAULT: Location = { state: "Andhra Pradesh", district: "Guntur" };

const listeners = new Set<() => void>();
let current: Location = DEFAULT;

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem("agri.location");
    if (raw) current = { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
}

export const locationStore = {
  get: () => current,
  set(next: Partial<Location>) {
    current = { ...current, ...next };
    if (typeof window !== "undefined") {
      window.localStorage.setItem("agri.location", JSON.stringify(current));
    }
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useLocation(): Location {
  return useSyncExternalStore(
    locationStore.subscribe,
    () => locationStore.get(),
    () => DEFAULT,
  );
}

export const STATES: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Guntur", "Krishna", "West Godavari", "East Godavari", "Anantapur",
    "Kurnool", "Chittoor", "Nellore", "Prakasam", "Visakhapatnam",
  ],
  Telangana: [
    "Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam",
    "Mahbubnagar", "Nalgonda", "Adilabad", "Medak", "Rangareddy",
  ],
};
