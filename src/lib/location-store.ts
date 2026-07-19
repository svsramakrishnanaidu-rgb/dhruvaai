import { useSyncExternalStore } from "react";
import { DISTRICTS } from "@/data/pdf-data";
import { AP_DISTRICTS } from "@/data/ap-districts";

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

// Full 26-district AP registry drives the base list; other states get their
// districts from the PDF dataset.
const BASE: Record<string, string[]> = {
  "Andhra Pradesh": AP_DISTRICTS.map((d) => d.name),
  Telangana: [
    "Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam",
    "Mahbubnagar", "Nalgonda", "Adilabad", "Medak", "Rangareddy",
  ],
};

const merged: Record<string, string[]> = { ...BASE };
for (const row of DISTRICTS) {
  const list = merged[row.state] ?? [];
  if (!list.includes(row.district)) list.push(row.district);
  merged[row.state] = list;
}

export const STATES: Record<string, string[]> = merged;
