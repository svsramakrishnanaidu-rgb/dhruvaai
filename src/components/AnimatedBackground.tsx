"use client";
import { useEffect, useRef, useState } from "react";
import { CinematicBackground } from "./CinematicBackground";

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
 * Global background system.
 * On Desktop: Cinematic Moonlit Japan Loop.
 * On Mobile/Low-power: Static atmospheric gradients to preserve battery.
 */
export function AnimatedBackground() {
  const [lite, setLite] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLite(isLowPowerDevice());
  }, []);

  if (!lite) {
    return <CinematicBackground />;
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-midnight-navy">
      {/* Fallback gradient sheet for mobile */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 15% 5%, rgba(227, 25, 55, 0.15), transparent 55%), radial-gradient(900px 600px at 85% 15%, rgba(38, 62, 82, 0.2), transparent 55%)",
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Subtle fog */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: "linear-gradient(to top, var(--midnight-navy), transparent)",
        }}
      />
    </div>
  );
}


