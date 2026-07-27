"use client";
/**
 * Futuristic backdrop for the Krish AI page — animated aurora gradients,
 * an abstract neural-network mesh and drifting particles. Pure CSS/SVG so it
 * stays smooth at 60–120 FPS and disappears for reduced-motion users.
 */
import { useMemo } from "react";

export function AIBackdrop() {
  const nodes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: (i * 137.5) % 100,
        y: (i * 61.8) % 100,
        r: 1 + ((i * 7) % 3) * 0.6,
        d: 6 + ((i * 5) % 9),
      })),
    [],
  );

  return (
    <div className="ks-ai-bg" aria-hidden>
      <span className="ks-ai-aurora ks-ai-aurora-a" />
      <span className="ks-ai-aurora ks-ai-aurora-b" />
      <span className="ks-ai-aurora ks-ai-aurora-c" />

      <svg className="ks-ai-mesh" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g stroke="currentColor" strokeWidth="0.08" opacity="0.5">
          {nodes.map((n, i) =>
            nodes.slice(i + 1, i + 4).map((m, j) => (
              <line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} />
            )),
          )}
        </g>
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.r * 0.22}
            fill="currentColor"
            style={{ animation: `ks-node ${n.d}s ease-in-out ${i * 0.19}s infinite` }}
          />
        ))}
      </svg>

      <div className="ks-ai-particles">
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 6.25 + 2) % 100}%`,
              animationDelay: `${i * 0.85}s`,
              animationDuration: `${11 + (i % 6) * 2.4}s`,
            }}
          />
        ))}
      </div>

      <span className="ks-ai-grain" />
    </div>
  );
}
