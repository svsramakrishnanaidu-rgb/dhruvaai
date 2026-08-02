import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  ShieldCheck,
  Crosshair,
  Loader2,
  AlertTriangle,
  Smartphone,
  Settings,
  Navigation,
  CheckCircle2,
  XCircle,
  CircleHelp,
} from "lucide-react";
import {
  isGeoUsable,
  isStandalone,
  locationSettingsHint,
  onPermissionChange,
  openAppPermissionSettings,
  openLocationSettings,
  readGeoPermission,
  requestLocationPermission,
} from "@/lib/geolocate";
import { reverseGeocodePlace } from "@/lib/live-weather";

export const Route = createFileRoute("/permissions")({
  head: () => ({
    meta: [
      { title: "App Permissions & Location Access — Krish Sense" },
      {
        name: "description",
        content:
          "Review and control the permissions Krish Sense uses. Allow or deny device location access for live weather, soil and market intelligence.",
      },
      { property: "og:title", content: "App Permissions & Location Access — Krish Sense" },
      {
        property: "og:description",
        content:
          "Manage device location permission for Krish Sense — allow for live GPS weather, or deny and pick your district manually.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PermissionsPage,
});

type PermState = PermissionState | "unsupported" | "checking";

function PermissionsPage() {
  const [perm, setPerm] = useState<PermState>("checking");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [installed, setInstalled] = useState(false);
  const [secure, setSecure] = useState(true);
  const [servicesOff, setServicesOff] = useState(false);

  const refresh = useCallback(async () => {
    setPerm(await readGeoPermission());
  }, []);

  useEffect(() => {
    setInstalled(isStandalone());
    setSecure(isGeoUsable());
    void refresh();
    return onPermissionChange((s) => setPerm(s));
  }, [refresh]);

  /** Runtime permission request — fired from a real tap, as Android requires. */
  const allow = async () => {
    setBusy(true);
    setNote(null);
    const res = await requestLocationPermission({ highAccuracy: true });
    setBusy(false);
    setServicesOff(res.servicesOff);
    await refresh();
    if (res.granted) {
      setNote(
        `Live location enabled${res.result?.district ? ` — ${res.result.district}` : ""}. Weather now follows your current place.`,
      );
    } else {
      setNote(
        `${res.reason ?? "Location could not be read."} ${locationSettingsHint(res.servicesOff ? "services" : "permission")}`,
      );
    }
  };

  /** Deep-link into the OS settings screen when location is off or blocked. */
  const goToSettings = () => {
    const opened = servicesOff
      ? openLocationSettings()
      : openAppPermissionSettings() || openLocationSettings();
    if (!opened) {
      setNote(locationSettingsHint(servicesOff ? "services" : "permission"));
    }
  };

  const testFix = async () => {
    setBusy(true);
    setNote(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const p = await reverseGeocodePlace(pos.coords.latitude, pos.coords.longitude);
        setPlace(p.label || null);
        setBusy(false);
        setNote(p.label ? null : "Got a GPS fix but the place name is unavailable right now.");
      },
      (err) => {
        setBusy(false);
        setNote(err.message || "GPS did not respond. Move to an open area and try again.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  const status = {
    granted: { label: "Allowed", cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10", Icon: CheckCircle2 },
    denied: { label: "Denied", cls: "text-rose-300 border-rose-500/30 bg-rose-500/10", Icon: XCircle },
    prompt: { label: "Ask every time", cls: "text-amber-300 border-amber-500/30 bg-amber-500/10", Icon: CircleHelp },
    unsupported: { label: "Unsupported", cls: "text-muted-foreground border-border/60 bg-muted/10", Icon: CircleHelp },
    checking: { label: "Checking…", cls: "text-muted-foreground border-border/60 bg-muted/10", Icon: Loader2 },
  }[perm];

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-10">
      <header className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold">App Permissions</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Krish Sense asks for one device permission only. You stay in control — allow it for live
          GPS weather, or deny it and choose your district manually.
        </p>
      </header>

      {/* Location permission card */}
      <section className="glass mt-8 rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-primary/15 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Device location (GPS)</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Used to detect your city / district for live weather, soil metrics and nearby market
                rates. Coordinates are sent only to the weather and geocoding services — never stored
                and never shown as raw numbers in the app.
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.cls}`}>
            <status.Icon className={`h-3.5 w-3.5 ${perm === "checking" ? "animate-spin" : ""}`} />
            {status.label}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={allow}
            disabled={busy || perm === "unsupported"}
            className="tap inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
            {perm === "granted" ? "Re-check location" : "Allow location"}
          </button>
          <button
            onClick={testFix}
            disabled={busy || perm !== "granted"}
            className="tap inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-muted-foreground disabled:opacity-50"
          >
            Test live fix
          </button>
          {(servicesOff || perm === "denied") && (
            <button
              onClick={goToSettings}
              className="tap inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-200"
            >
              <Settings className="h-4 w-4" />
              {servicesOff ? "Turn on location services" : "Open app settings"}
            </button>
          )}
          <Link
            to="/weather"
            className="tap inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-muted-foreground"
          >
            Open weather
          </Link>
        </div>

        {place && (
          <p className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Live fix resolved to <strong>{place}</strong>.
          </p>
        )}
        {note && (
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-px h-3.5 w-3.5 flex-none text-accent" />
            <span>{note}</span>
          </p>
        )}

        {servicesOff && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
            <Navigation className="mt-px h-4 w-4 flex-none" />
            <span>
              <strong className="block text-sm">Location services are turned off</strong>
              The permission is fine, but your device can't produce a fix while the system Location
              toggle is off. {locationSettingsHint("services")}
            </span>
          </div>
        )}

        {perm === "denied" && (
          <div className="mt-4 rounded-2xl border border-border/60 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">Location is blocked. To re-enable:</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li><strong>Android / Chrome:</strong> tap ⋮ → Settings → Site settings → Location → allow this app.</li>
              <li><strong>Installed app:</strong> long-press the app icon → App info → Permissions → Location → Allow.</li>
              <li><strong>iPhone / Safari:</strong> Settings → Safari → Location → Ask / Allow.</li>
            </ul>
          </div>
        )}
        {!secure && (
          <p className="mt-4 text-xs text-amber-300">
            Precise location needs a secure (https) connection. Open the published app link.
          </p>
        )}
      </section>

      {/* Denied fallback */}
      <section className="glass mt-5 rounded-3xl p-6">
        <h2 className="font-display text-base font-bold">If you deny location</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Nothing breaks. The weather screen lets you pick State → District → Village manually and
          fetches the same live data for that place. Crop, soil and market pages fall back to your
          saved district.
        </p>
      </section>

      {/* Installed app info */}
      <section className="glass mt-5 rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-accent/15 text-accent">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold">
              {installed ? "Running as an installed app" : "Install Krish Sense on your phone"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {installed
                ? "This window has its own permission scope. Location was requested at launch so weather connects to your live position automatically."
                : "Use your browser menu → “Add to Home screen”. Once installed, the app asks for location on launch and connects the weather screen to your live position automatically."}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Declared in the app manifest as an optional <code>geolocation</code> permission with an
              allow / denied choice — the app never takes it silently.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
