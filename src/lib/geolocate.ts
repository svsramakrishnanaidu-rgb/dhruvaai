import { locationStore, STATES } from "@/lib/location-store";

/**
 * Shared, hardened geolocation pipeline.
 *
 * Android reliability notes (why this file looks the way it does):
 *  - Android Chrome/WebView only exposes `navigator.geolocation` on a secure
 *    origin. On http:// the object exists but every call silently errors, so
 *    we detect that up front instead of hanging.
 *  - Installed PWAs on Android start with a *fresh* permission state: the grant
 *    given to the browser tab does not carry over. That is the "GPS stops
 *    working after install" bug — it must be re-requested from a user gesture.
 *  - Some OEM WebViews (Xiaomi, Vivo, older Samsung) never invoke either
 *    callback when the OS location toggle is off, so every call is wrapped in
 *    a hard watchdog timer.
 *  - Two-stage fix: a fast cached/coarse position paints the UI immediately,
 *    then a high-accuracy pass refines it in the background.
 *  - IP fallback guarantees the app is never location-less.
 */

export type GeoStatus =
  | "granted"
  | "denied"
  | "unavailable"      // OS location services off / no provider
  | "insecure"         // not a secure origin — API unusable
  | "timeout"
  | "failed";

export type GeoResult = {
  status: GeoStatus;
  state?: string;
  district?: string;
  accuracy?: number;
  /** Human-readable reason, safe to surface in the UI. */
  reason?: string;
  /** True when the fix came from IP lookup rather than the GPS/network provider. */
  approximate?: boolean;
};

const SESSION_KEY = "ks_autolocated";
const ASKED_KEY = "ks_geo_asked";

export const geoFlags = {
  hasAutoLocated: () => safeSession("get", SESSION_KEY) === "1",
  markAutoLocated: () => safeSession("set", SESSION_KEY, "1"),
  clearAutoLocated: () => safeSession("del", SESSION_KEY),
  hasAsked: () => safeLocal("get", ASKED_KEY) === "1",
  markAsked: () => safeLocal("set", ASKED_KEY, "1"),
  clearAsked: () => safeLocal("del", ASKED_KEY),
};

function safeSession(op: "get" | "set" | "del", k: string, v?: string) {
  try {
    if (typeof window === "undefined") return null;
    if (op === "set") { window.sessionStorage.setItem(k, v!); return v!; }
    if (op === "del") { window.sessionStorage.removeItem(k); return null; }
    return window.sessionStorage.getItem(k);
  } catch { return null; }
}

function safeLocal(op: "get" | "set" | "del", k: string, v?: string) {
  try {
    if (typeof window === "undefined") return null;
    if (op === "set") { window.localStorage.setItem(k, v!); return v!; }
    if (op === "del") { window.localStorage.removeItem(k); return null; }
    return window.localStorage.getItem(k);
  } catch { return null; }
}

/** Structured, non-noisy diagnostics — invaluable for remote Android bug reports. */
function log(stage: string, detail?: unknown) {
  if (typeof console === "undefined") return;
  try { console.debug(`[geo] ${stage}`, detail ?? ""); } catch { /* noop */ }
}

