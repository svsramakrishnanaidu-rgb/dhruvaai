import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Crosshair, X, Loader2, AlertTriangle } from "lucide-react";

import {
  detectLocation,
  geoFlags,
  isStandalone,
  onPermissionChange,
  readGeoPermission,
  type GeoStatus,
} from "@/lib/geolocate";
import { useLocation } from "@/lib/location-store";

/**
 * Mobile-only location access sheet.
 *
 * Why this exists on Android specifically:
 *  - An installed PWA gets a *fresh* geolocation permission scope. The grant the
 *    user gave the browser tab does not transfer, which is why "GPS stops working
 *    after install" — it must be re-requested inside a real user gesture.
 *  - Android Chrome ignores/throttles permission prompts that aren't triggered by
 *    a tap, so the OS dialog is fired from the button handler, never on mount.
 *  - When the OS location toggle is off the API returns POSITION_UNAVAILABLE; we
 *    surface that as actionable copy instead of failing silently.
 */
export function LocationPermission() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ status: GeoStatus; reason?: string } | null>(null);
  const loc = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;

    const isMobile =
      window.matchMedia("(max-width: 1023px)").matches ||
      (navigator.maxTouchPoints ?? 0) > 0;
    if (!isMobile) return;

    // Installed apps get one extra ask even if the browser tab was dismissed
    // before — their permission scope is genuinely new.
    const installed = isStandalone();
    if (geoFlags.hasAsked() && !installed) return;

    const t = window.setTimeout(async () => {
      const perm = await readGeoPermission();
      if (!alive) return;
      if (perm === "granted") return;

      // Installed app launch: the OS treats the app window as a first-party
      // surface, so we can request the live fix straight away and only fall
      // back to the sheet if the request is refused or unavailable.
      if (installed && perm !== "denied") {
        const res = await detectLocation({ prompt: true });
        if (!alive) return;
        geoFlags.markAsked();
        if (res.status === "granted" && !res.approximate) return;
      }

      if (perm === "prompt" || perm === "denied" || perm === "unsupported") setVisible(true);
    }, 1500);


    // Auto-dismiss if permission is granted from browser settings meanwhile.
    const off = onPermissionChange((state) => {
      if (alive && state === "granted") setVisible(false);
    });

    return () => { alive = false; window.clearTimeout(t); off(); };
  }, []);

  const enable = async () => {
    setBusy(true);
    setResult(null);
    const res = await detectLocation({ prompt: true });
    setBusy(false);
    geoFlags.markAsked();
    setResult({ status: res.status, reason: res.reason });
    if (res.status === "granted" && !res.approximate) {
      window.setTimeout(() => setVisible(false), 900);
    } else {
      window.setTimeout(() => setVisible(false), 4000);
    }
  };

  const dismiss = () => {
    geoFlags.markAsked();
    setVisible(false);
  };

  if (!visible) return null;

  const blocked = result?.status === "denied" || result?.status === "insecure";

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
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold">Enable precise location</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Allow GPS access so weather, soil, market rates and crop advice match your exact
              district instead of the default ({loc.district}).
            </p>
          </div>
        </div>

        {result?.reason && (
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-px h-3.5 w-3.5 flex-none text-accent" />
            <span>
              {result.reason}
              {blocked && " Open your browser's site settings → Permissions → Location to allow it."}
              {result.status === "unavailable" &&
                " Turn on Location in your device's quick settings, then tap Try again."}
            </span>
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={enable}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
            {busy ? "Locating…" : result ? "Try again" : "Enable location"}
          </button>
          <button
            onClick={dismiss}
            className="rounded-full border border-border/60 px-4 py-2.5 text-sm font-semibold text-muted-foreground"
          >
            Not now
          </button>
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
