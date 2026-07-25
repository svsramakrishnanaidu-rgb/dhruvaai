import { useEffect } from "react";
import { locationStore, STATES } from "@/lib/location-store";

/**
 * Silently attempts to auto-detect the user's location on mount.
 * Uses browser geolocation (falls back to IP-based lookup if denied),
 * reverse-geocodes with BigDataCloud (no API key), and snaps the result
 * to the nearest known state + district in our registry.
 * Runs at most once per session; never shows UI.
 */
export function AutoLocate() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("ks_autolocated") === "1") return;

    let cancelled = false;

    const applyCoords = async (lat: number, lon: number) => {
      try {
        const r = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        );
        if (!r.ok) return;
        const j = (await r.json()) as {
          principalSubdivision?: string;
          city?: string;
          locality?: string;
          localityInfo?: { administrative?: { name?: string; order?: number }[] };
        };
        const state = pickState(j.principalSubdivision);
        if (!state) return;
        const candidates = [
          j.city,
          j.locality,
          ...(j.localityInfo?.administrative?.map((a) => a.name) ?? []),
        ].filter(Boolean) as string[];
        const district = pickDistrict(state, candidates);
        if (cancelled) return;
        if (district) locationStore.set({ state, district });
        else locationStore.set({ state });
        sessionStorage.setItem("ks_autolocated", "1");
      } catch {}
    };

    const ipFallback = async () => {
      try {
        const r = await fetch("https://ipapi.co/json/");
        if (!r.ok) return;
        const j = (await r.json()) as { latitude?: number; longitude?: number };
        if (typeof j.latitude === "number" && typeof j.longitude === "number") {
          await applyCoords(j.latitude, j.longitude);
        }
      } catch {}
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => applyCoords(pos.coords.latitude, pos.coords.longitude),
        () => ipFallback(),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
      );
    } else {
      ipFallback();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

function pickState(raw: string | undefined): string | null {
  if (!raw) return null;
  const norm = raw.toLowerCase().replace(/state$/i, "").trim();
  for (const s of Object.keys(STATES)) {
    if (s.toLowerCase() === norm || s.toLowerCase().startsWith(norm) || norm.startsWith(s.toLowerCase())) {
      return s;
    }
  }
  return null;
}

function pickDistrict(state: string, candidates: string[]): string | null {
  const list = STATES[state] ?? [];
  const lowered = list.map((d) => d.toLowerCase());
  for (const c of candidates) {
    const cn = c.toLowerCase().replace(/\s+district$/, "").trim();
    const exact = lowered.indexOf(cn);
    if (exact >= 0) return list[exact];
    const partial = lowered.findIndex((d) => d.includes(cn) || cn.includes(d));
    if (partial >= 0) return list[partial];
  }
  return null;
}