/** Secure-origin check. Android blocks geolocation entirely outside https/localhost. */
export function isGeoUsable(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  if (!("geolocation" in navigator)) return false;
  if (window.isSecureContext) return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

/** True when the app is running as an installed PWA (fresh permission scope). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

/** Reads the Permissions API without throwing on browsers that lack it (iOS < 16). */
export async function readGeoPermission(): Promise<PermissionState | "unsupported"> {
  if (!isGeoUsable()) return "unsupported";
  try {
    const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
    if (!perms?.query) return "unsupported";
    const s = await perms.query({ name: "geolocation" as PermissionName });
    return s.state;
  } catch {
    return "unsupported";
  }
}

/**
 * Subscribes to permission changes so the UI can react when the user flips the
 * OS/browser toggle while the app is open. Returns an unsubscribe function.
 */
export function onPermissionChange(cb: (s: PermissionState) => void): () => void {
  let status: PermissionStatus | null = null;
  let cancelled = false;
  const handler = () => { if (status) cb(status.state); };
  (async () => {
    try {
      const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
      if (!perms?.query) return;
      const s = await perms.query({ name: "geolocation" as PermissionName });
      if (cancelled) return;
      status = s;
      s.addEventListener("change", handler);
    } catch { /* unsupported */ }
  })();
  return () => {
    cancelled = true;
    status?.removeEventListener("change", handler);
  };
}

/* ============================================================================
   RUNTIME PERMISSION REQUEST (Android / iOS)
   ----------------------------------------------------------------------------
   The Android manifest declares ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION,
   but on Android 6+ (and in every WebView/TWA wrapper) the manifest entry only
   makes the permission *requestable* — the OS dialog must still be triggered at
   runtime, from a real user gesture. `requestLocationPermission()` is that
   runtime request: call it from a tap/click handler only.
   ========================================================================== */

export type LocationRequestOutcome = {
  /** Coarse classification of what happened. */
  status: "granted" | "denied" | "servicesOff" | "timeout" | "insecure" | "unsupported";
  granted: boolean;
  /** True when permission is fine but the device's Location toggle is OFF. */
  servicesOff: boolean;
  /** True when the user blocked us permanently (needs app/site settings). */
  blocked: boolean;
  reason?: string;
  /** Resolved state/district when the fix succeeded. */
  result?: GeoResult;
  accuracy?: number;
};

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1);
}

/**
 * Runtime location permission request.
 *
 * Must be invoked inside a user gesture — Android Chrome silently auto-denies
 * geolocation prompts raised outside one. Never throws; always resolves with a
 * classified outcome the UI can act on (ask again vs. open settings vs. turn on
 * location services).
 */
export async function requestLocationPermission(
  opts: { highAccuracy?: boolean; timeout?: number } = {},
): Promise<LocationRequestOutcome> {
  const { highAccuracy = true, timeout = 15000 } = opts;

  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return {
      status: "unsupported", granted: false, servicesOff: false, blocked: false,
      reason: "This device or browser doesn't provide a location API.",
    };
  }

  if (!isGeoUsable()) {
    return {
      status: "insecure", granted: false, servicesOff: false, blocked: false,
      reason: "Precise location needs a secure (https) connection.",
    };
  }

  // Pre-check: if the user already permanently blocked us, the OS dialog will
  // never appear again — send them to settings instead of a silent no-op.
  const pre = await readGeoPermission();
  log("runtime-request:pre", pre);
  if (pre === "denied") {
    geoFlags.markAsked();
    return {
      status: "denied", granted: false, servicesOff: false, blocked: true,
      reason: "Location permission is blocked for this app. Enable it in settings to continue.",
    };
  }

  // This call is what actually raises the Android/iOS permission dialog.
  const first = await getPosition({ enableHighAccuracy: highAccuracy, timeout, maximumAge: 0 });
  geoFlags.markAsked();

  if (first.ok) {
    const c = first.pos.coords;
    const result = await applyCoords(c.latitude, c.longitude, c.accuracy);
    return {
      status: "granted", granted: true, servicesOff: false, blocked: false,
      result, accuracy: c.accuracy,
    };
  }

  log("runtime-request:failed", first);

  // 1 = PERMISSION_DENIED
  if (first.code === 1) {
    const after = await readGeoPermission();
    return {
      status: "denied", granted: false, servicesOff: false,
      blocked: after === "denied",
      reason: "Location access was denied. Allow it in settings to get local weather, soil and mandi data.",
    };
  }

  // 2 = POSITION_UNAVAILABLE — on Android this is what you get when the OS
  // Location toggle is off or no provider can produce a fix.
  if (first.code === 2) {
    return {
      status: "servicesOff", granted: false, servicesOff: true, blocked: false,
      reason: "Location services are turned off on your device. Turn on Location, then try again.",
    };
  }

  // 3 / 0 = timeout or WebView weirdness — one low-accuracy retry before giving up.
  const retry = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 });
  if (retry.ok) {
    const c = retry.pos.coords;
    const result = await applyCoords(c.latitude, c.longitude, c.accuracy);
    return {
      status: "granted", granted: true, servicesOff: false, blocked: false,
      result, accuracy: c.accuracy,
    };
  }
  if (retry.code === 2) {
    return {
      status: "servicesOff", granted: false, servicesOff: true, blocked: false,
      reason: "Location services are turned off on your device. Turn on Location, then try again.",
    };
  }

  return {
    status: "timeout", granted: false, servicesOff: false, blocked: false,
    reason: "GPS didn't respond in time. Move to an open area or try again.",
  };
}

