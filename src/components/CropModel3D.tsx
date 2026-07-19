"use client";
import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import type { Crop } from "@/data/crops/types";
import { useReducedMotion } from "@/lib/reduced-motion";

/**
 * Lazy, scroll-reactive Three.js crop model.
 * - Loads only when scrolled into view (IntersectionObserver).
 * - Predictively prefetches the scene chunk on idle so the first visible
 *   crop card feels instant.
 * - Resilient: falls back to a static illustration if WebGL is unavailable
 *   or if the scene module fails to load / crashes at runtime.
 * - Honours prefers-reduced-motion (rotation is disabled inside the scene).
 */
const Scene = lazy(() => import("./crop-model-scene").then((m) => ({ default: m.CropModelScene })));

// Prefetch the 3D chunk during browser idle so first paint stays cheap
// but the model chunk is ready before the user scrolls to it.
let prefetched = false;
function prefetchScene() {
  if (prefetched || typeof window === "undefined") return;
  prefetched = true;
  const run = () => { void import("./crop-model-scene"); };
  const idle = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined;
  if (idle) idle(run, { timeout: 2500 });
  else setTimeout(run, 1500);
}

function detectWebGL(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl") || (c as any).getContext("experimental-webgl"));
  } catch { return false; }
}

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Fallback({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} illustration`}
      className="grid h-full w-full place-items-center rounded-2xl"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 60%), color-mix(in oklab, var(--background) 80%, transparent)",
      }}
    >
      <div className="text-center">
        <div className="text-6xl md:text-7xl drop-shadow-lg" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,.35))" }}>{emoji}</div>
        <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">Static preview</div>
      </div>
    </div>
  );
}

export function CropModel3D({ crop, className }: { crop: Crop; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [errored, setErrored] = useState(false);
  const reducedMotion = useReducedMotion();
  const webglOk = useRef<boolean>(true);
  if (typeof window !== "undefined") webglOk.current = detectWebGL();

  useEffect(() => {
    if (!ref.current) return;
    // Kick off predictive prefetch as soon as the component mounts.
    prefetchScene();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { setVisible(true); io.disconnect(); break; }
      },
      { rootMargin: "300px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const canRender3D = webglOk.current && !errored;

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", minHeight: 260 }}
      aria-hidden={canRender3D ? "true" : undefined}
    >
      {visible && canRender3D ? (
        <SceneBoundary onError={() => setErrored(true)}>
          <Suspense fallback={<Fallback emoji={crop.emoji} label={crop.name} />}>
            <Scene crop={crop} reducedMotion={reducedMotion} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <Fallback emoji={crop.emoji} label={crop.name} />
      )}
    </div>
  );
}
