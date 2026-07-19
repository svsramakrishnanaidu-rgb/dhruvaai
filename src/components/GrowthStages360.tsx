"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { GrowthStage } from "@/data/crop-knowledge";

/**
 * 360°-style stage previewer.
 * - Drag horizontally (mouse or touch) to scrub through growth stages.
 * - Pinch or wheel to zoom the active stage image.
 * - Arrow keys ← → for accessibility.
 */
export function GrowthStages360({ stages, cropName }: { stages: GrowthStage[]; cropName: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; startI: number; mode: "scrub" | "pan" } | null>(null);
  const pinchRef = useRef<{ d: number; z: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const n = stages.length;
  const clamp = (v: number) => (v + n) % n;
  const stage = stages[i];

  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== containerRef.current) return;
      if (e.key === "ArrowLeft") { setI((v) => clamp(v - 1)); reset(); }
      if (e.key === "ArrowRight") { setI((v) => clamp(v + 1)); reset(); }
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, z + 0.25));
      if (e.key === "-") setZoom((z) => Math.max(1, z - 0.25));
      if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, startI: i, mode: zoom > 1 ? "pan" : "scrub" };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    if (dragRef.current.mode === "scrub") {
      const w = containerRef.current?.clientWidth ?? 600;
      const step = w / n;
      const delta = Math.round(-dx / step);
      setI(clamp(dragRef.current.startI + delta));
    } else {
      setPan((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };
  const onPointerUp = () => { dragRef.current = null; };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || Math.abs(e.deltaY) > 20) {
      setZoom((z) => Math.max(1, Math.min(3, z + (e.deltaY < 0 ? 0.15 : -0.15))));
    }
  };

  // Basic pinch (two-pointer)
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchRef.current = { d, z: zoom };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const nextZ = Math.max(1, Math.min(3, pinchRef.current.z * (d / pinchRef.current.d)));
      setZoom(nextZ);
    }
  };
  const onTouchEnd = () => { pinchRef.current = null; };

  return (
    <div className="card-elegant overflow-hidden p-0">
      <div
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-label={`${cropName} 360 growth stage viewer`}
        className="relative aspect-[16/10] w-full cursor-grab select-none overflow-hidden bg-black/40 outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: zoom > 1 ? "none" : "pan-y" }}
      >
        {stages.map((s, idx) => (
          <img
            key={s.key}
            src={s.image}
            alt={`${cropName} · ${s.label}`}
            loading={idx === 0 ? "eager" : "lazy"}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{
              opacity: idx === i ? 1 : 0,
              transform: idx === i ? `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` : undefined,
              transition: dragRef.current?.mode === "pan" ? "opacity 300ms ease" : undefined,
            }}
          />
        ))}

        {/* Stage badge */}
        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur">
          {stage.label} · Day {stage.days}
        </div>

        {/* Nav arrows */}
        <button
          onClick={() => { setI((v) => clamp(v - 1)); reset(); }}
          aria-label="Previous stage"
          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/70 backdrop-blur hover:bg-background"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => { setI((v) => clamp(v + 1)); reset(); }}
          aria-label="Next stage"
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/70 backdrop-blur hover:bg-background"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex gap-1">
          <button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(1, z - 0.25))} className="grid h-9 w-9 place-items-center rounded-full bg-background/70 backdrop-blur hover:bg-background"><ZoomOut className="h-4 w-4" /></button>
          <button aria-label="Reset view" onClick={reset} className="grid h-9 w-9 place-items-center rounded-full bg-background/70 backdrop-blur hover:bg-background"><RotateCcw className="h-4 w-4" /></button>
          <button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="grid h-9 w-9 place-items-center rounded-full bg-background/70 backdrop-blur hover:bg-background"><ZoomIn className="h-4 w-4" /></button>
        </div>

        {/* Scrubber dots */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {stages.map((s, idx) => (
            <button
              key={s.key}
              aria-label={`Go to ${s.label}`}
              onClick={() => { setI(idx); reset(); }}
              className="h-2 rounded-full transition-all"
              style={{
                width: idx === i ? 28 : 10,
                background: idx === i ? "var(--primary)" : "color-mix(in oklab, var(--foreground) 30%, transparent)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
        <div>
          <h3 className="font-display text-xl font-bold">{stage.label}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>Drag · Arrows · Pinch · Wheel</div>
          <div className="mt-1">{i + 1} / {n}</div>
        </div>
      </div>
    </div>
  );
}
