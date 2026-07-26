import { locationStore, STATES } from "@/lib/location-store";

/**
 * Shared, hardened geolocation pipeline.
 *
 * Design goals:
 *  - Works the same on Android Chrome, iOS Safari and desktop.
 *  - Never throws (all failures resolve to a status string).
 *  - Two-stage GPS: a fast coarse fix first, then a high-accuracy refine pass
 *    so the UI updates quickly but converges on a precise district.
 *  - IP fallback when GPS is denied/unavailable so the app is never location-less.
 */

export type GeoStatus = "granted" | "denied" | "unavailable" | "failed";

export type GeoResult = {
  status: GeoStatus;
  state?: string;
  district?: string;
  accuracy?: number;
};

const SESSION_KEY = "ks_autolocated";
const ASKED_KEY = "ks_geo_asked";

export const geoFlags = {
  hasAutoLocated: () => safeSession("get", SESSION_KEY) === "1",
  markAutoLocated: () => safeSession("set", SESSION_KEY, "1"),
  hasAsked: () => safeLocal("get", ASKED_KEY) === "1",
  markAsked: () => safeLocal("set", ASKED_KEY, "1"),
};

function safeSession(op: "get" | "set", k: string, v?: string) {
  try {
    if (typeof window === "undefined") return null;
    if (op === "set") { window.sessionStorage.setItem(k, v!); return v!; }
    return window.sessionStorage.getItem(k);
  } catch { return null; }
}

function safeLocal(op: "get" | "set", k: string, v?: string) {
  try {
    if (typeof window === "undefined") return null;
    if (op === "set") { window.localStorage.setItem(k, v!); return v!; }
    return window.localStorage.getItem(k);
  } catch { return null; }
}

/** Reads the Permissions API without throwing on browsers that lack it (iOS < 16). */
export async function readGeoPermission(): Promise<PermissionState | "unsupported"> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return "unsupported";
  try {
    const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
    if (!perms?.query) return "unsupported";
    const s = await perms.query({ name: "geolocation" as PermissionName });
    return s.state;
  } catch {
    return "unsupported";
  }
}

function getPosition(opts: PositionOptions): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (p: GeolocationPosition | null) => { if (!settled) { settled = true; resolve(p); } };
    // Hard guard: some Android WebViews never fire either callback.
    const guard = setTimeout(() => done(null), (opts.timeout ?? 10000) + 2000);
    try {
      navigator.geolocation.getCurrentPosition(
        (p) => { clearTimeout(guard); done(p); },
        () => { clearTimeout(guard); done(null); },
        opts,
      );
    } catch {
      clearTimeout(guard);
      done(null);
    }
  });
}

async function fetchJson<T>(url: string, ms = 7000): Promise<T | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

type ReverseGeo = {
  principalSubdivision?: string;
  city?: string;
  locality?: string;
  localityInfo?: { administrative?: { name?: string; order?: number }[] };
};

/** Reverse-geocodes and snaps to the nearest known state + district. */
export async function applyCoords(lat: number, lon: number, accuracy?: number): Promise<GeoResult> {
  const j = await fetchJson<ReverseGeo>(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
  );
  if (!j) return { status: "failed" };

  const state = pickState(j.principalSubdivision);
  if (!state) return { status: "failed" };

  const candidates = [
    j.city,
    j.locality,
    ...(j.localityInfo?.administrative?.map((a) => a.name) ?? []),
  ].filter(Boolean) as string[];

  const district = pickDistrict(state, candidates);
  locationStore.set(district ? { state, district } : { state });
  geoFlags.markAutoLocated();
  return { status: "granted", state, district: district ?? undefined, accuracy };
}

async function ipFallback(): Promise<GeoResult> {
  const j = await fetchJson<{ latitude?: number; longitude?: number }>("https://ipapi.co/json/");
  if (typeof j?.latitude === "number" && typeof j?.longitude === "number") {
    const res = await applyCoords(j.latitude, j.longitude);
    return { ...res, status: res.status === "granted" ? "granted" : res.status };
  }
  return { status: "failed" };
}

/**
 * Resolve the user's district.
 * `prompt: false` keeps things silent — it only uses GPS when permission was
 * already granted, otherwise it goes straight to the IP fallback.
 */
export async function detectLocation(opts: { prompt?: boolean } = {}): Promise<GeoResult> {
  if (typeof navigator === "undefined") return { status: "unavailable" };
  if (!("geolocation" in navigator)) return ipFallback();

  const perm = await readGeoPermission();
  if (perm === "denied") return ipFallback();
  if (perm === "prompt" && opts.prompt === false) return ipFallback();

  // Stage 1 — fast, cache-friendly coarse fix.
  const coarse = await getPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 });
  if (coarse) {
    const res = await applyCoords(coarse.coords.latitude, coarse.coords.longitude, coarse.coords.accuracy);
    // Stage 2 — refine in the background when the coarse fix is fuzzy (>1km).
    if ((coarse.coords.accuracy ?? 9999) > 1000) {
      void (async () => {
        const fine = await getPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
        if (fine) await applyCoords(fine.coords.latitude, fine.coords.longitude, fine.coords.accuracy);
      })();
    }
    return res;
  }

  // No coarse fix — try once with high accuracy before falling back to IP.
  const fine = await getPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  if (fine) return applyCoords(fine.coords.latitude, fine.coords.longitude, fine.coords.accuracy);

  const viaIp = await ipFallback();
  if (viaIp.status === "granted") return viaIp;
  return { status: perm === "denied" ? "denied" : "failed" };
}

export function pickState(raw: string | undefined): string | null {
  if (!raw) return null;
  const norm = raw.toLowerCase().replace(/state$/i, "").trim();
  for (const s of Object.keys(STATES)) {
    const l = s.toLowerCase();
    if (l === norm || l.startsWith(norm) || norm.startsWith(l)) return s;
  }
  return null;
}

export function pickDistrict(state: string, candidates: string[]): string | null {
  const list = STATES[state] ?? [];
  const lowered = list.map((d) => d.toLowerCase());
  for (const c of candidates) {
    const cn = c.toLowerCase().replace(/\s+district$/, "").trim();
    if (!cn) continue;
    const exact = lowered.indexOf(cn);
    if (exact >= 0) return list[exact];
    const partial = lowered.findIndex((d) => d.includes(cn) || cn.includes(d));
    if (partial >= 0) return list[partial];
  }
  return null;
}
