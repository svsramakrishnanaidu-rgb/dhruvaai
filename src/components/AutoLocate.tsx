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

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const useIdle = typeof w.requestIdleCallback === "function";
    const id = useIdle ? w.requestIdleCallback!(run, { timeout: 2500 }) : window.setTimeout(run, 1200);

    return () => {
      cancelled = true;
      if (useIdle && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };

  }, []);

  return null;
}
