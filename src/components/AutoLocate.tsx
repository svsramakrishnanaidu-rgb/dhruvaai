import { useEffect } from "react";
import { detectLocation, geoFlags, onPermissionChange, startLocationWatch } from "@/lib/geolocate";

/**
 * Silent location resolver.
 *
 * - Runs once per session at idle time so it never competes with first paint
 *   on low-end Android devices.
 * - Never prompts: if permission is still in the "prompt" state the mobile
 *   LocationPermission sheet does the asking from a real tap (Android and iOS
 *   both throttle/ignore programmatic prompts outside a gesture).
 * - Re-resolves immediately if the user grants permission later from the
 *   browser's site-settings panel.
 * - Keeps a lifecycle-aware, visibility-gated watch so the district follows the
 *   user without draining the battery in the background.
 */
export function AutoLocate() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let stopWatch: (() => void) | null = null;

    const run = () => {
      if (cancelled || geoFlags.hasAutoLocated()) return;
      void detectLocation({ prompt: false });
    };

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const useIdle = typeof w.requestIdleCallback === "function";
    const id = useIdle ? w.requestIdleCallback!(run, { timeout: 2500 }) : window.setTimeout(run, 1200);

    // If the user flips the permission on later, pick it up without a reload.
    const offPerm = onPermissionChange((state) => {
      if (cancelled || state !== "granted") return;
      geoFlags.clearAutoLocated();
      void detectLocation({ prompt: false });
      if (!stopWatch) stopWatch = startLocationWatch();
    });

    // Arm the watch after the first pass so it never delays hydration.
    const watchTimer = window.setTimeout(() => {
      if (!cancelled && !stopWatch) stopWatch = startLocationWatch();
    }, 6000);

    return () => {
      cancelled = true;
      if (useIdle && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(id);
      else window.clearTimeout(id);
      window.clearTimeout(watchTimer);
      offPerm();
      stopWatch?.();
    };
  }, []);

  return null;
}
