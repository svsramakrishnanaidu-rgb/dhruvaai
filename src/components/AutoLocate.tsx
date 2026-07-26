import { useEffect } from "react";
import { detectLocation, geoFlags } from "@/lib/geolocate";

/**
 * Silent location resolver.
 * Runs once per session and never prompts — if permission hasn't been granted
 * yet, the mobile LocationPermission sheet handles the ask. Deferred to idle
 * time so it never competes with first paint on low-end phones.
 */
export function AutoLocate() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (geoFlags.hasAutoLocated()) return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      void detectLocation({ prompt: false });
    };

    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    const id = ric ? ric(run, { timeout: 2500 }) : window.setTimeout(run, 1200);

    return () => {
      cancelled = true;
      const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (ric && cic) cic(id as number);
      else window.clearTimeout(id as number);
    };
  }, []);

  return null;
}
