/**
 * Full-bleed animated weather background that reacts to the current
 * weather kind (clear-day, rain, thunder, fog, snow, …). Canvas-based,
 * respects prefers-reduced-motion, layered under a soft gradient.
 */
import { useEffect, useRef } from "react";
import type { WeatherKind } from "@/lib/live-weather";

const SKY: Record<WeatherKind, string> = {
  "clear-day":
    "linear-gradient(180deg, #4aa3ff 0%, #86c6ff 45%, #f9d976 100%)",
  "clear-night":
    "linear-gradient(180deg, #0b1023 0%, #1b234a 55%, #2a2f5c 100%)",
  cloudy:
    "linear-gradient(180deg, #6b7c93 0%, #8ea0b5 60%, #b7c4d3 100%)",
  overcast:
    "linear-gradient(180deg, #4b5769 0%, #6b7889 60%, #8894a5 100%)",
  fog: "linear-gradient(180deg, #7d8794 0%, #a9b3bf 60%, #d6dae0 100%)",
  drizzle:
    "linear-gradient(180deg, #46617a 0%, #6c8298 60%, #94a7bb 100%)",
  rain: "linear-gradient(180deg, #263449 0%, #43597a 55%, #6c8299 100%)",
  snow: "linear-gradient(180deg, #6b7d94 0%, #b7c4d3 55%, #e8eef5 100%)",
  thunder:
    "linear-gradient(180deg, #14162a 0%, #2b2e58 55%, #3d3f6b 100%)",
};

export function WeatherBackground({ kind }: { kind: WeatherKind }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Layer particles based on kind
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const drops: P[] = [];
    const flakes: P[] = [];
    const clouds: P[] = [];
    const stars: P[] = [];
    let sunPulse = 0;
    let lightningTimer = 0;

    const isRain = kind === "rain" || kind === "drizzle" || kind === "thunder";
    const dropCount = kind === "thunder" ? 260 : kind === "rain" ? 200 : kind === "drizzle" ? 90 : 0;
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * (w + 200) - 100,
        y: Math.random() * h,
        vx: -1.2,
        vy: 12 + Math.random() * 8,
        r: 1 + Math.random(),
        a: 0.35 + Math.random() * 0.4,
      });
    }
    const flakeCount = kind === "snow" ? 140 : 0;
    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.6 + Math.random() * 1.4,
        r: 1.2 + Math.random() * 2.6,
        a: 0.6 + Math.random() * 0.4,
      });
    }
    const cloudCount = ["cloudy", "overcast", "fog", "drizzle", "rain", "thunder"].includes(kind) ? 6 : kind === "clear-day" ? 2 : 0;
    for (let i = 0; i < cloudCount; i++) {
      clouds.push({
        x: Math.random() * w,
        y: 40 + Math.random() * (h * 0.4),
        vx: 0.15 + Math.random() * 0.25,
        vy: 0,
        r: 60 + Math.random() * 90,
        a: kind === "fog" ? 0.28 : kind === "overcast" || kind === "thunder" ? 0.35 : 0.5,
      });
    }
    if (kind === "clear-night") {
      for (let i = 0; i < 90; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.7,
          vx: 0, vy: 0,
          r: Math.random() * 1.3 + 0.3,
          a: 0.4 + Math.random() * 0.6,
        });
      }
    }

    const drawSun = () => {
      const cx = w * 0.82, cy = h * 0.25;
      sunPulse += 0.02;
      const R = 46 + Math.sin(sunPulse) * 2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 4);
      g.addColorStop(0, "rgba(255,236,150,0.95)");
      g.addColorStop(0.25, "rgba(255,200,90,0.55)");
      g.addColorStop(1, "rgba(255,200,90,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,244,200,1)";
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    };
    const drawMoon = () => {
      const cx = w * 0.82, cy = h * 0.22;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      g.addColorStop(0, "rgba(220,230,255,0.5)");
      g.addColorStop(1, "rgba(220,230,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 180, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(240,242,255,1)";
      ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(11,16,35,1)";
      ctx.beginPath(); ctx.arc(cx - 14, cy - 6, 40, 0, Math.PI * 2); ctx.fill();
    };
    const drawCloud = (c: P) => {
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      g.addColorStop(0, `rgba(255,255,255,${c.a})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c.x + c.r * 0.5, c.y + 8, c.r * 0.75, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c.x - c.r * 0.55, c.y + 6, c.r * 0.7, 0, Math.PI * 2); ctx.fill();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      if (kind === "clear-day") drawSun();
      if (kind === "clear-night") {
        drawMoon();
        for (const s of stars) {
          ctx.fillStyle = `rgba(255,255,255,${s.a * (0.6 + Math.sin(sunPulse + s.x) * 0.4)})`;
          ctx.fillRect(s.x, s.y, s.r, s.r);
        }
        sunPulse += 0.03;
      }

      for (const c of clouds) {
        c.x += c.vx;
        if (c.x - c.r > w) c.x = -c.r;
        drawCloud(c);
      }

      if (kind === "fog") {
        for (let i = 0; i < 4; i++) {
          const y = h * (0.3 + i * 0.18);
          const g = ctx.createLinearGradient(0, y - 40, 0, y + 40);
          g.addColorStop(0, "rgba(255,255,255,0)");
          g.addColorStop(0.5, "rgba(255,255,255,0.35)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, y - 40, w, 80);
        }
      }

      if (isRain) {
        ctx.strokeStyle = "rgba(200,220,255,0.55)";
        ctx.lineWidth = 1.2;
        for (const d of drops) {
          d.x += d.vx; d.y += d.vy;
          if (d.y > h) { d.y = -10; d.x = Math.random() * (w + 200) - 100; }
          if (d.x < -20) d.x = w + 20;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 4, d.y - 12);
          ctx.stroke();
        }
      }

      if (kind === "snow") {
        for (const f of flakes) {
          f.x += f.vx + Math.sin((f.y + sunPulse * 30) * 0.02) * 0.5;
          f.y += f.vy;
          if (f.y > h) { f.y = -6; f.x = Math.random() * w; }
          ctx.fillStyle = `rgba(255,255,255,${f.a})`;
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
        }
        sunPulse += 0.02;
      }

      if (kind === "thunder") {
        lightningTimer -= 1;
        if (lightningTimer <= 0 && Math.random() < 0.008) {
          if (flashRef.current) {
            flashRef.current.style.opacity = "0.85";
            setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = "0"; }, 90);
            setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = "0.55"; }, 160);
            setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = "0"; }, 240);
          }
          lightningTimer = 180 + Math.random() * 400;
        }
      }

      if (!reduce) raf = requestAnimationFrame(tick);
    };
    if (reduce) tick();
    else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [kind]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <div className="absolute inset-0" style={{ background: SKY[kind] }} />
      <canvas ref={cvs} className="absolute inset-0 h-full w-full" aria-hidden />
      <div
        ref={flashRef}
        className="absolute inset-0 transition-opacity duration-100"
        style={{ background: "white", opacity: 0 }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 40%, color-mix(in oklab, var(--background) 85%, transparent) 100%)",
        }}
      />
    </div>
  );
}