/**
 * Deep-links to the device location settings.
 *
 * Android (Chrome / TWA / WebView) honours `intent:` URLs, so we can open the
 * system "Location" screen directly. iOS only allows `app-settings:` from a
 * native shell, so it returns false there and the UI shows manual steps.
 *
 * @returns true when a settings screen was actually requested.
 */
export function openLocationSettings(): boolean {
  if (typeof window === "undefined") return false;

  if (isAndroid()) {
    try {
      // System Settings → Location
      window.location.href =
        "intent://#Intent;action=android.settings.LOCATION_SOURCE_SETTINGS;end";
      return true;
    } catch { /* fall through */ }
  }

  if (isIOS()) {
    try {
      window.location.href = "app-settings:";
      return true;
    } catch { /* fall through */ }
  }

  return false;
}

/** Opens the per-app/site permission screen (Android app details page). */
export function openAppPermissionSettings(): boolean {
  if (typeof window === "undefined") return false;
  if (isAndroid()) {
    try {
      window.location.href =
        "intent://#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;end";
      return true;
    } catch { /* noop */ }
  }
  return false;
}

/** Step-by-step copy for devices where we can't deep-link into settings. */
export function locationSettingsHint(kind: "services" | "permission"): string {
  if (isAndroid()) {
    return kind === "services"
      ? "Swipe down the quick settings panel and turn on Location, then tap Try again."
      : "Open Settings → Apps → DHRUVA → Permissions → Location → Allow, then tap Try again.";
  }
  if (isIOS()) {
    return kind === "services"
      ? "Open Settings → Privacy & Security → Location Services and turn it on, then tap Try again."
      : "Open Settings → Safari → Location → Allow, then tap Try again.";
  }
  return kind === "services"
    ? "Turn on your system location service, then tap Try again."
    : "Open your browser's site settings → Permissions → Location → Allow, then tap Try again.";
}


type PosOutcome =
  | { ok: true; pos: GeolocationPosition }
  | { ok: false; code: 0 | 1 | 2 | 3; message: string };

/** getCurrentPosition with a watchdog — never hangs, never throws. */
function getPosition(opts: PositionOptions): Promise<PosOutcome> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (r: PosOutcome) => { if (!settled) { settled = true; resolve(r); } };
    // Hard guard: some Android WebViews never fire either callback.
    const guard = setTimeout(
      () => done({ ok: false, code: 3, message: "watchdog timeout" }),
      (opts.timeout ?? 10000) + 2000,
    );
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => { clearTimeout(guard); done({ ok: true, pos }); },
        (err) => {
          clearTimeout(guard);
          done({ ok: false, code: (err?.code ?? 0) as 0 | 1 | 2 | 3, message: err?.message ?? "unknown" });
        },
        opts,
      );
    } catch (e) {
      clearTimeout(guard);
      done({ ok: false, code: 0, message: String(e) });
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
  if (!j) return { status: "failed", reason: "Reverse geocoding service unreachable." };

  const state = pickState(j.principalSubdivision);
  if (!state) {
    return { status: "failed", reason: "Your region isn't covered by the crop database yet." };
  }

  const candidates = [
    j.city,
    j.locality,
    ...(j.localityInfo?.administrative?.map((a) => a.name) ?? []),
  ].filter(Boolean) as string[];

  const district = pickDistrict(state, candidates);
  locationStore.set(district ? { state, district } : { state });
  geoFlags.markAutoLocated();
  log("resolved", { state, district, accuracy });
  return { status: "granted", state, district: district ?? undefined, accuracy };
}

