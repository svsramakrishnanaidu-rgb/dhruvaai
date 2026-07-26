import * as React from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Viewport class gate for *mounting* (not just hiding) layout trees.
 *
 * Returns `null` on the server and for the very first client render so the
 * hydrated markup matches SSR exactly. After mount it resolves to a boolean,
 * letting callers unmount the tree that isn't in use instead of leaving it in
 * the DOM behind `hidden lg:block` — which on phones still costs layout,
 * image decoding, memory and reconciliation on every render.
 */
export function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}
