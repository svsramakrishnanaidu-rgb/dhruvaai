import { useEffect, useState } from "react";
import { MapPin, Crosshair, X, Loader2 } from "lucide-react";
import { detectLocation, geoFlags, readGeoPermission } from "@/lib/geolocate";
import { useLocation } from "@/lib/location-store";

/**
 * Mobile-only location access sheet.
 * Shown once (until dismissed or granted) when the browser reports the
 * geolocation permission is still in the "prompt" state. Tapping "Enable"
 * triggers the native OS prompt from a real user gesture — required on iOS
 * Safari and Android Chrome, where programmatic prompts are throttled.
 */
export function LocationPermission() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loc = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;

    const isMobile =
      window.matchMedia("(max-width: 1023px)").matches ||
      (navigator.maxTouchPoints ?? 0) > 0;
    if (!isMobile) return;
    if (geoFlags.hasAsked()) return;

    const t = window.setTimeout(async () => {
      const perm = await readGeoPermission();
      if (!alive) return;
      if (perm === "prompt" || perm === "unsupported") setVisible(true);
    }, 1500);

    return () => { alive = false; window.clearTimeout(t); };
  }, []);

  const enable = async () => {
    setBusy(true);
    setError(null);
    const res = await detectLocation({ prompt: true });
    setBusy(false);
    geoFlags.markAsked();
    if (res.status === "granted") {
      setVisible(false);
    } else {
      setError("Couldn't get a precise fix. We'll use an approximate location instead.");
      window.setTimeout(() => setVisible(false), 2200);
    }
  };

  const dismiss = () => {
    geoFlags.markAsked();
    setVisible(false);
  };

  if (!visible) return null;

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

        {error && <p className="mt-3 text-[11px] text-muted-foreground">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={enable}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
            {busy ? "Locating…" : "Enable location"}
          </button>
          <button
            onClick={dismiss}
            className="rounded-full border border-border/60 px-4 py-2.5 text-sm font-semibold text-muted-foreground"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
