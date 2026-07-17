"use client";
import { useEffect, useRef } from "react";

/**
 * Cinematic canvas background — floating soft particles + drifting leaves
 * simulated with additive glows. Zero DOM nodes; respects reduced motion.
 */
export function AnimatedBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0, h = 0, dpr = 1;

    type P = { x: number; y: number; r: number; vx: number; vy: number; hue: number; a: number };
    const particles: P[] = [];
    const N = 42;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.35,
        hue: 100 + Math.random() * 60,
        a: 0.25 + Math.random() * 0.4,
      });
    }

    let mx = w / 2, my = h / 2;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      // soft radial spotlight following mouse
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, 420);
      g.addColorStop(0, "rgba(180,255,150,0.10)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.a})`);
        grad.addColorStop(1, "hsla(120, 60%, 40%, 0)");
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* gradient sheet */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 15% 5%, color-mix(in oklab, var(--leaf) 22%, transparent), transparent 55%), radial-gradient(900px 600px at 85% 15%, color-mix(in oklab, var(--sunrise) 20%, transparent), transparent 55%), radial-gradient(1000px 800px at 50% 100%, color-mix(in oklab, var(--sky) 18%, transparent), transparent 60%)",
          animation: "gradient-shift 18s ease-in-out infinite",
          backgroundSize: "200% 200%",
        }}
      />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
      {/* drifting leaves */}
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
