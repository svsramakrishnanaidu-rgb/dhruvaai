import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Crosshair, X, Loader2, AlertTriangle, Settings, Navigation } from "lucide-react";

import {
  geoFlags,
  isStandalone,
  locationSettingsHint,
  onPermissionChange,
  openAppPermissionSettings,
  openLocationSettings,
  readGeoPermission,
  requestLocationPermission,
  type LocationRequestOutcome,
} from "@/lib/geolocate";
import { useLocation } from "@/lib/location-store";

/**
 * Mobile location access sheet — runtime permission request + settings recovery.
 *
 * Android notes (why this file looks the way it does):
 *  - ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION in the manifest only make the
 *    permission *requestable*. Android 6+ still requires a runtime request, and
 *    Chrome/WebView auto-denies any prompt not raised inside a user gesture — so
 *    `requestLocationPermission()` is only ever called from the button handler.
 *  - An installed PWA/TWA gets a fresh permission scope, so we ask once more
 *    after install even if the browser tab was already answered.
 *  - POSITION_UNAVAILABLE means the OS Location toggle is off; that is a
 *    different failure from a denied permission and gets its own recovery CTA
 *    that deep-links into the system location settings screen.
 */
export function LocationPermission() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<LocationRequestOutcome | null>(null);
  const loc = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;

    const isMobile =
      window.matchMedia("(max-width: 1023px)").matches ||
      (navigator.maxTouchPoints ?? 0) > 0;
    if (!isMobile) return;

    const installed = isStandalone();
    if (geoFlags.hasAsked() && !installed) return;

    const t = window.setTimeout(async () => {
      // AutoLocate already fires the OS dialog on mobile; only step in when it
      // didn't produce a real device fix.
      if (geoFlags.hasAutoLocated()) return;
      const perm = await readGeoPermission();
      if (!alive) return;
      if (perm === "granted") return;
      if (perm === "prompt" || perm === "denied" || perm === "unsupported") setVisible(true);
    }, 5000);

    // Auto-dismiss if permission is granted from browser/OS settings meanwhile.
    const off = onPermissionChange((state) => {
      if (alive && state === "granted") setVisible(false);
    });

    return () => { alive = false; window.clearTimeout(t); off(); };
  }, []);

  /** Runtime permission request — user gesture only. */
  const enable = async () => {
    setBusy(true);
    setOutcome(null);
    const res = await requestLocationPermission({ highAccuracy: true });
    setBusy(false);
    setOutcome(res);
    if (res.granted) window.setTimeout(() => setVisible(false), 900);
  };

  const dismiss = () => {
    geoFlags.markAsked();
    setVisible(false);
  };

  if (!visible) return null;

  const servicesOff = outcome?.servicesOff === true;
  const blocked = outcome?.blocked === true || outcome?.status === "insecure";
  const needsSettings = servicesOff || blocked;

  const openSettings = () => {
    const ok = servicesOff ? openLocationSettings() : openAppPermissionSettings() || openLocationSettings();
    if (!ok) {
      // No deep-link available (desktop browser / iOS Safari): keep the sheet
      // open so the written steps stay on screen.
      setOutcome((prev) =>
        prev ? { ...prev, reason: locationSettingsHint(servicesOff ? "services" : "permission") } : prev,
      );
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-4 lg:hidden" role="dialog" aria-label="Location access">
      <div className="card-elegant relative overflow-hidden p-4 shadow-2xl">
        <button
          onClick={dismiss}
          aria-label="Dismiss location request"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
            {servicesOff ? <Navigation className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold">
              {servicesOff
                ? "Turn on location services"
                : blocked
                  ? "Location is blocked"
                  : "Enable precise location"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {servicesOff
                ? "Your device's Location setting is switched off, so GPS can't return a fix. Turn it on and we'll pick up your district automatically."
                : blocked
                  ? "Krish Sense can't access GPS until location permission is allowed for this app."
                  : `Allow GPS access so weather, soil, market rates and crop advice match your exact district instead of the default (${loc.district}).`}
            </p>
          </div>
        </div>

        {outcome?.reason && (
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-px h-3.5 w-3.5 flex-none text-accent" />
            <span>
              {outcome.reason}
              {needsSettings && ` ${locationSettingsHint(servicesOff ? "services" : "permission")}`}
            </span>
          </p>
        )}

        {outcome?.granted && (
          <p className="mt-3 text-[11px] font-semibold text-primary">
            Location enabled — {outcome.result?.district ?? outcome.result?.state ?? "district updated"}
            {typeof outcome.accuracy === "number" ? ` · ±${Math.round(outcome.accuracy)} m` : ""}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          {needsSettings ? (
            <button
              onClick={openSettings}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Settings className="h-4 w-4" />
              Open settings
            </button>
          ) : null}

          <button
            onClick={enable}
            disabled={busy}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${
              needsSettings
                ? "border border-border/60 text-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
            {busy ? "Locating…" : outcome ? "Try again" : "Enable location"}
          </button>

          {!needsSettings && (
            <button
              onClick={dismiss}
              className="rounded-full border border-border/60 px-4 py-2.5 text-sm font-semibold text-muted-foreground"
            >
              Not now
            </button>
          )}
        </div>

        <Link
          to="/permissions"
          onClick={dismiss}
          className="mt-3 block text-center text-[11px] font-medium text-muted-foreground underline underline-offset-2"
        >
          Manage app permissions
        </Link>
      </div>
    </div>
  );
}
