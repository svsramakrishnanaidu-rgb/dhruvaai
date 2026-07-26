"use client";
import { useEffect, useRef, useState } from "react";

/** Cheap device-capability probe used to scale the effect budget down on phones. */
function isLowPowerDevice() {
  if (typeof window === "undefined") return true;
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  const smallScreen = window.matchMedia("(max-width: 1023px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const weak = (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4;
  return smallScreen || coarse || weak;
}

/**
 * Cinematic canvas background — floating soft particles.
 * Scales particle count, DPR and blur layers to the device, pauses entirely
 * when the tab is hidden, and respects reduced-motion.
 */
export function AnimatedBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [lite, setLite] = useState(true);

  useEffect(() => {
    const low = isLowPowerDevice();
    setLite(low);

    // Phones/tablets: no canvas loop at all. A full-viewport clear + redraw
    // every frame is pure GPU/battery cost for an effect nobody notices on a
    // 6" screen; the static gradient sheet below carries the look instead.
    if (low) return;

    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;


    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let w = 0, h = 0, dpr = 1;

    type P = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number };
    const particles: P[] = [];
    const N = low ? 14 : 42;

    const resize = () => {
      // Capping DPR is the single biggest win on high-DPI phones.
      dpr = Math.min(window.devicePixelRatio || 1, low ? 1.25 : 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.35,
        hue: [280, 195, 320, 155, 240][Math.floor(Math.random() * 5)],
        a: 0.25 + Math.random() * 0.4,
      });
    }

    // Mouse spotlight is pointless (and costly) on touch devices.
    let mx = w / 2, my = h / 2;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    if (!low) window.addEventListener("mousemove", onMove, { passive: true });

    // Half frame-rate on low-power devices: visually identical, half the work.
    const minDelta = low ? 1000 / 30 : 0;
    let last = 0;

    const tick = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (now - last < minDelta) return;
      last = now;

      ctx.clearRect(0, 0, w, h);

      if (!low) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 420);
        g.addColorStop(0, "rgba(140,120,255,0.14)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (low) {
          // Flat fill instead of a per-particle radial gradient (no allocation).
          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.a * 0.5})`;
          ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          grad.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.a})`);
          grad.addColorStop(1, "hsla(120, 60%, 40%, 0)");
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    raf = requestAnimationFrame(tick);

    // Stop burning battery/CPU when the app is backgrounded.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* gradient sheet — animation disabled on low-power devices */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 15% 5%, color-mix(in oklab, var(--leaf) 22%, transparent), transparent 55%), radial-gradient(900px 600px at 85% 15%, color-mix(in oklab, var(--sunrise) 20%, transparent), transparent 55%), radial-gradient(1000px 800px at 50% 100%, color-mix(in oklab, var(--sky) 18%, transparent), transparent 60%)",
          animation: lite ? undefined : "gradient-shift 18s ease-in-out infinite",
          backgroundSize: "200% 200%",
        }}
      />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />

      {/* aurora blobs — heavy blur, so only one static blob on phones */}
      <div
        aria-hidden
        className={`absolute -left-24 top-1/3 rounded-full opacity-40 ${lite ? "h-[320px] w-[320px] blur-2xl" : "h-[520px] w-[520px] blur-3xl"}`}
        style={{
          background: "radial-gradient(circle, color-mix(in oklab, var(--primary) 60%, transparent), transparent 65%)",
          animation: lite ? undefined : "float-y 12s ease-in-out infinite",
          willChange: lite ? undefined : "transform",
        }}
      />
      {!lite && (
        <>
          <div
            aria-hidden
            className="absolute right-[-8rem] top-10 h-[440px] w-[440px] rounded-full opacity-35 blur-3xl"
            style={{
              background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 55%, transparent), transparent 65%)",
              animation: "float-y 16s ease-in-out infinite reverse",
            }}
          />
          <div
            aria-hidden
            className="absolute bottom-[-6rem] left-1/3 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
            style={{
              background: "radial-gradient(circle, color-mix(in oklab, var(--monsoon) 60%, transparent), transparent 65%)",
              animation: "float-y 20s ease-in-out infinite",
            }}
          />
          {/* drifting leaves — desktop only */}
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute text-3xl opacity-60"
              style={{
                top: `${10 + i * 15}%`,
                left: 0,
                animation: `drift ${22 + i * 4}s linear ${i * 3}s infinite`,
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
              }}
            >
              {i % 2 ? "🍃" : "🌿"}
            </span>
          ))}
        </>
      )}

      {/* fog */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, color-mix(in oklab, var(--background) 60%, transparent), transparent)",
        }}
      />
    </div>
  );
}