async function ipFallback(reason: string): Promise<GeoResult> {
  const j = await fetchJson<{ latitude?: number; longitude?: number }>("https://ipapi.co/json/");
  if (typeof j?.latitude === "number" && typeof j?.longitude === "number") {
    const res = await applyCoords(j.latitude, j.longitude);
    if (res.status === "granted") return { ...res, approximate: true, reason };
    return res;
  }
  return { status: "failed", reason };
}

/**
 * Resolve the user's district.
 * `prompt: false` keeps things silent — it only uses GPS when permission was
 * already granted, otherwise it goes straight to the IP fallback so we never
 * burn the one-shot Android permission dialog outside a user gesture.
 */
export async function detectLocation(opts: { prompt?: boolean } = {}): Promise<GeoResult> {
  if (typeof navigator === "undefined") return { status: "unavailable" };

  if (!isGeoUsable()) {
    log("insecure-or-unsupported");
    const res = await ipFallback("Precise location needs a secure (https) connection.");
    return res.status === "granted" ? res : { status: "insecure", reason: res.reason };
  }

  const perm = await readGeoPermission();
  log("permission", perm);
  if (perm === "denied") {
    const res = await ipFallback("Location permission is blocked in your browser settings.");
    return res.status === "granted" ? res : { status: "denied", reason: res.reason };
  }
  if (perm === "prompt" && opts.prompt === false) {
    return ipFallback("Using an approximate location until you allow GPS access.");
  }

  // Stage 1 — fast, cache-friendly coarse fix (paints the UI within ~1s).
  const coarse = await getPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 });
  if (coarse.ok) {
    const c = coarse.pos.coords;
    const res = await applyCoords(c.latitude, c.longitude, c.accuracy);
    // Stage 2 — refine in the background when the coarse fix is fuzzy (>1km).
    if ((c.accuracy ?? 9999) > 1000) {
      void (async () => {
        const fine = await getPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
        if (fine.ok) {
          await applyCoords(fine.pos.coords.latitude, fine.pos.coords.longitude, fine.pos.coords.accuracy);
        }
      })();
    }
    return res;
  }
  log("coarse-failed", coarse);

  // PERMISSION_DENIED — don't retry, it will only fail again.
  if (coarse.code === 1) {
    const res = await ipFallback("Location permission was denied.");
    return res.status === "granted" ? res : { status: "denied", reason: res.reason };
  }

  // POSITION_UNAVAILABLE (2) or TIMEOUT (3): the OS toggle may be off or the
  // GPS provider hasn't warmed up. One high-accuracy retry, then IP.
  const fine = await getPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  if (fine.ok) {
    const c = fine.pos.coords;
    return applyCoords(c.latitude, c.longitude, c.accuracy);
  }
  log("fine-failed", fine);

  const servicesOff = fine.code === 2;
  const viaIp = await ipFallback(
    servicesOff
      ? "Location services appear to be turned off on your device."
      : "GPS didn't respond in time — showing an approximate location.",
  );
  if (viaIp.status === "granted") return viaIp;
  return {
    status: servicesOff ? "unavailable" : "timeout",
    reason: viaIp.reason,
  };
}

/**
 * Lifecycle-aware position watch.
 * Only runs while the tab is visible — Android throttles background tabs but a
 * live `watchPosition` still keeps the GPS radio warm and drains the battery,
 * so we tear it down on hide and re-arm on show.
 */
export function startLocationWatch(): () => void {
  if (!isGeoUsable()) return () => {};
  let id: number | null = null;
  let lastApplied = 0;

  const stop = () => {
    if (id !== null) {
      try { navigator.geolocation.clearWatch(id); } catch { /* noop */ }
      id = null;
    }
  };

  const start = () => {
    if (id !== null) return;
    try {
      id = navigator.geolocation.watchPosition(
        (pos) => {
          // Throttle: at most one reverse-geocode per 2 minutes, and only for
          // reasonably precise fixes. Avoids hammering the network on the move.
          const now = Date.now();
          if (now - lastApplied < 120_000) return;
          if ((pos.coords.accuracy ?? 9999) > 3000) return;
          lastApplied = now;
          void applyCoords(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        },
        (err) => log("watch-error", err?.message),
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 20_000 },
      );
    } catch (e) { log("watch-start-failed", e); }
  };

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);
  if (!document.hidden) start();

  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    stop();
  };
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
