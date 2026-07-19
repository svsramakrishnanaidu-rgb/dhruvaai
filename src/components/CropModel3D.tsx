"use client";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { Crop } from "@/data/crops/types";

/**
 * Lazy, scroll-reactive Three.js crop model.
 * - Loads only when scrolled into view (IntersectionObserver)
 * - Category-driven procedural geometry so every crop gets a unique look
 * - Cheap: single canvas, low DPR cap, auto-suspends offscreen
 */
const Scene = lazy(() => import("./crop-model-scene").then((m) => ({ default: m.CropModelScene })));

export function CropModel3D({ crop, className }: { crop: Crop; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { setVisible(true); io.disconnect(); break; }
      },
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", minHeight: 260 }}
      aria-hidden="true"
    >
      {visible ? (
        <Suspense fallback={<div className="grid h-full w-full place-items-center text-xs text-muted-foreground">Loading 3D…</div>}>
          <Scene crop={crop} />
        </Suspense>
      ) : null}
    </div>
  );
}
